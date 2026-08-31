import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CertificateStatus,
  PaymentMethod,
  ProductStatus,
  RegistrationStatus,
  SaleChannel,
  SaleStatus,
  UserRole,
} from '@prisma/client';
import type { AuthUser } from '../../auth/auth.repository.interface';
import {
  CompleteOnlineSaleDto,
  ListSalesQueryDto,
  PaginatedSalesResponseDto,
  QuickSaleDto,
  QuickSaleResponseDto,
  RegistrationTokenResponseDto,
  SaleResponseDto,
} from '../dto/registry.dto';
import type {
  IRegistryRepository,
  SaleWithRelations,
} from '../registry.repository.interface';
import { REGISTRY_REPOSITORY } from '../registry.repository.interface';
import { CertificateNumberService } from './certificate-number.service';
import { RegistrationTokenService } from './registration-token.service';

@Injectable()
export class SalesService {
  constructor(
    @Inject(REGISTRY_REPOSITORY)
    private readonly registryRepository: IRegistryRepository,
    private readonly registrationTokenService: RegistrationTokenService,
    private readonly certificateNumberService: CertificateNumberService,
  ) {}

  async quickSale(
    user: AuthUser,
    dto: QuickSaleDto,
  ): Promise<QuickSaleResponseDto> {
    const seller = await this.requireSellerForUser(user);
    const product = await this.requireActiveProduct(dto.productId);

    await this.ensureInventoryAvailable(
      seller.id,
      product.id,
      dto.quantity ?? 1,
      product.stock,
    );

    const sale = await this.registryRepository.createSale({
      productId: product.id,
      authorizedSellerId: seller.id,
      channel: dto.channel ?? SaleChannel.RETAIL,
      quantity: dto.quantity ?? 1,
      unitPriceCents: product.priceCents,
      currency: product.currency,
      paymentMethod: dto.paymentMethod,
      soldByUserId: user.id,
      status: SaleStatus.COMPLETED,
      registrationStatus: RegistrationStatus.WAITING,
      soldAt: new Date(),
    });

    await this.registryRepository.decrementProductStock(
      product.id,
      dto.quantity ?? 1,
    );

    const tokenPayload = await this.issueRegistrationToken(sale.id);

    return {
      ...this.toSaleResponse(sale),
      registrationToken: tokenPayload.registrationToken,
      registrationPath: tokenPayload.registrationPath,
    };
  }

  async completeOnlineSale(
    dto: CompleteOnlineSaleDto,
  ): Promise<SaleResponseDto> {
    const seller = await this.registryRepository.findSellerById(
      dto.authorizedSellerId,
    );

    if (!seller || !seller.isActive) {
      throw new NotFoundException('AUTHORIZED_SELLER_NOT_FOUND');
    }

    const product = await this.requireActiveProduct(dto.productId);

    await this.ensureInventoryAvailable(
      seller.id,
      product.id,
      dto.quantity ?? 1,
      product.stock,
    );

    const sale = await this.registryRepository.createSale({
      productId: product.id,
      authorizedSellerId: seller.id,
      channel: SaleChannel.OFFICIAL_ONLINE,
      quantity: dto.quantity ?? 1,
      unitPriceCents: product.priceCents,
      currency: product.currency,
      paymentMethod: PaymentMethod.ONLINE_PAYMENT,
      status: SaleStatus.COMPLETED,
      registrationStatus: RegistrationStatus.REGISTERED,
      soldAt: new Date(),
      orderReference: dto.orderReference,
    });

    await this.registryRepository.decrementProductStock(
      product.id,
      dto.quantity ?? 1,
    );

    const registration = await this.registryRepository.createRegistration({
      saleId: sale.id,
      customerEmail: dto.customerEmail,
      customerName: dto.customerName,
      marketingConsent: dto.marketingConsent ?? false,
      status: RegistrationStatus.REGISTERED,
    });

    const certificateNo = this.certificateNumberService.format(
      seller.market.code,
    );

    const certificate = await this.registryRepository.createCertificate({
      registrationId: registration.id,
      certificateNo,
      productName: product.name,
      marketCode: seller.market.code,
      sellerName: seller.name,
      purchaseChannel: SaleChannel.OFFICIAL_ONLINE,
      registrationDate: registration.registeredAt,
    });

    const refreshed = await this.registryRepository.findSaleById(sale.id);

    if (!refreshed) {
      throw new NotFoundException('SALE_NOT_FOUND');
    }

    return {
      ...this.toSaleResponse(refreshed),
      certificateNo: certificate.certificateNo,
    };
  }

  async listSales(
    user: AuthUser,
    query: ListSalesQueryDto,
  ): Promise<PaginatedSalesResponseDto> {
    let authorizedSellerId: string | undefined;

    if (user.role === UserRole.DISTRIBUTOR) {
      const seller = await this.requireSellerForUser(user);
      authorizedSellerId = seller.id;
    }

    const options = {
      authorizedSellerId,
      status: query.status,
      registrationStatus: query.registrationStatus,
      limit: query.limit,
      offset: query.offset,
    };

    const [items, total] = await Promise.all([
      this.registryRepository.findSales(options),
      this.registryRepository.countSales(options),
    ]);

    return {
      items: items.map((sale) => this.toSaleResponse(sale)),
      total,
      limit: query.limit ?? 20,
      offset: query.offset ?? 0,
    };
  }

  async getSale(user: AuthUser, saleId: string): Promise<SaleResponseDto> {
    const sale = await this.requireSale(saleId);

    if (user.role === UserRole.DISTRIBUTOR) {
      const seller = await this.requireSellerForUser(user);

      if (sale.authorizedSellerId !== seller.id) {
        throw new ForbiddenException('SALE_ACCESS_DENIED');
      }
    }

    return this.toSaleResponse(sale);
  }

