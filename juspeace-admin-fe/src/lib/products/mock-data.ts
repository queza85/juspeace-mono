import type { KpiMetric } from '@/lib/dashboard/mock-data';
import { getProductImageSrc } from '@/lib/products/product-display';

function slugHash(slug: string): number {
  return slug.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

/** Preview KPI metrics for the products listing page (sample data). */
export const productsPageKpiMetrics: KpiMetric[] = [
  {
    id: 'products',
    labelKey: 'admin.products.kpi.products',
    value: '1,240',
    trend: '+24 New',
    trendDirection: 'new',
    badgeTone: 'green',
    iconTone: 'slate',
    subLabelKey: 'admin.products.kpi.activeListings',
    subValue: '980',
    footerDot: 'teal',
  },
  {
    id: 'orders',
    labelKey: 'admin.products.kpi.orders',
    value: '8,540',
    trend: '+5 New',
    trendDirection: 'new',
    badgeTone: 'purple',
    iconTone: 'lavender',
    subLabelKey: 'admin.products.kpi.totalOrders',
    subValue: '105K',
    footerDot: 'blue',
  },
  {
    id: 'sales',
    labelKey: 'admin.products.kpi.sales',
    value: '1,240',
    trend: '+8.2%',
    trendDirection: 'up',
    badgeTone: 'indigo',
    iconTone: 'slate',
    subLabelKey: 'admin.products.kpi.todaysSales',
    subValue: '$156K',
    footerDot: 'indigo',
  },
  {
    id: 'customers',
    labelKey: 'admin.products.kpi.customers',
    value: '184',
    trend: '+4 New',
    trendDirection: 'new',
    badgeTone: 'purple',
    iconTone: 'lavender',
    subLabelKey: 'admin.products.kpi.totalCustomers',
    subValue: '58,320',
    footerDot: 'lavender',
  },
  {
    id: 'revenue',
    labelKey: 'admin.products.kpi.revenue',
    value: '$1.2M',
    trend: '+4.5%',
    trendDirection: 'up',
    badgeTone: 'orange',
    iconTone: 'sky',
    subLabelKey: 'admin.products.kpi.totalRevenue',
    subValue: '$12.8M',
    footerDot: 'orange',
  },
];

const GALLERY_IMAGES = [
  '/product-feature/pf1.png',
  '/product-feature/pf2.png',
  '/product-feature/pf3.png',
  '/product-feature/pf5.png',
  '/product-feature/pf6.png',
  '/product-collection/juespeace_mar4.png',
  '/product-collection/juspeace_mr3.png',
  '/product-collection/ju_mar6.png',
] as const;

export type ProductReviewStatus = 'published' | 'pending';

export interface ProductReviewRow {
  id: string;
  reviewerName: string;
  reviewerEmail: string;
  avatarSrc?: string;
  rating: number;
  titleKey: string;
  excerptKey: string;
  date: string;
  time: string;
  status: ProductReviewStatus;
}

export interface ProductReviewSummary {
  averageRating: number;
  totalReviews: number;
  newThisWeek: number;
  distribution: Array<{ stars: number; count: number }>;
}

export function getProductGalleryImages(
  slug: string,
  apiImageUrl?: string | null,
): string[] {
  const primary = getProductImageSrc(slug, apiImageUrl);
  const hash = slugHash(slug);
  const gallery = new Set<string>();

  if (primary) {
    gallery.add(primary);
  }

  for (let index = 0; index < 3; index += 1) {
    gallery.add(GALLERY_IMAGES[(hash + index) % GALLERY_IMAGES.length]);
  }

  return Array.from(gallery).slice(0, 3);
}

export function getProductDetailBullets(): string[] {
  return [
    'admin.products.detail.bullets.1',
    'admin.products.detail.bullets.2',
    'admin.products.detail.bullets.3',
    'admin.products.detail.bullets.4',
  ];
}

export function getProductReviewSummary(slug: string): ProductReviewSummary {
  const hash = slugHash(slug);

  return {
    averageRating: 4.92,
    totalReviews: 859 + (hash % 40),
    newThisWeek: 12,
    distribution: [
      { stars: 5, count: 128 },
      { stars: 4, count: 37 },
      { stars: 3, count: 15 },
      { stars: 2, count: 7 },
      { stars: 1, count: 2 },
    ],
  };
}

const REVIEW_SAMPLES = [
  {
    id: '1',
    reviewerName: 'Sophia Lee',
    reviewerEmail: 'sophia.lee@email.com',
    avatarSrc: '/product-feature/pf1.png',
    rating: 5,
    titleKey: 'admin.products.detail.reviews.samples.1.title',
    excerptKey: 'admin.products.detail.reviews.samples.1.excerpt',
    date: '22 Apr, 2025',
    time: '04:12 PM',
    status: 'published' as const,
  },
  {
    id: '2',
    reviewerName: 'Michael Chen',
    reviewerEmail: 'michael.chen@email.com',
    avatarSrc: '/product-feature/pf2.png',
    rating: 5,
    titleKey: 'admin.products.detail.reviews.samples.2.title',
    excerptKey: 'admin.products.detail.reviews.samples.2.excerpt',
    date: '19 Apr, 2025',
    time: '11:48 AM',
    status: 'published' as const,
  },
  {
    id: '3',
    reviewerName: 'Emma Wilson',
    reviewerEmail: 'emma.wilson@email.com',
    avatarSrc: '/product-feature/pf3.png',
    rating: 4,
    titleKey: 'admin.products.detail.reviews.samples.3.title',
    excerptKey: 'admin.products.detail.reviews.samples.3.excerpt',
    date: '15 Apr, 2025',
    time: '09:05 PM',
    status: 'pending' as const,
  },
  {
    id: '4',
    reviewerName: 'James Carter',
    reviewerEmail: 'james.carter@email.com',
    avatarSrc: '/product-feature/pf5.png',
    rating: 5,
    titleKey: 'admin.products.detail.reviews.samples.4.title',
    excerptKey: 'admin.products.detail.reviews.samples.4.excerpt',
    date: '12 Apr, 2025',
    time: '02:30 PM',
    status: 'published' as const,
  },
] as const;

export function getProductReviews(slug: string): ProductReviewRow[] {
  return REVIEW_SAMPLES.map((review) => ({
    ...review,
    id: `${slug}-${review.id}`,
  }));
}
