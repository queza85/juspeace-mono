import {
  deleteCategory,
  deleteContentBlock,
  deleteFeaturedProduct,
  deleteNewsletterSubscriber,
  deletePaymentMethod,
  deletePromotion,
  deleteReview,
  deleteShippingMethod,
  listCategories,
  listContentBlocks,
  listCustomers,
  listFeaturedProducts,
  listNewsletterSubscribers,
  listPaymentMethods,
  listPromotions,
  listReviews,
  listShippingMethods,
  saveCategory,
  saveContentBlock,
  saveCustomer,
  saveFeaturedProduct,
  saveNewsletterSubscriber,
  savePaymentMethod,
  savePromotion,
  saveReview,
  saveShippingMethod,
} from '@/lib/api/site';

export type SiteOption = {
  value: string;
  labelKey?: string;
  label?: string;
};

export type SiteField = {
  name: string;
  labelKey: string;
  type: 'text' | 'textarea' | 'number' | 'checkbox' | 'select' | 'datetime' | 'image';
  required?: boolean;
  options?: SiteOption[];
  readOnlyOnEdit?: boolean;
  defaultValue?: string | number | boolean;
};

export type SiteColumn = {
  key: string;
  labelKey: string;
  kind?: 'text' | 'boolean' | 'money' | 'date';
};

export type SiteRow = Record<string, unknown>;

export type SiteResourceConfig = {
  titleKey: string;
  descriptionKey: string;
  noticeKey?: string;
  queryKey: string;
  idKey: string;
  columns: SiteColumn[];
  fields: SiteField[];
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  productField?: string;
  list: (accessToken: string) => Promise<readonly object[]>;
  save: (
    accessToken: string,
    body: Record<string, unknown>,
    id: string | null,
  ) => Promise<unknown>;
  remove?: (accessToken: string, id: string) => Promise<unknown>;
};

const LOCALES: SiteOption[] = [
  { value: 'en', labelKey: 'admin.site.locales.en' },
  { value: 'ko', labelKey: 'admin.site.locales.ko' },
];

const SECTIONS: SiteOption[] = [
  'HERO',
  'BRAND_STORY',
  'FEATURES',
  'VERIFICATION',
  'DONATION',
  'VIDEO',
  'FAQ',
  'GALLERY',
  'ABOVE_FAQ',
  'NAV_LINK',
  'FOOTER_LINK',
  'POLICY',
].map((value) => ({ value, labelKey: `admin.site.sections.${value}` }));

export const SITE_SETTING_KEYS = [
  'storeName',
  'logoUrl',
  'contactEmail',
  'contactPhone',
  'address',
  'instagramUrl',
  'youtubeUrl',
  'facebookUrl',
  'privacyPolicyHref',
  'termsHref',
  'shippingPolicyHref',
  'cancellationPolicyHref',
  'donationNoticeHref',
] as const;

export type SiteSettingKey = (typeof SITE_SETTING_KEYS)[number];

const PAYMENT_CODES: SiteOption[] = [
  'CARD',
  'APPLE_PAY',
  'GOOGLE_PAY',
  'PAYPAL',
  'BANK_TRANSFER',
].map((value) => ({ value, labelKey: `admin.site.paymentCodes.${value}` }));