  async voidSale(user: AuthUser, saleId: string): Promise<SaleResponseDto> {
    const sale = await this.requireSale(saleId);

    if (user.role === UserRole.DISTRIBUTOR) {
      const seller = await this.requireSellerForUser(user);

      if (sale.authorizedSellerId !== seller.id) {
        throw new ForbiddenException('SALE_ACCESS_DENIED');
      }
    }

    if (sale.status !== SaleStatus.COMPLETED) {
      throw new BadRequestException('SALE_NOT_VOIDABLE');
    }

    if (sale.registrationStatus === RegistrationStatus.REGISTERED) {
      throw new BadRequestException('SALE_ALREADY_REGISTERED');
    }

    await this.registryRepository.invalidateActiveTokensForSale(sale.id);

    const updated = await this.registryRepository.updateSaleStatus(sale.id, {
      status: SaleStatus.VOID,
      registrationStatus: RegistrationStatus.REVOKED,
      voidedAt: new Date(),
    });

    return this.toSaleResponse(updated);
  }

  async refundSale(saleId: string): Promise<SaleResponseDto> {
    const sale = await this.requireSale(saleId);

    if (sale.status !== SaleStatus.COMPLETED) {
      throw new BadRequestException('SALE_NOT_REFUNDABLE');
    }

    await this.registryRepository.invalidateActiveTokensForSale(sale.id);

    if (sale.registration) {
      await this.registryRepository.revokeRegistration(sale.registration.id);

      if (sale.registration.certificate) {
        await this.registryRepository.updateCertificateStatus(
          sale.registration.certificate.id,
          CertificateStatus.REFUNDED,
        );
      }
    }

    const updated = await this.registryRepository.updateSaleStatus(sale.id, {
      status: SaleStatus.REFUNDED,
      registrationStatus: RegistrationStatus.REVOKED,
      refundedAt: new Date(),
    });

    return this.toSaleResponse(updated);
  }

  async issueRegistrationTokenForSale(
    user: AuthUser,
    saleId: string,
  ): Promise<RegistrationTokenResponseDto> {
    const sale = await this.requireSale(saleId);
    const seller = await this.requireSellerForUser(user);

    if (sale.authorizedSellerId !== seller.id) {
      throw new ForbiddenException('SALE_ACCESS_DENIED');
    }

    if (sale.status !== SaleStatus.COMPLETED) {
      throw new BadRequestException('SALE_NOT_COMPLETED');
    }

    if (sale.registrationStatus === RegistrationStatus.REGISTERED) {
      throw new BadRequestException('SALE_ALREADY_REGISTERED');
    }

    if (sale.registrationStatus === RegistrationStatus.REVOKED) {
      throw new BadRequestException('SALE_REGISTRATION_REVOKED');
    }

    return this.issueRegistrationToken(sale.id);
  }

  private async issueRegistrationToken(
    saleId: string,
  ): Promise<RegistrationTokenResponseDto> {
    await this.registryRepository.invalidateActiveTokensForSale(saleId);

    const issued = this.registrationTokenService.issue();

    await this.registryRepository.createRegistrationToken({
      saleId,
      tokenHash: issued.tokenHash,
      expiresAt: issued.expiresAt,
    });

    return {
      registrationToken: issued.rawToken,
      registrationPath: `/register/${issued.rawToken}`,
      expiresAt: issued.expiresAt,
    };
  }

  private async requireSellerForUser(user: AuthUser) {
    const seller = await this.registryRepository.findSellerByUserId(user.id);

    if (!seller) {
      throw new ForbiddenException('SELLER_NOT_LINKED');
    }

    return seller;
  }

  private async requireActiveProduct(productId: string) {
    const product = await this.registryRepository.findProductById(productId);

    if (!product || product.status !== ProductStatus.ACTIVE) {
      throw new NotFoundException('PRODUCT_NOT_FOUND');
    }

    return product;
  }

  private async ensureInventoryAvailable(
    authorizedSellerId: string,
    productId: string,
    quantity: number,
    productStock: number,
  ): Promise<void> {
    const allocation = await this.registryRepository.findAllocation(
      authorizedSellerId,
      productId,
    );

    if (allocation) {
      const soldQuantity =
        await this.registryRepository.countCompletedSalesForSellerProduct(
          authorizedSellerId,
          productId,
        );
      const remaining = allocation.allocatedQuantity - soldQuantity;

      if (remaining < quantity) {
        throw new BadRequestException('INSUFFICIENT_ALLOCATED_INVENTORY');
      }

      return;
    }

    if (productStock < quantity) {
      throw new BadRequestException('INSUFFICIENT_PRODUCT_STOCK');
    }
  }

  private async requireSale(saleId: string): Promise<SaleWithRelations> {
    const sale = await this.registryRepository.findSaleById(saleId);

    if (!sale) {
      throw new NotFoundException('SALE_NOT_FOUND');
    }

    return sale;
  }

  toSaleResponse(sale: SaleWithRelations): SaleResponseDto {
    return {
      id: sale.id,
      productId: sale.productId,
      productName: sale.product.name,
      authorizedSellerId: sale.authorizedSellerId,
      sellerName: sale.authorizedSeller.name,
      marketCode: sale.authorizedSeller.market.code,
      channel: sale.channel,
      quantity: sale.quantity,
      unitPriceCents: sale.unitPriceCents,
      currency: sale.currency,
      paymentMethod: sale.paymentMethod,
      status: sale.status,
      registrationStatus: sale.registrationStatus,
      orderReference: sale.orderReference,
      soldAt: sale.soldAt,
      certificateNo: sale.registration?.certificate?.certificateNo ?? null,
    };
  }
}
