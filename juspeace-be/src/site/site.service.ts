import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DiscountType, PaymentProviderKind } from '@prisma/client';
import { slugify } from '../common/utils/slug.util';
import type {
  CreateCategoryDto,
  CreateContactInquiryDto,
  CreateContentBlockDto,
  CreateFeaturedProductDto,
  CreateNewsletterSubscriberDto,
  CreatePaymentMethodDto,
  CreatePromotionDto,
  CreateReviewDto,
  CreateShippingMethodDto,
  ListContentQueryDto,
  ListReviewsQueryDto,
  UpdateCategoryDto,
  UpdateContactInquiryStatusDto,
  UpdateContentBlockDto,
  UpdateCustomerDto,
  UpdateFeaturedProductDto,
  UpdatePaymentMethodDto,
  UpdatePromotionDto,
  UpdateReviewDto,
  UpdateShippingMethodDto,
  UpsertSiteSettingDto,
} from './dto/site.dto';
import { SITE_SETTING_KEYS } from './site.constants';
import type { ISiteRepository } from './site.repository.interface';
import { SITE_REPOSITORY } from './site.repository.interface';

@Injectable()
export class SiteService {
  constructor(
    @Inject(SITE_REPOSITORY)
    private readonly siteRepository: ISiteRepository,
  ) {}

  listContent(query: ListContentQueryDto, publishedOnly: boolean) {
    return this.siteRepository.listContent({
      section: query.section,
      locale: query.locale,
      published: publishedOnly ? true : query.published,
    });
  }

  async createContent(dto: CreateContentBlockDto) {
    return this.siteRepository.createContent({
      section: dto.section,
      locale: dto.locale,
      title: dto.title.trim(),
      subtitle: emptyToNull(dto.subtitle),
      body: emptyToNull(dto.body),
      imageUrl: emptyToNull(dto.imageUrl),
      href: emptyToNull(dto.href),
      sortOrder: dto.sortOrder ?? 0,
      published: dto.published ?? true,
    });
  }

  async updateContent(id: string, dto: UpdateContentBlockDto) {
    await this.requireContent(id);
    return this.siteRepository.updateContent(id, {
      ...dto,
      title: dto.title?.trim(),
      subtitle:
        dto.subtitle === undefined ? undefined : emptyToNull(dto.subtitle),
      body: dto.body === undefined ? undefined : emptyToNull(dto.body),
      imageUrl:
        dto.imageUrl === undefined ? undefined : emptyToNull(dto.imageUrl),
      href: dto.href === undefined ? undefined : emptyToNull(dto.href),
    });
  }

  async deleteContent(id: string) {
    await this.requireContent(id);
    return this.siteRepository.deleteContent(id);
  }

  listSettings() {
    return this.siteRepository.listSettings();
  }

  upsertSetting(dto: UpsertSiteSettingDto) {
    if (
      !SITE_SETTING_KEYS.includes(dto.key as (typeof SITE_SETTING_KEYS)[number])
    ) {
      throw new BadRequestException('SITE_SETTING_KEY_INVALID');
    }
    return this.siteRepository.upsertSetting(dto.key, dto.value);
  }

  listShipping(enabledOnly: boolean) {
    return this.siteRepository.listShipping(enabledOnly);
  }

  async createShipping(dto: CreateShippingMethodDto) {
    const code = slugify(dto.code);
    if (!code) {
      throw new BadRequestException('SHIPPING_METHOD_CODE_INVALID');
    }
    const existing = await this.siteRepository.findShippingByCode(code);
    if (existing) {
      throw new ConflictException('SHIPPING_METHOD_CODE_TAKEN');
    }
    return this.siteRepository.createShipping({
      code,
      name: dto.name.trim(),
      description: emptyToNull(dto.description),
      priceCents: dto.priceCents,
      currency: (dto.currency ?? 'USD').toUpperCase(),
      estimatedDays: emptyToNull(dto.estimatedDays),
      enabled: dto.enabled ?? true,
      sortOrder: dto.sortOrder ?? 0,
    });
  }

