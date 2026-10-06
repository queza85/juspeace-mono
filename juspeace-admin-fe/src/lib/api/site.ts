import { apiRequest, getApiBaseUrl } from './client';

export interface ContentBlock {
  id: string;
  section: string;
  locale: string;
  title: string;
  subtitle: string | null;
  body: string | null;
  imageUrl: string | null;
  href: string | null;
  sortOrder: number;
  published: boolean;
}

export interface SiteSetting {
  key: string;
  value: string;
  updatedAt: string;
}

export interface ShippingMethod {
  id: string;
  code: string;
  name: string;
  description: string | null;
  priceCents: number;
  currency: string;
  estimatedDays: string | null;
  enabled: boolean;
  sortOrder: number;
}

export interface PaymentMethodConfig {
  id: string;
  code: string;
  name: string;
  enabled: boolean;
  provider: 'DUMMY';
  sortOrder: number;
  instructions: string | null;
}

export interface Promotion {
  id: string;
  code: string;
  name: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  startsAt: string | null;
  endsAt: string | null;
  usageLimit: number | null;
  usedCount: number;
  active: boolean;
}

export interface ProductReview {
  id: string;
  productId: string;
  rating: number;
  title: string | null;
  body: string;
  reviewerName: string;
  published: boolean;
  product: { id: string; slug: string; name: string };
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
}

export interface Customer {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  locale: string | null;
  createdAt: string;
}

export interface FeaturedProduct {
  id: string;
  productId: string;
  sortOrder: number;
  cardImageUrl: string | null;
  product: {
    id: string;
    slug: string;
    name: string;
    priceCents: number;
    currency: string;
    imageUrl: string | null;
  };
}

type Body = Record<string, unknown>;

function authed(accessToken: string) {
  return { accessToken, noStore: true as const };
}

function mutation(accessToken: string, method: 'POST' | 'PATCH' | 'DELETE', body?: Body) {
  return {
    ...authed(accessToken),
    notify: 'both' as const,
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  };
}

export function listContentBlocks(accessToken: string) {
  return apiRequest<ContentBlock[]>('/admin/content-blocks', authed(accessToken));
}

export function saveContentBlock(accessToken: string, body: Body, id: string | null) {
  return apiRequest<ContentBlock>(
    id ? `/admin/content-blocks/${id}` : '/admin/content-blocks',
    mutation(accessToken, id ? 'PATCH' : 'POST', body),
  );
}

export function deleteContentBlock(accessToken: string, id: string) {
  return apiRequest<ContentBlock>(
    `/admin/content-blocks/${id}`,
    mutation(accessToken, 'DELETE'),
  );
}

export function listSiteSettings(accessToken: string) {
  return apiRequest<SiteSetting[]>('/admin/site-settings', authed(accessToken));
}

export function saveSiteSetting(accessToken: string, body: Body) {
  return apiRequest<SiteSetting>('/admin/site-settings', mutation(accessToken, 'POST', body));
}

export function listShippingMethods(accessToken: string) {
  return apiRequest<ShippingMethod[]>('/admin/shipping-methods', authed(accessToken));
}

export function saveShippingMethod(accessToken: string, body: Body, id: string | null) {
  return apiRequest<ShippingMethod>(
    id ? `/admin/shipping-methods/${id}` : '/admin/shipping-methods',
    mutation(accessToken, id ? 'PATCH' : 'POST', body),
  );
}

export function deleteShippingMethod(accessToken: string, id: string) {
  return apiRequest<ShippingMethod>(
    `/admin/shipping-methods/${id}`,
    mutation(accessToken, 'DELETE'),
  );
}

export function listPaymentMethods(accessToken: string) {
  return apiRequest<PaymentMethodConfig[]>('/admin/payment-methods', authed(accessToken));
}

export function savePaymentMethod(accessToken: string, body: Body, id: string | null) {
  return apiRequest<PaymentMethodConfig>(
    id ? `/admin/payment-methods/${id}` : '/admin/payment-methods',
    mutation(accessToken, id ? 'PATCH' : 'POST', body),
  );
}

