import {
  AuthorizedSeller,
  DigitalCertificate,
  InventoryAllocation,
  Market,
  PaymentMethod,
  Product,
  Registration,
  RegistrationStatus,
  RegistrationToken,
  Sale,
  SaleChannel,
  SaleStatus,
  CertificateStatus,
} from '@prisma/client';

export const REGISTRY_REPOSITORY = Symbol('REGISTRY_REPOSITORY');

export type SaleWithRelations = Sale & {
  product: Product;
  authorizedSeller: AuthorizedSeller & { market: Market };
  registration:
    (Registration & { certificate: DigitalCertificate | null }) | null;
};

export type RegistrationWithCertificate = Registration & {
  certificate: DigitalCertificate | null;
  sale: SaleWithRelations;
};

export interface CreateSaleInput {
  productId: string;
  authorizedSellerId: string;
  channel: SaleChannel;
  quantity: number;
  unitPriceCents: number;
  currency: string;
  paymentMethod: PaymentMethod;
  soldByUserId?: string;
  orderReference?: string;
  status: SaleStatus;
  registrationStatus: RegistrationStatus;
  soldAt?: Date;
}

export interface CreateRegistrationInput {
  saleId: string;
  customerEmail: string;
  customerName?: string;
  marketingConsent: boolean;
  userId?: string;
  status: RegistrationStatus;
}

export interface CreateRegistrationTokenInput {
  saleId: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface CreateCertificateInput {
  registrationId: string;
  certificateNo: string;
  productName: string;
  collectionName?: string;
  marketCode: string;
  sellerName: string;
  purchaseChannel: SaleChannel;
  registrationDate: Date;
}

export interface ListSalesOptions {
  authorizedSellerId?: string;
  status?: SaleStatus;
  registrationStatus?: RegistrationStatus;
  limit?: number;
  offset?: number;
}

export interface RegistryDashboardStats {
  totalSold: number;
  registeredCustomers: number;
  soldUnregistered: number;
}

export interface IRegistryRepository {
  findSellerByUserId(
    userId: string,
  ): Promise<(AuthorizedSeller & { market: Market }) | null>;
  findSellerById(
    id: string,
  ): Promise<(AuthorizedSeller & { market: Market }) | null>;
  findProductById(id: string): Promise<Product | null>;
  findAllocation(
    authorizedSellerId: string,
    productId: string,
  ): Promise<InventoryAllocation | null>;
  countCompletedSalesForSellerProduct(
    authorizedSellerId: string,
    productId: string,
  ): Promise<number>;
  decrementProductStock(productId: string, quantity: number): Promise<void>;
  createSale(input: CreateSaleInput): Promise<SaleWithRelations>;
  findSaleById(id: string): Promise<SaleWithRelations | null>;
  findSales(options: ListSalesOptions): Promise<SaleWithRelations[]>;
  countSales(options: ListSalesOptions): Promise<number>;
  updateSaleStatus(
    id: string,
    data: Partial<
      Pick<Sale, 'status' | 'registrationStatus' | 'voidedAt' | 'refundedAt'>
    >,
  ): Promise<SaleWithRelations>;
  findSaleByOrderReferenceAndEmail(
    orderReference: string,
    email: string,
  ): Promise<SaleWithRelations | null>;
  createRegistration(
    input: CreateRegistrationInput,
  ): Promise<RegistrationWithCertificate>;
  findRegistrationBySaleId(
    saleId: string,
  ): Promise<RegistrationWithCertificate | null>;
  revokeRegistration(registrationId: string): Promise<void>;
  invalidateActiveTokensForSale(saleId: string): Promise<void>;
  createRegistrationToken(
    input: CreateRegistrationTokenInput,
  ): Promise<RegistrationToken>;
  findActiveRegistrationTokenByHash(
    tokenHash: string,
  ): Promise<(RegistrationToken & { sale: SaleWithRelations }) | null>;
  consumeRegistrationToken(id: string): Promise<void>;
  createCertificate(input: CreateCertificateInput): Promise<DigitalCertificate>;
  findCertificateByNumber(
    certificateNo: string,
  ): Promise<
    (DigitalCertificate & { registration: RegistrationWithCertificate }) | null
  >;
  listCertificates(options: {
    status?: CertificateStatus;
    limit?: number;
    offset?: number;
  }): Promise<DigitalCertificate[]>;
  countCertificates(options: { status?: CertificateStatus }): Promise<number>;
  updateCertificateStatus(
    id: string,
    status: CertificateStatus,
  ): Promise<DigitalCertificate>;
  getDashboardStats(marketId?: string): Promise<RegistryDashboardStats>;
  listSellers(): Promise<(AuthorizedSeller & { market: Market })[]>;
}