  async updateShipping(id: string, dto: UpdateShippingMethodDto) {
    await this.requireShipping(id);
    const code = dto.code === undefined ? undefined : slugify(dto.code);
    if (code === '') {
      throw new BadRequestException('SHIPPING_METHOD_CODE_INVALID');
    }
    if (code) {
      const existing = await this.siteRepository.findShippingByCode(code);
      if (existing && existing.id !== id) {
        throw new ConflictException('SHIPPING_METHOD_CODE_TAKEN');
      }
    }
    return this.siteRepository.updateShipping(id, {
      code,
      name: dto.name?.trim(),
      description:
        dto.description === undefined
          ? undefined
          : emptyToNull(dto.description),
      priceCents: dto.priceCents,
      currency: dto.currency?.toUpperCase(),
      estimatedDays:
        dto.estimatedDays === undefined
          ? undefined
          : emptyToNull(dto.estimatedDays),
      enabled: dto.enabled,
      sortOrder: dto.sortOrder,
    });
  }

  async deleteShipping(id: string) {
    await this.requireShipping(id);
    return this.siteRepository.deleteShipping(id);
  }

  listPayments(enabledOnly: boolean) {
    return this.siteRepository.listPayments(enabledOnly);
  }

  async createPayment(dto: CreatePaymentMethodDto) {
    const existing = await this.siteRepository.findPaymentByCode(dto.code);
    if (existing) {
      throw new ConflictException('PAYMENT_METHOD_CODE_TAKEN');
    }
    return this.siteRepository.createPayment({
      code: dto.code,
      name: dto.name.trim(),
      enabled: dto.enabled ?? false,
      provider: PaymentProviderKind.DUMMY,
      sortOrder: dto.sortOrder ?? 0,
      instructions: emptyToNull(dto.instructions),
    });
  }

  async updatePayment(id: string, dto: UpdatePaymentMethodDto) {
    await this.requirePayment(id);
    return this.siteRepository.updatePayment(id, {
      name: dto.name?.trim(),
      enabled: dto.enabled,
      sortOrder: dto.sortOrder,
      instructions:
        dto.instructions === undefined
          ? undefined
          : emptyToNull(dto.instructions),
    });
  }

  async deletePayment(id: string) {
    await this.requirePayment(id);
    return this.siteRepository.deletePayment(id);
  }

  listPromotions(activeOnly: boolean) {
    return this.siteRepository.listPromotions(activeOnly);
  }

  async createPromotion(dto: CreatePromotionDto) {
    const code = dto.code.trim().toUpperCase();
    assertDiscount(dto.discountType, dto.discountValue);
    const existing = await this.siteRepository.findPromotionByCode(code);
    if (existing) {
      throw new ConflictException('PROMOTION_CODE_TAKEN');
    }
    return this.siteRepository.createPromotion({
      code,
      name: dto.name.trim(),
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
      usageLimit: dto.usageLimit ?? null,
      active: dto.active ?? true,
    });
  }

  async updatePromotion(id: string, dto: UpdatePromotionDto) {
    const current = await this.requirePromotion(id);
    const discountType = dto.discountType ?? current.discountType;
    const discountValue = dto.discountValue ?? current.discountValue;
    assertDiscount(discountType, discountValue);
    const code = dto.code?.trim().toUpperCase();
    if (code) {
      const existing = await this.siteRepository.findPromotionByCode(code);
      if (existing && existing.id !== id) {
        throw new ConflictException('PROMOTION_CODE_TAKEN');
      }
    }
    return this.siteRepository.updatePromotion(id, {
      code,
      name: dto.name?.trim(),
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      startsAt: dto.startsAt === undefined ? undefined : new Date(dto.startsAt),
      endsAt: dto.endsAt === undefined ? undefined : new Date(dto.endsAt),
      usageLimit: dto.usageLimit,
      active: dto.active,
    });
  }

