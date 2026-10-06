export const CONTACT_INQUIRY_STATUSES = ['WAITING', 'REPLIED'] as const;

export type ContactInquiryStatusName =
  (typeof CONTACT_INQUIRY_STATUSES)[number];

export const CONTENT_LOCALES = ['en', 'ko'] as const;

export type ContentLocale = (typeof CONTENT_LOCALES)[number];

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

/** Methods the checkout UI can list. Charges stay dummy until a PG is connected. */
export const PAYMENT_METHOD_CODES = [
  'CARD',
  'APPLE_PAY',
  'GOOGLE_PAY',
  'PAYPAL',
  'BANK_TRANSFER',
] as const;

export type PaymentMethodCode = (typeof PAYMENT_METHOD_CODES)[number];

export const DUMMY_PAYMENT_PROVIDER = 'DUMMY' as const;