export const contentResource: SiteResourceConfig = {
  titleKey: 'admin.site.content.title',
  descriptionKey: 'admin.site.content.description',
  queryKey: 'admin-content-blocks',
  idKey: 'id',
  canCreate: true,
  canEdit: true,
  canDelete: true,
  columns: [
    { key: 'section', labelKey: 'admin.site.fields.section' },
    { key: 'locale', labelKey: 'admin.site.fields.locale' },
    { key: 'title', labelKey: 'admin.site.fields.title' },
    { key: 'published', labelKey: 'admin.site.fields.published', kind: 'boolean' },
    { key: 'sortOrder', labelKey: 'admin.site.fields.sortOrder' },
  ],
  fields: [
    { name: 'section', labelKey: 'admin.site.fields.section', type: 'select', required: true, options: SECTIONS, defaultValue: 'HERO' },
    { name: 'locale', labelKey: 'admin.site.fields.locale', type: 'select', required: true, options: LOCALES, defaultValue: 'en' },
    { name: 'title', labelKey: 'admin.site.fields.title', type: 'text', required: true },
    { name: 'subtitle', labelKey: 'admin.site.fields.subtitle', type: 'text' },
    { name: 'body', labelKey: 'admin.site.fields.body', type: 'textarea' },
    { name: 'imageUrl', labelKey: 'admin.site.fields.imageUrl', type: 'image' },
    { name: 'href', labelKey: 'admin.site.fields.href', type: 'text' },
    { name: 'sortOrder', labelKey: 'admin.site.fields.sortOrder', type: 'number', defaultValue: 0 },
    { name: 'published', labelKey: 'admin.site.fields.published', type: 'checkbox', defaultValue: true },
  ],
  list: (token) => listContentBlocks(token),
  save: (token, body, id) => saveContentBlock(token, body, id),
  remove: deleteContentBlock,
};

export const shippingResource: SiteResourceConfig = {
  titleKey: 'admin.site.shipping.title',
  descriptionKey: 'admin.site.shipping.description',
  queryKey: 'admin-shipping-methods',
  idKey: 'id',
  canCreate: true,
  canEdit: true,
  canDelete: true,
  columns: [
    { key: 'code', labelKey: 'admin.site.fields.code' },
    { key: 'name', labelKey: 'admin.site.fields.name' },
    { key: 'priceCents', labelKey: 'admin.site.fields.priceCents', kind: 'money' },
    { key: 'enabled', labelKey: 'admin.site.fields.enabled', kind: 'boolean' },
    { key: 'sortOrder', labelKey: 'admin.site.fields.sortOrder' },
  ],
  fields: [
    { name: 'code', labelKey: 'admin.site.fields.code', type: 'text', required: true },
    { name: 'name', labelKey: 'admin.site.fields.name', type: 'text', required: true },
    { name: 'description', labelKey: 'admin.site.fields.description', type: 'textarea' },
    { name: 'priceCents', labelKey: 'admin.site.fields.priceCents', type: 'number', defaultValue: 0 },
    { name: 'currency', labelKey: 'admin.site.fields.currency', type: 'text', defaultValue: 'USD' },
    { name: 'estimatedDays', labelKey: 'admin.site.fields.estimatedDays', type: 'text' },
    { name: 'sortOrder', labelKey: 'admin.site.fields.sortOrder', type: 'number', defaultValue: 0 },
    { name: 'enabled', labelKey: 'admin.site.fields.enabled', type: 'checkbox', defaultValue: true },
  ],
  list: (token) => listShippingMethods(token),
  save: (token, body, id) => saveShippingMethod(token, body, id),
  remove: deleteShippingMethod,
};

export const paymentsResource: SiteResourceConfig = {
  titleKey: 'admin.site.payments.title',
  descriptionKey: 'admin.site.payments.description',
  noticeKey: 'admin.site.payments.notice',
  queryKey: 'admin-payment-methods',
  idKey: 'id',
  canCreate: true,
  canEdit: true,
  canDelete: true,
  columns: [
    { key: 'code', labelKey: 'admin.site.fields.code' },
    { key: 'name', labelKey: 'admin.site.fields.name' },
    { key: 'provider', labelKey: 'admin.site.fields.provider' },
    { key: 'enabled', labelKey: 'admin.site.fields.enabled', kind: 'boolean' },
  ],
  fields: [
    { name: 'code', labelKey: 'admin.site.fields.code', type: 'select', required: true, options: PAYMENT_CODES, defaultValue: 'CARD', readOnlyOnEdit: true },
    { name: 'name', labelKey: 'admin.site.fields.name', type: 'text', required: true },
    { name: 'instructions', labelKey: 'admin.site.fields.instructions', type: 'textarea' },
    { name: 'sortOrder', labelKey: 'admin.site.fields.sortOrder', type: 'number', defaultValue: 0 },
    { name: 'enabled', labelKey: 'admin.site.fields.enabled', type: 'checkbox', defaultValue: false },
  ],
  list: (token) => listPaymentMethods(token),
  save: (token, body, id) =>
    savePaymentMethod(
      token,
      id
        ? {
            name: body.name,
            enabled: body.enabled,
            sortOrder: body.sortOrder,
            instructions: body.instructions,
          }
        : body,
      id,
    ),
  remove: deletePaymentMethod,
};