  async deletePromotion(id: string) {
    await this.requirePromotion(id);
    return this.siteRepository.deletePromotion(id);
  }

  listReviews(query: ListReviewsQueryDto, publishedOnly: boolean) {
    return this.siteRepository.listReviews({
      productSlug: query.productSlug,
      published: publishedOnly ? true : query.published,
    });
  }

  async createReview(dto: CreateReviewDto) {
    await this.requireProduct(dto.productId);
    return this.siteRepository.createReview({
      productId: dto.productId,
      rating: dto.rating,
      title: emptyToNull(dto.title),
      body: dto.body.trim(),
      reviewerName: dto.reviewerName.trim(),
      published: dto.published ?? false,
    });
  }

  async updateReview(id: string, dto: UpdateReviewDto) {
    await this.requireReview(id);
    if (dto.productId) {
      await this.requireProduct(dto.productId);
    }
    return this.siteRepository.updateReview(id, {
      productId: dto.productId,
      rating: dto.rating,
      title: dto.title === undefined ? undefined : emptyToNull(dto.title),
      body: dto.body?.trim(),
      reviewerName: dto.reviewerName?.trim(),
      published: dto.published,
    });
  }

  async deleteReview(id: string) {
    await this.requireReview(id);
    return this.siteRepository.deleteReview(id);
  }

  listCategories() {
    return this.siteRepository.listCategories();
  }

  async createCategory(dto: CreateCategoryDto) {
    const slug = slugify(dto.slug?.trim() || dto.name);
    if (!slug) {
      throw new BadRequestException('CATEGORY_SLUG_INVALID');
    }
    const existing = await this.siteRepository.findCategoryBySlug(slug);
    if (existing) {
      throw new ConflictException('CATEGORY_SLUG_TAKEN');
    }
    return this.siteRepository.createCategory({
      slug,
      name: dto.name.trim(),
      description: emptyToNull(dto.description),
    });
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    await this.requireCategory(id);
    const slug = dto.slug === undefined ? undefined : slugify(dto.slug);
    if (slug === '') {
      throw new BadRequestException('CATEGORY_SLUG_INVALID');
    }
    if (slug) {
      const existing = await this.siteRepository.findCategoryBySlug(slug);
      if (existing && existing.id !== id) {
        throw new ConflictException('CATEGORY_SLUG_TAKEN');
      }
    }
    return this.siteRepository.updateCategory(id, {
      slug,
      name: dto.name?.trim(),
      description:
        dto.description === undefined
          ? undefined
          : emptyToNull(dto.description),
    });
  }

  async deleteCategory(id: string) {
    await this.requireCategory(id);
    return this.siteRepository.deleteCategory(id);
  }

  listCustomers() {
    return this.siteRepository.listCustomers();
  }

  async updateCustomer(id: string, dto: UpdateCustomerDto) {
    const customer = await this.siteRepository.findCustomer(id);
    if (!customer) {
      throw new NotFoundException('CUSTOMER_NOT_FOUND');
    }
    return this.siteRepository.setCustomerActive(id, dto.isActive);
  }

  listInquiries() {
    return this.siteRepository.listInquiries();
  }

  createInquiry(dto: CreateContactInquiryDto) {
    return this.siteRepository.createInquiry({
      name: dto.name.trim(),
      email: dto.email.trim().toLowerCase(),
      phone: emptyToNull(dto.phone),
      subject: emptyToNull(dto.subject),
      message: dto.message.trim(),
      locale: dto.locale ?? null,
    });
  }

  async updateInquiryStatus(id: string, dto: UpdateContactInquiryStatusDto) {
    const inquiry = await this.siteRepository.findInquiry(id);
    if (!inquiry) {
      throw new NotFoundException('CONTACT_INQUIRY_NOT_FOUND');
    }
    return this.siteRepository.updateInquiryStatus(id, dto.status);
  }

  listSubscribers() {
    return this.siteRepository.listSubscribers();
  }

