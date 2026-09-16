import { Injectable } from '@nestjs/common';
import {
  CertificateStatus,
  Prisma,
  RegistrationStatus,
  SaleStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCertificateInput,
  CreateRegistrationInput,
  CreateRegistrationTokenInput,
  CreateSaleInput,
  IRegistryRepository,
  ListSalesOptions,
  RegistryDashboardStats,
  SaleWithRelations,
  RegistrationWithCertificate,
} from './registry.repository.interface';

const saleInclude = {
  product: true,
  authorizedSeller: { include: { market: true } },
  registration: { include: { certificate: true } },
} satisfies Prisma.SaleInclude;

@Injectable()
export class PrismaRegistryRepository implements IRegistryRepository {
  constructor(private readonly prisma: PrismaService) {}

  findSellerByUserId(userId: string) {
    return this.prisma.authorizedSeller.findFirst({
      where: { userId, isActive: true },
      include: { market: true },
    });
  }

  findSellerById(id: string) {
    return this.prisma.authorizedSeller.findUnique({
      where: { id },
      include: { market: true },
    });
  }

  findProductById(id: string) {
    return this.prisma.product.findUnique({ where: { id } });
  }

  findAllocation(authorizedSellerId: string, productId: string) {
    return this.prisma.inventoryAllocation.findUnique({
      where: {
        authorizedSellerId_productId: { authorizedSellerId, productId },
      },
    });
  }

  async countCompletedSalesForSellerProduct(
    authorizedSellerId: string,
    productId: string,
  ): Promise<number> {
    const aggregate = await this.prisma.sale.aggregate({
      where: {
        authorizedSellerId,
        productId,
        status: SaleStatus.COMPLETED,
      },
      _sum: { quantity: true },
    });

    return aggregate._sum.quantity ?? 0;
  }

  async decrementProductStock(
    productId: string,
    quantity: number,
  ): Promise<void> {
    await this.prisma.product.update({
      where: { id: productId },
      data: { stock: { decrement: quantity } },
    });
  }

  async createSale(input: CreateSaleInput): Promise<SaleWithRelations> {
    return this.prisma.sale.create({
      data: {
        productId: input.productId,
        authorizedSellerId: input.authorizedSellerId,
        channel: input.channel,
        quantity: input.quantity,
        unitPriceCents: input.unitPriceCents,
        currency: input.currency,
        paymentMethod: input.paymentMethod,
        soldByUserId: input.soldByUserId,
        orderReference: input.orderReference,
        status: input.status,
        registrationStatus: input.registrationStatus,
        soldAt: input.soldAt,
      },
      include: saleInclude,
    });
  }

  findSaleById(id: string) {
    return this.prisma.sale.findUnique({
      where: { id },
      include: saleInclude,
    });
  }

  findSales(options: ListSalesOptions) {
    return this.prisma.sale.findMany({
      where: this.buildSaleWhere(options),
      include: saleInclude,
      orderBy: { createdAt: 'desc' },
      take: options.limit,
      skip: options.offset,
    });
  }

  countSales(options: ListSalesOptions) {
    return this.prisma.sale.count({ where: this.buildSaleWhere(options) });
  }

  async updateSaleStatus(
    id: string,
    data: Partial<{
      status: SaleStatus;
      registrationStatus: RegistrationStatus;
      voidedAt: Date | null;
      refundedAt: Date | null;
    }>,
  ): Promise<SaleWithRelations> {
    return this.prisma.sale.update({
      where: { id },
      data,
      include: saleInclude,
    });
  }

  findSaleByOrderReferenceAndEmail(orderReference: string, email: string) {
    return this.prisma.sale.findFirst({
      where: {
        orderReference,
        registration: {
          customerEmail: email.toLowerCase(),
        },
      },
      include: saleInclude,
    });
  }

