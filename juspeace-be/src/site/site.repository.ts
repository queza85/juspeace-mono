import { Injectable } from '@nestjs/common';
import { ContactInquiryStatus, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type {
  ContentListFilter,
  CreateCategoryInput,
  CreateContentInput,
  CreatePaymentInput,
  CreatePromotionInput,
  CreateReviewInput,
  CreateShippingInput,
  CustomerRecord,
  FeaturedRecord,
  ISiteRepository,
  ProductReviewRecord,
  ReviewListFilter,
  UpdateCategoryInput,
  UpdateContentInput,
  UpdatePaymentInput,
  UpdatePromotionInput,
  UpdateReviewInput,
  UpdateShippingInput,
} from './site.repository.interface';

const reviewInclude = {
  product: { select: { id: true, slug: true, name: true } },
} satisfies Prisma.ProductReviewInclude;

const featuredInclude = {
  product: {
    select: {
      id: true,
      slug: true,
      name: true,
      priceCents: true,
      currency: true,
      stock: true,
      imageUrl: true,
      status: true,
    },
  },
} satisfies Prisma.FeaturedProductInclude;

const customerSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  isActive: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class PrismaSiteRepository implements ISiteRepository {
  constructor(private readonly prisma: PrismaService) {}

  listContent(filter: ContentListFilter) {
    return this.prisma.contentBlock.findMany({
      where: {
        section: filter.section,
        locale: filter.locale,
        published: filter.published,
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  findContent(id: string) {
    return this.prisma.contentBlock.findUnique({ where: { id } });
  }

  createContent(input: CreateContentInput) {
    return this.prisma.contentBlock.create({ data: input });
  }

  updateContent(id: string, input: UpdateContentInput) {
    return this.prisma.contentBlock.update({ where: { id }, data: input });
  }

  deleteContent(id: string) {
    return this.prisma.contentBlock.delete({ where: { id } });
  }

  listSettings() {
    return this.prisma.siteSetting.findMany({ orderBy: { key: 'asc' } });
  }

  findSetting(key: string) {
    return this.prisma.siteSetting.findUnique({ where: { key } });
  }

  upsertSetting(key: string, value: string) {
    return this.prisma.siteSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }

  listShipping(enabledOnly: boolean) {
    return this.prisma.shippingMethod.findMany({
      where: enabledOnly ? { enabled: true } : undefined,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  findShipping(id: string) {
    return this.prisma.shippingMethod.findUnique({ where: { id } });
  }

  findShippingByCode(code: string) {
    return this.prisma.shippingMethod.findUnique({ where: { code } });
  }

  createShipping(input: CreateShippingInput) {
    return this.prisma.shippingMethod.create({ data: input });
  }

  updateShipping(id: string, input: UpdateShippingInput) {
    return this.prisma.shippingMethod.update({ where: { id }, data: input });
  }

  deleteShipping(id: string) {
    return this.prisma.shippingMethod.delete({ where: { id } });
  }

  listPayments(enabledOnly: boolean) {
    return this.prisma.paymentMethodConfig.findMany({
      where: enabledOnly ? { enabled: true } : undefined,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  findPayment(id: string) {
    return this.prisma.paymentMethodConfig.findUnique({ where: { id } });
  }

  findPaymentByCode(code: string) {
    return this.prisma.paymentMethodConfig.findUnique({ where: { code } });
  }

  createPayment(input: CreatePaymentInput) {
    return this.prisma.paymentMethodConfig.create({ data: input });
  }

  updatePayment(id: string, input: UpdatePaymentInput) {
    return this.prisma.paymentMethodConfig.update({
      where: { id },
      data: input,
    });
  }

  deletePayment(id: string) {
    return this.prisma.paymentMethodConfig.delete({ where: { id } });
  }

  listPromotions(activeOnly: boolean) {
    return this.prisma.promotion.findMany({
      where: activeOnly ? { active: true } : undefined,
      orderBy: { code: 'asc' },
    });
  }

  findPromotion(id: string) {
    return this.prisma.promotion.findUnique({ where: { id } });
  }

  findPromotionByCode(code: string) {
    return this.prisma.promotion.findUnique({ where: { code } });
  }

  createPromotion(input: CreatePromotionInput) {
    return this.prisma.promotion.create({ data: input });
  }

  updatePromotion(id: string, input: UpdatePromotionInput) {
    return this.prisma.promotion.update({ where: { id }, data: input });
  }

  deletePromotion(id: string) {
    return this.prisma.promotion.delete({ where: { id } });
  }

  listReviews(filter: ReviewListFilter): Promise<ProductReviewRecord[]> {
    return this.prisma.productReview.findMany({
      where: {
        published: filter.published,
        product: filter.productSlug ? { slug: filter.productSlug } : undefined,
      },
      include: reviewInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  findReview(id: string) {
    return this.prisma.productReview.findUnique({ where: { id } });
  }

  createReview(input: CreateReviewInput): Promise<ProductReviewRecord> {
    return this.prisma.productReview.create({
      data: input,
      include: reviewInclude,
    });
  }

  updateReview(
    id: string,
    input: UpdateReviewInput,
  ): Promise<ProductReviewRecord> {
    return this.prisma.productReview.update({
      where: { id },
      data: input,
      include: reviewInclude,
    });
  }

  deleteReview(id: string) {
    return this.prisma.productReview.delete({ where: { id } });
  }

  listCategories() {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  findCategory(id: string) {
    return this.prisma.category.findUnique({ where: { id } });
  }

  findCategoryBySlug(slug: string) {
    return this.prisma.category.findUnique({ where: { slug } });
  }

  createCategory(input: CreateCategoryInput) {
    return this.prisma.category.create({ data: input });
  }

  updateCategory(id: string, input: UpdateCategoryInput) {
    return this.prisma.category.update({ where: { id }, data: input });
  }

  deleteCategory(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }

  listCustomers(): Promise<CustomerRecord[]> {
    return this.prisma.user.findMany({
      where: { role: UserRole.USER },
      select: customerSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  findCustomer(id: string): Promise<CustomerRecord | null> {
    return this.prisma.user.findFirst({
      where: { id, role: UserRole.USER },
      select: customerSelect,
    });
  }

  setCustomerActive(id: string, isActive: boolean): Promise<CustomerRecord> {
    return this.prisma.user.update({
      where: { id },
      data: { isActive },
      select: customerSelect,
    });
  }

  listInquiries() {
    return this.prisma.contactInquiry.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findInquiry(id: string) {
    return this.prisma.contactInquiry.findUnique({ where: { id } });
  }

  createInquiry(input: {
    name: string;
    email: string;
    phone?: string | null;
    subject?: string | null;
    message: string;
    locale?: string | null;
  }) {
    return this.prisma.contactInquiry.create({ data: input });
  }

  updateInquiryStatus(id: string, status: ContactInquiryStatus) {
    return this.prisma.contactInquiry.update({
      where: { id },
      data: { status },
    });
  }

  listSubscribers() {
    return this.prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findSubscriberByEmail(email: string) {
    return this.prisma.newsletterSubscriber.findUnique({ where: { email } });
  }

  findSubscriber(id: string) {
    return this.prisma.newsletterSubscriber.findUnique({ where: { id } });
  }

  createSubscriber(email: string, locale?: string | null) {
    return this.prisma.newsletterSubscriber.create({
      data: { email, locale: locale ?? null },
    });
  }

  deleteSubscriber(id: string) {
    return this.prisma.newsletterSubscriber.delete({ where: { id } });
  }

  findProductById(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
  }

  listFeatured(activeProductsOnly: boolean): Promise<FeaturedRecord[]> {
    return this.prisma.featuredProduct.findMany({
      where: activeProductsOnly ? { product: { status: 'ACTIVE' } } : undefined,
      include: featuredInclude,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  findFeatured(id: string) {
    return this.prisma.featuredProduct.findUnique({ where: { id } });
  }

  findFeaturedByProductId(productId: string) {
    return this.prisma.featuredProduct.findUnique({ where: { productId } });
  }

  createFeatured(input: {
    productId: string;
    sortOrder: number;
    cardImageUrl?: string | null;
  }): Promise<FeaturedRecord> {
    return this.prisma.featuredProduct.create({
      data: input,
      include: featuredInclude,
    });
  }

  updateFeatured(
    id: string,
    input: { sortOrder?: number; cardImageUrl?: string | null },
  ): Promise<FeaturedRecord> {
    return this.prisma.featuredProduct.update({
      where: { id },
      data: input,
      include: featuredInclude,
    });
  }

  deleteFeatured(id: string) {
    return this.prisma.featuredProduct.delete({ where: { id } });
  }
}