  async subscribe(dto: CreateNewsletterSubscriberDto) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.siteRepository.findSubscriberByEmail(email);
    if (existing) {
      return existing;
    }
    return this.siteRepository.createSubscriber(email, dto.locale ?? null);
  }

  async deleteSubscriber(id: string) {
    const subscriber = await this.siteRepository.findSubscriber(id);
    if (!subscriber) {
      throw new NotFoundException('NEWSLETTER_SUBSCRIBER_NOT_FOUND');
    }
    return this.siteRepository.deleteSubscriber(id);
  }

  listFeatured(activeProductsOnly: boolean) {
    return this.siteRepository.listFeatured(activeProductsOnly);
  }

  async createFeatured(dto: CreateFeaturedProductDto) {
    await this.requireProduct(dto.productId);
    const existing = await this.siteRepository.findFeaturedByProductId(
      dto.productId,
    );
    if (existing) {
      throw new ConflictException('FEATURED_PRODUCT_ALREADY_SET');
    }
    return this.siteRepository.createFeatured({
      productId: dto.productId,
      sortOrder: dto.sortOrder ?? 0,
      cardImageUrl: emptyToNull(dto.cardImageUrl),
    });
  }

  async updateFeatured(id: string, dto: UpdateFeaturedProductDto) {
    const current = await this.siteRepository.findFeatured(id);
    if (!current) {
      throw new NotFoundException('FEATURED_PRODUCT_NOT_FOUND');
    }
    return this.siteRepository.updateFeatured(id, {
      sortOrder: dto.sortOrder,
      cardImageUrl:
        dto.cardImageUrl === undefined
          ? undefined
          : emptyToNull(dto.cardImageUrl),
    });
  }

  async deleteFeatured(id: string) {
    const current = await this.siteRepository.findFeatured(id);
    if (!current) {
      throw new NotFoundException('FEATURED_PRODUCT_NOT_FOUND');
    }
    return this.siteRepository.deleteFeatured(id);
  }

  private async requireContent(id: string) {
    const row = await this.siteRepository.findContent(id);
    if (!row) {
      throw new NotFoundException('CONTENT_BLOCK_NOT_FOUND');
    }
    return row;
  }

  private async requireShipping(id: string) {
    const row = await this.siteRepository.findShipping(id);
    if (!row) {
      throw new NotFoundException('SHIPPING_METHOD_NOT_FOUND');
    }
    return row;
  }

  private async requirePayment(id: string) {
    const row = await this.siteRepository.findPayment(id);
    if (!row) {
      throw new NotFoundException('PAYMENT_METHOD_NOT_FOUND');
    }
    return row;
  }

  private async requirePromotion(id: string) {
    const row = await this.siteRepository.findPromotion(id);
    if (!row) {
      throw new NotFoundException('PROMOTION_NOT_FOUND');
    }
    return row;
  }

  private async requireReview(id: string) {
    const row = await this.siteRepository.findReview(id);
    if (!row) {
      throw new NotFoundException('REVIEW_NOT_FOUND');
    }
    return row;
  }

  private async requireCategory(id: string) {
    const row = await this.siteRepository.findCategory(id);
    if (!row) {
      throw new NotFoundException('CATEGORY_NOT_FOUND');
    }
    return row;
  }

  private async requireProduct(id: string) {
    const product = await this.siteRepository.findProductById(id);
    if (!product) {
      throw new NotFoundException('PRODUCT_NOT_FOUND');
    }
    return product;
  }
}

function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : null;
}

function assertDiscount(type: DiscountType, value: number) {
  switch (type) {
    case DiscountType.PERCENTAGE:
      if (value < 1 || value > 100) {
        throw new BadRequestException('PROMOTION_DISCOUNT_INVALID');
      }
      return;
    case DiscountType.FIXED:
      if (value < 0) {
        throw new BadRequestException('PROMOTION_DISCOUNT_INVALID');
      }
      return;
    default: {
      const unknownType: never = type;
      return unknownType;
    }
  }
}