export const promotionsResource: SiteResourceConfig = {
  titleKey: 'admin.site.promotions.title',
  descriptionKey: 'admin.site.promotions.description',
  queryKey: 'admin-promotions',
  idKey: 'id',
  canCreate: true,
  canEdit: true,
  canDelete: true,
  columns: [
    { key: 'code', labelKey: 'admin.site.fields.code' },
    { key: 'name', labelKey: 'admin.site.fields.name' },
    { key: 'discountType', labelKey: 'admin.site.fields.discountType' },
    { key: 'discountValue', labelKey: 'admin.site.fields.discountValue' },
    { key: 'active', labelKey: 'admin.site.fields.active', kind: 'boolean' },
  ],
  fields: [
    { name: 'code', labelKey: 'admin.site.fields.code', type: 'text', required: true },
    { name: 'name', labelKey: 'admin.site.fields.name', type: 'text', required: true },
    {
      name: 'discountType',
      labelKey: 'admin.site.fields.discountType',
      type: 'select',
      required: true,
      defaultValue: 'PERCENTAGE',
      options: [
        { value: 'PERCENTAGE', labelKey: 'admin.site.discountTypes.PERCENTAGE' },
        { value: 'FIXED', labelKey: 'admin.site.discountTypes.FIXED' },
      ],
    },
    { name: 'discountValue', labelKey: 'admin.site.fields.discountValue', type: 'number', required: true, defaultValue: 10 },
    { name: 'startsAt', labelKey: 'admin.site.fields.startsAt', type: 'datetime' },
    { name: 'endsAt', labelKey: 'admin.site.fields.endsAt', type: 'datetime' },
    { name: 'usageLimit', labelKey: 'admin.site.fields.usageLimit', type: 'number' },
    { name: 'active', labelKey: 'admin.site.fields.active', type: 'checkbox', defaultValue: true },
  ],
  list: (token) => listPromotions(token),
  save: (token, body, id) => savePromotion(token, body, id),
  remove: deletePromotion,
};

export const reviewsResource: SiteResourceConfig = {
  titleKey: 'admin.site.reviews.title',
  descriptionKey: 'admin.site.reviews.description',
  queryKey: 'admin-reviews',
  idKey: 'id',
  canCreate: true,
  canEdit: true,
  canDelete: true,
  productField: 'productId',
  columns: [
    { key: 'product.name', labelKey: 'admin.site.fields.product' },
    { key: 'reviewerName', labelKey: 'admin.site.fields.reviewerName' },
    { key: 'rating', labelKey: 'admin.site.fields.rating' },
    { key: 'published', labelKey: 'admin.site.fields.published', kind: 'boolean' },
  ],
  fields: [
    { name: 'productId', labelKey: 'admin.site.fields.product', type: 'select', required: true },
    { name: 'reviewerName', labelKey: 'admin.site.fields.reviewerName', type: 'text', required: true },
    { name: 'rating', labelKey: 'admin.site.fields.rating', type: 'number', required: true, defaultValue: 5 },
    { name: 'title', labelKey: 'admin.site.fields.title', type: 'text' },
    { name: 'body', labelKey: 'admin.site.fields.body', type: 'textarea', required: true },
    { name: 'published', labelKey: 'admin.site.fields.published', type: 'checkbox', defaultValue: false },
  ],
  list: (token) => listReviews(token),
  save: (token, body, id) => saveReview(token, body, id),
  remove: deleteReview,
};