  async createRegistration(
    input: CreateRegistrationInput,
  ): Promise<RegistrationWithCertificate> {
    return this.prisma.registration.create({
      data: {
        saleId: input.saleId,
        customerEmail: input.customerEmail.toLowerCase(),
        customerName: input.customerName,
        marketingConsent: input.marketingConsent,
        userId: input.userId,
        status: input.status,
      },
      include: {
        certificate: true,
        sale: { include: saleInclude },
      },
    });
  }

  findRegistrationBySaleId(saleId: string) {
    return this.prisma.registration.findUnique({
      where: { saleId },
      include: {
        certificate: true,
        sale: { include: saleInclude },
      },
    });
  }

  async revokeRegistration(registrationId: string): Promise<void> {
    await this.prisma.registration.update({
      where: { id: registrationId },
      data: { status: RegistrationStatus.REVOKED },
    });
  }

  async invalidateActiveTokensForSale(saleId: string): Promise<void> {
    await this.prisma.registrationToken.updateMany({
      where: { saleId, consumedAt: null },
      data: { consumedAt: new Date() },
    });
  }

  createRegistrationToken(input: CreateRegistrationTokenInput) {
    return this.prisma.registrationToken.create({
      data: input,
    });
  }

  findActiveRegistrationTokenByHash(tokenHash: string) {
    return this.prisma.registrationToken.findFirst({
      where: {
        tokenHash,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        sale: { include: saleInclude },
      },
    });
  }

  async consumeRegistrationToken(id: string): Promise<void> {
    await this.prisma.registrationToken.update({
      where: { id },
      data: { consumedAt: new Date() },
    });
  }

  createCertificate(input: CreateCertificateInput) {
    return this.prisma.digitalCertificate.create({ data: input });
  }

  findCertificateByNumber(certificateNo: string) {
    return this.prisma.digitalCertificate.findUnique({
      where: { certificateNo },
      include: {
        registration: {
          include: {
            certificate: true,
            sale: { include: saleInclude },
          },
        },
      },
    });
  }

  listCertificates(options: {
    status?: CertificateStatus;
    limit?: number;
    offset?: number;
  }) {
    return this.prisma.digitalCertificate.findMany({
      where: { status: options.status },
      orderBy: { issuedAt: 'desc' },
      take: options.limit,
      skip: options.offset,
    });
  }

  countCertificates(options: { status?: CertificateStatus }) {
    return this.prisma.digitalCertificate.count({
      where: { status: options.status },
    });
  }

  updateCertificateStatus(id: string, status: CertificateStatus) {
    return this.prisma.digitalCertificate.update({
      where: { id },
      data: { status },
    });
  }

  async getDashboardStats(marketId?: string): Promise<RegistryDashboardStats> {
    const baseWhere: Prisma.SaleWhereInput = {
      status: SaleStatus.COMPLETED,
      ...(marketId ? { authorizedSeller: { marketId } } : {}),
    };

    const [soldAggregate, registeredCount, waitingCount] = await Promise.all([
      this.prisma.sale.aggregate({
        where: baseWhere,
        _sum: { quantity: true },
      }),
      this.prisma.sale.count({
        where: {
          ...baseWhere,
          registrationStatus: RegistrationStatus.REGISTERED,
        },
      }),
      this.prisma.sale.count({
        where: {
          ...baseWhere,
          registrationStatus: RegistrationStatus.WAITING,
        },
      }),
    ]);

    return {
      totalSold: soldAggregate._sum.quantity ?? 0,
      registeredCustomers: registeredCount,
      soldUnregistered: waitingCount,
    };
  }

  listSellers() {
    return this.prisma.authorizedSeller.findMany({
      include: { market: true },
      orderBy: { name: 'asc' },
    });
  }

  private buildSaleWhere(options: ListSalesOptions): Prisma.SaleWhereInput {
    return {
      authorizedSellerId: options.authorizedSellerId,
      status: options.status,
      registrationStatus: options.registrationStatus,
    };
  }
}