export function deletePaymentMethod(accessToken: string, id: string) {
  return apiRequest<PaymentMethodConfig>(
    `/admin/payment-methods/${id}`,
    mutation(accessToken, 'DELETE'),
  );
}

export function listPromotions(accessToken: string) {
  return apiRequest<Promotion[]>('/admin/promotions', authed(accessToken));
}

export function savePromotion(accessToken: string, body: Body, id: string | null) {
  return apiRequest<Promotion>(
    id ? `/admin/promotions/${id}` : '/admin/promotions',
    mutation(accessToken, id ? 'PATCH' : 'POST', body),
  );
}

export function deletePromotion(accessToken: string, id: string) {
  return apiRequest<Promotion>(`/admin/promotions/${id}`, mutation(accessToken, 'DELETE'));
}

export function listReviews(accessToken: string) {
  return apiRequest<ProductReview[]>('/admin/reviews', authed(accessToken));
}

export function saveReview(accessToken: string, body: Body, id: string | null) {
  return apiRequest<ProductReview>(
    id ? `/admin/reviews/${id}` : '/admin/reviews',
    mutation(accessToken, id ? 'PATCH' : 'POST', body),
  );
}

export function deleteReview(accessToken: string, id: string) {
  return apiRequest<ProductReview>(`/admin/reviews/${id}`, mutation(accessToken, 'DELETE'));
}

export function listCategories(accessToken: string) {
  return apiRequest<Category[]>('/admin/categories', authed(accessToken));
}

export function saveCategory(accessToken: string, body: Body, id: string | null) {
  return apiRequest<Category>(
    id ? `/admin/categories/${id}` : '/admin/categories',
    mutation(accessToken, id ? 'PATCH' : 'POST', body),
  );
}

export function deleteCategory(accessToken: string, id: string) {
  return apiRequest<Category>(`/admin/categories/${id}`, mutation(accessToken, 'DELETE'));
}

export function listCustomers(accessToken: string) {
  return apiRequest<Customer[]>('/admin/customers', authed(accessToken));
}

export function saveCustomer(accessToken: string, body: Body, id: string | null) {
  return apiRequest<Customer>(`/admin/customers/${id}`, mutation(accessToken, 'PATCH', body));
}

export function listNewsletterSubscribers(accessToken: string) {
  return apiRequest<NewsletterSubscriber[]>('/admin/newsletter-subscribers', authed(accessToken));
}

export function saveNewsletterSubscriber(accessToken: string, body: Body) {
  return apiRequest<NewsletterSubscriber>(
    '/admin/newsletter-subscribers',
    mutation(accessToken, 'POST', body),
  );
}

export function deleteNewsletterSubscriber(accessToken: string, id: string) {
  return apiRequest<NewsletterSubscriber>(
    `/admin/newsletter-subscribers/${id}`,
    mutation(accessToken, 'DELETE'),
  );
}

export function listFeaturedProducts(accessToken: string) {
  return apiRequest<FeaturedProduct[]>('/admin/featured-products', authed(accessToken));
}

export function saveFeaturedProduct(accessToken: string, body: Body, id: string | null) {
  return apiRequest<FeaturedProduct>(
    id ? `/admin/featured-products/${id}` : '/admin/featured-products',
    mutation(accessToken, id ? 'PATCH' : 'POST', body),
  );
}

export interface UploadedImage {
  path: string;
  url: string;
  contentType: string;
}

/** Turn a stored blob path into the API proxy URL used by <img>. */
export function storedFileUrl(value: string): string {
  if (value.startsWith('images/')) {
    return `${getApiBaseUrl()}/files?fileName=${encodeURIComponent(value)}`;
  }
  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('/')
  ) {
    return value;
  }
  return '';
}

export function uploadImage(accessToken: string, file: File) {
  const body = new FormData();
  body.append('file', file);
  body.append('type', 'image');
  return apiRequest<UploadedImage>('/admin/files', {
    method: 'POST',
    accessToken,
    noStore: true,
    notify: 'both',
    body,
  });
}

export function deleteFeaturedProduct(accessToken: string, id: string) {
  return apiRequest<FeaturedProduct>(
    `/admin/featured-products/${id}`,
    mutation(accessToken, 'DELETE'),
  );
}