export const categoriesResource: SiteResourceConfig = {
  titleKey: 'admin.site.categories.title',
  descriptionKey: 'admin.site.categories.description',
  queryKey: 'admin-categories',
  idKey: 'id',
  canCreate: true,
  canEdit: true,
  canDelete: true,
  columns: [
    { key: 'name', labelKey: 'admin.site.fields.name' },
    { key: 'slug', labelKey: 'admin.site.fields.slug' },
  ],
  fields: [
    { name: 'name', labelKey: 'admin.site.fields.name', type: 'text', required: true },
    { name: 'slug', labelKey: 'admin.site.fields.slug', type: 'text' },
    { name: 'description', labelKey: 'admin.site.fields.description', type: 'textarea' },
  ],
  list: (token) => listCategories(token),
  save: (token, body, id) => saveCategory(token, body, id),
  remove: deleteCategory,
};

export const customersResource: SiteResourceConfig = {
  titleKey: 'admin.site.customers.title',
  descriptionKey: 'admin.site.customers.description',
  queryKey: 'admin-customers',
  idKey: 'id',
  canCreate: false,
  canEdit: true,
  canDelete: false,
  columns: [
    { key: 'email', labelKey: 'admin.site.fields.email' },
    { key: 'name', labelKey: 'admin.site.fields.name' },
    { key: 'isActive', labelKey: 'admin.site.fields.isActive', kind: 'boolean' },
    { key: 'createdAt', labelKey: 'admin.site.fields.createdAt', kind: 'date' },
  ],
  fields: [
    { name: 'isActive', labelKey: 'admin.site.fields.isActive', type: 'checkbox', defaultValue: true },
  ],
  list: (token) => listCustomers(token),
  save: (token, body, id) => saveCustomer(token, { isActive: body.isActive }, id),
};

export const newsletterResource: SiteResourceConfig = {
  titleKey: 'admin.site.newsletter.title',
  descriptionKey: 'admin.site.newsletter.description',
  queryKey: 'admin-newsletter',
  idKey: 'id',
  canCreate: true,
  canEdit: false,
  canDelete: true,
  columns: [
    { key: 'email', labelKey: 'admin.site.fields.email' },
    { key: 'locale', labelKey: 'admin.site.fields.locale' },
    { key: 'createdAt', labelKey: 'admin.site.fields.createdAt', kind: 'date' },
  ],
  fields: [
    { name: 'email', labelKey: 'admin.site.fields.email', type: 'text', required: true },
    { name: 'locale', labelKey: 'admin.site.fields.locale', type: 'select', options: LOCALES, defaultValue: 'en' },
  ],
  list: (token) => listNewsletterSubscribers(token),
  save: (token, body) => saveNewsletterSubscriber(token, body),
  remove: deleteNewsletterSubscriber,
};

export const featuredResource: SiteResourceConfig = {
  titleKey: 'admin.site.featured.title',
  descriptionKey: 'admin.site.featured.description',
  queryKey: 'admin-featured-products',
  idKey: 'id',
  canCreate: true,
  canEdit: true,
  canDelete: true,
  productField: 'productId',
  columns: [
    { key: 'product.name', labelKey: 'admin.site.fields.product' },
    { key: 'sortOrder', labelKey: 'admin.site.fields.sortOrder' },
    { key: 'cardImageUrl', labelKey: 'admin.site.fields.cardImageUrl' },
  ],
  fields: [
    { name: 'productId', labelKey: 'admin.site.fields.product', type: 'select', required: true, readOnlyOnEdit: true },
    { name: 'sortOrder', labelKey: 'admin.site.fields.sortOrder', type: 'number', defaultValue: 0 },
    { name: 'cardImageUrl', labelKey: 'admin.site.fields.cardImageUrl', type: 'image' },
  ],
  list: (token) => listFeaturedProducts(token),
  save: (token, body, id) =>
    saveFeaturedProduct(
      token,
      id
        ? {
            sortOrder: body.sortOrder,
            cardImageUrl: body.cardImageUrl,
          }
        : body,
      id,
    ),
  remove: deleteFeaturedProduct,
};
