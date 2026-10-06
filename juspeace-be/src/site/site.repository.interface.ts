import type {
  Category,
  ContentBlock,
  ContentSection,
  DiscountType,
  FeaturedProduct,
  NewsletterSubscriber,
  PaymentMethodConfig,
  PaymentProviderKind,
  Product,
  ProductReview,
  Promotion,
  ShippingMethod,
  SiteSetting,
  User,
} from '@prisma/client';

export interface ContentListFilter {
  section?: ContentSection;
  locale?: string;
  published?: boolean;
}

export interface CreateContentInput {
  section: ContentSection;
  locale: string;
  title: string;
  subtitle?: string | null;
  body?: string | null;
  imageUrl?: string | null;
  href?: string | null;
  sortOrder: number;
  published: boolean;
}

export type UpdateContentInput = Partial<CreateContentInput>;

export interface CreateShippingInput {
  code: string;
  name: string;
  description?: string | null;
  priceCents: number;
  currency: string;
  estimatedDays?: string | null;
  enabled: boolean;
  sortOrder: number;
}

export type UpdateShippingInput = Partial<CreateShippingInput>;

export interface CreatePaymentInput {
  code: string;
  name: string;
  enabled: boolean;
  provider: PaymentProviderKind;
  sortOrder: number;
  instructions?: string | null;
}

export type UpdatePaymentInput = Partial<
  Omit<CreatePaymentInput, 'provider' | 'code'>
>;

export interface CreatePromotionInput {
  code: string;
  name: string;
  discountType: DiscountType;
  discountValue: number;
  startsAt?: Date | null;
  endsAt?: Date | null;
  usageLimit?: number | null;
  active: boolean;
}

export type UpdatePromotionInput = Partial<CreatePromotionInput>;

export interface CreateReviewInput {
  productId: string;
  rating: number;
  title?: string | null;
  body: string;
  reviewerName: string;
  published: boolean;
}

export type UpdateReviewInput = Partial<CreateReviewInput>;

export interface ReviewListFilter {
  published?: boolean;
  productSlug?: string;
}

export type ProductReviewRecord = ProductReview & {
  product: Pick<Product, 'id' | 'slug' | 'name'>;
};

export interface CreateCategoryInput {
  slug: string;
  name: string;
  description?: string | null;
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

export interface CustomerRecord {
  id: string;
  email: string;
  name: string | null;
  role: User['role'];
  isActive: boolean;
  createdAt: Date;
}

export interface FeaturedRecord extends FeaturedProduct {
  product: Pick<
    Product,
    | 'id'
    | 'slug'
    | 'name'
    | 'priceCents'
    | 'currency'
    | 'stock'
    | 'imageUrl'
    | 'status'
  >;
}

export interface ISiteRepository {
  listContent(filter: ContentListFilter): Promise<ContentBlock[]>;
  findContent(id: string): Promise<ContentBlock | null>;
  createContent(input: CreateContentInput): Promise<ContentBlock>;
  updateContent(id: string, input: UpdateContentInput): Promise<ContentBlock>;
  deleteContent(id: string): Promise<ContentBlock>;

  listSettings(): Promise<SiteSetting[]>;
  findSetting(key: string): Promise<SiteSetting | null>;
  upsertSetting(key: string, value: string): Promise<SiteSetting>;

  listShipping(enabledOnly: boolean): Promise<ShippingMethod[]>;
  findShipping(id: string): Promise<ShippingMethod | null>;
  findShippingByCode(code: string): Promise<ShippingMethod | null>;
  createShipping(input: CreateShippingInput): Promise<ShippingMethod>;
  updateShipping(
    id: string,
    input: UpdateShippingInput,
  ): Promise<ShippingMethod>;
  deleteShipping(id: string): Promise<ShippingMethod>;

  listPayments(enabledOnly: boolean): Promise<PaymentMethodConfig[]>;
  findPayment(id: string): Promise<PaymentMethodConfig | null>;
  findPaymentByCode(code: string): Promise<PaymentMethodConfig | null>;
  createPayment(input: CreatePaymentInput): Promise<PaymentMethodConfig>;
  updatePayment(
    id: string,
    input: UpdatePaymentInput,
  ): Promise<PaymentMethodConfig>;
  deletePayment(id: string): Promise<PaymentMethodConfig>;

  listPromotions(activeOnly: boolean): Promise<Promotion[]>;
  findPromotion(id: string): Promise<Promotion | null>;
  findPromotionByCode(code: string): Promise<Promotion | null>;
  createPromotion(input: CreatePromotionInput): Promise<Promotion>;
  updatePromotion(id: string, input: UpdatePromotionInput): Promise<Promotion>;
  deletePromotion(id: string): Promise<Promotion>;

  listReviews(filter: ReviewListFilter): Promise<ProductReviewRecord[]>;
  findReview(id: string): Promise<ProductReview | null>;
  createReview(input: CreateReviewInput): Promise<ProductReviewRecord>;
  updateReview(
    id: string,
    input: UpdateReviewInput,
  ): Promise<ProductReviewRecord>;
  deleteReview(id: string): Promise<ProductReview>;

  listCategories(): Promise<Category[]>;
  findCategory(id: string): Promise<Category | null>;
  findCategoryBySlug(slug: string): Promise<Category | null>;
  createCategory(input: CreateCategoryInput): Promise<Category>;
  updateCategory(id: string, input: UpdateCategoryInput): Promise<Category>;
  deleteCategory(id: string): Promise<Category>;

  listCustomers(): Promise<CustomerRecord[]>;
  findCustomer(id: string): Promise<CustomerRecord | null>;
  setCustomerActive(id: string, isActive: boolean): Promise<CustomerRecord>;

  listSubscribers(): Promise<NewsletterSubscriber[]>;
  findSubscriberByEmail(email: string): Promise<NewsletterSubscriber | null>;
  findSubscriber(id: string): Promise<NewsletterSubscriber | null>;
  createSubscriber(
    email: string,
    locale?: string | null,
  ): Promise<NewsletterSubscriber>;
  deleteSubscriber(id: string): Promise<NewsletterSubscriber>;

  findProductById(id: string): Promise<Pick<Product, 'id' | 'status'> | null>;
  listFeatured(activeProductsOnly: boolean): Promise<FeaturedRecord[]>;
  findFeatured(id: string): Promise<FeaturedProduct | null>;
  findFeaturedByProductId(productId: string): Promise<FeaturedProduct | null>;
  createFeatured(input: {
    productId: string;
    sortOrder: number;
    cardImageUrl?: string | null;
  }): Promise<FeaturedRecord>;
  updateFeatured(
    id: string,
    input: { sortOrder?: number; cardImageUrl?: string | null },
  ): Promise<FeaturedRecord>;
  deleteFeatured(id: string): Promise<FeaturedProduct>;
}

export const SITE_REPOSITORY = Symbol('SITE_REPOSITORY');
