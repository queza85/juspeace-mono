import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CertificateStatus,
  RegistrationStatus,
  SaleStatus,
} from '@prisma/client';
import {
  CertificateResponseDto,
  RegisterPurchaseDto,
  RegistrationLookupQueryDto,
  RegistrationPreviewResponseDto,
} from '../dto/registry.dto';
import type { IRegistryRepository } from '../registry.repository.interface';
import { REGISTRY_REPOSITORY } from '../registry.repository.interface';
import { CertificateNumberService } from './certificate-number.service';
import { RegistrationTokenService } from './registration-token.service';
import { SalesService } from './sales.service';

@Injectable()
export class RegistrationsService {
  constructor(
    @Inject(REGISTRY_REPOSITORY)
    private readonly registryRepository: IRegistryRepository,
    private readonly registrationTokenService: RegistrationTokenService,
    private readonly certificateNumberService: CertificateNumberService,
    private readonly salesService: SalesService,
  ) {}

  async previewByToken(token: string): Promise<RegistrationPreviewResponseDto> {
    const tokenRecord = await this.findValidTokenRecord(token);
    const sale = tokenRecord.sale;

    this.assertSaleEligibleForRegistration(
      sale.status,
      sale.registrationStatus,
    );

    return {
      saleId: sale.id,
      sellerName: sale.authorizedSeller.name,
      productName: sale.product.name,
      locationLabel: sale.authorizedSeller.locationLabel,
      marketCode: sale.authorizedSeller.market.code,
      quantity: sale.quantity,
      registrationStatus: sale.registrationStatus,
    };
  }

  async registerByToken(
    token: string,
    dto: RegisterPurchaseDto,
  ): Promise<CertificateResponseDto> {
    const tokenRecord = await this.findValidTokenRecord(token);
    const sale = tokenRecord.sale;

    this.assertSaleEligibleForRegistration(
      sale.status,
      sale.registrationStatus,
    );

    if (sale.registration) {
      throw new BadRequestException('SALE_ALREADY_REGISTERED');
    }

    const registration = await this.registryRepository.createRegistration({
      saleId: sale.id,
      customerEmail: dto.customerEmail,
      customerName: dto.customerName,
      marketingConsent: dto.marketingConsent ?? false,
      status: RegistrationStatus.REGISTERED,
    });

    const certificateNo = this.certificateNumberService.format(
      sale.authorizedSeller.market.code,
    );

    const certificate = await this.registryRepository.createCertificate({
      registrationId: registration.id,
      certificateNo,
      productName: sale.product.name,
      marketCode: sale.authorizedSeller.market.code,
      sellerName: sale.authorizedSeller.name,
      purchaseChannel: sale.channel,
      registrationDate: registration.registeredAt,
    });

    await this.registryRepository.updateSaleStatus(sale.id, {
      registrationStatus: RegistrationStatus.REGISTERED,
    });

    await this.registryRepository.consumeRegistrationToken(tokenRecord.id);

    return this.toCertificateResponse(certificate);
  }

  async lookup(query: RegistrationLookupQueryDto): Promise<{
    sale: ReturnType<SalesService['toSaleResponse']>;
    certificate: CertificateResponseDto | null;
  }> {
    const sale = await this.registryRepository.findSaleByOrderReferenceAndEmail(
      query.orderReference,
      query.email,
    );

    if (!sale) {
      throw new NotFoundException('OFFICIAL_PURCHASE_NOT_FOUND');
    }

    return {
      sale: this.salesService.toSaleResponse(sale),
      certificate: sale.registration?.certificate
        ? this.toCertificateResponse(sale.registration.certificate)
        : null,
    };
  }

  private async findValidTokenRecord(token: string) {
    const tokenHash = this.registrationTokenService.hashToken(token);
    const tokenRecord =
      await this.registryRepository.findActiveRegistrationTokenByHash(
        tokenHash,
      );

    if (!tokenRecord) {
      throw new NotFoundException('REGISTRATION_TOKEN_INVALID');
    }

    if (tokenRecord.expiresAt.getTime() <= Date.now()) {
      throw new BadRequestException('REGISTRATION_TOKEN_EXPIRED');
    }

    return tokenRecord;
  }

  private assertSaleEligibleForRegistration(
    saleStatus: SaleStatus,
    registrationStatus: RegistrationStatus,
  ): void {
    if (saleStatus === SaleStatus.VOID) {
      throw new BadRequestException('SALE_VOIDED');
    }

    if (saleStatus === SaleStatus.REFUNDED) {
      throw new BadRequestException('SALE_REFUNDED');
    }

    if (saleStatus !== SaleStatus.COMPLETED) {
      throw new BadRequestException('SALE_NOT_COMPLETED');
    }

    if (registrationStatus === RegistrationStatus.REVOKED) {
      throw new BadRequestException('SALE_REGISTRATION_REVOKED');
    }
  }

  private toCertificateResponse(certificate: {
    certificateNo: string;
    status: CertificateStatus;
    productName: string;
    collectionName: string | null;
    marketCode: string;
    sellerName: string;
    purchaseChannel: CertificateResponseDto['purchaseChannel'];
    registrationDate: Date;
    issuedAt: Date;
  }): CertificateResponseDto {
    return {
      certificateNo: certificate.certificateNo,
      status: certificate.status,
      productName: certificate.productName,
      collectionName: certificate.collectionName,
      marketCode: certificate.marketCode,
      sellerName: certificate.sellerName,
      purchaseChannel: certificate.purchaseChannel,
      registrationDate: certificate.registrationDate,
      issuedAt: certificate.issuedAt,
    };
  }
}
