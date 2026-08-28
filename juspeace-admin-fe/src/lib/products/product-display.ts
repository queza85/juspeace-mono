import type { Locale } from '@/lib/i18n/config';
import type { OrderStatusTone } from '@/lib/dashboard/mock-data';
import type { Product, ProductStatus } from '@/lib/api/types';

export type PriceRangeFilter = 'all' | 'under50' | '50to100' | 'over100';

/** Local product thumbnails copied from juspeace-fe/public. */
const PRODUCT_IMAGES_BY_SLUG: Record<string, string> = {
  'organic-cotton-tote': '/product-collection/juspeace_mr3.png',
  'bamboo-water-bottle': '/product-collection/ju_mar6.png',
  'hand-poured-soy-candle': '/product-collection/juespeace_mar4.png',
  'white-pure-hope': '/product-feature/pf1.png',
};

const FALLBACK_PRODUCT_IMAGES = [
  '/product-feature/pf1.png',
  '/product-feature/pf2.png',
  '/product-feature/pf3.png',
  '/product-feature/pf5.png',
  '/product-feature/pf6.png',
  '/product-collection/juespeace_mar4.png',
  '/product-collection/juspeace_mr3.png',
  '/product-collection/ju_mar6.png',
] as const;

export function getProductImageSrc(
  slug: string,
  apiImageUrl?: string | null,
): string | undefined {
  const localImage = PRODUCT_IMAGES_BY_SLUG[slug];
  if (localImage) {
    return localImage;
  }

  if (apiImageUrl?.startsWith('/')) {
    return apiImageUrl;
  }

  const hash = slug.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return FALLBACK_PRODUCT_IMAGES[hash % FALLBACK_PRODUCT_IMAGES.length];
}

export function formatProductSku(slug: string): string {
  const code = slug
    .split('-')
    .map((part) => part.slice(0, 3).toUpperCase())
    .join('')
    .slice(0, 8);

  return `JP-${code || slug.slice(0, 5).toUpperCase()}`;
}

export function productStatusTone(status: ProductStatus): OrderStatusTone {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'DRAFT':
      return 'warning';
    case 'ARCHIVED':
      return 'neutral';
    default:
      return 'neutral';
  }
}

export function productStatusLabelKey(status: ProductStatus): string {
  return `admin.products.status.${status}`;
}

export function matchesPriceRange(
  priceCents: number,
  range: PriceRangeFilter,
): boolean {
  if (range === 'all') {
    return true;
  }

  const dollars = priceCents / 100;

  switch (range) {
    case 'under50':
      return dollars < 50;
    case '50to100':
      return dollars >= 50 && dollars <= 100;
    case 'over100':
      return dollars > 100;
    default:
      return true;
  }
}

export function matchesSearch(product: Product, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  const sku = formatProductSku(product.slug).toLowerCase();

  return (
    product.name.toLowerCase().includes(normalized) ||
    product.slug.toLowerCase().includes(normalized) ||
    sku.includes(normalized)
  );
}

export function inferCategoryLabel(slug: string): string {
  if (slug.includes('bracelet') || slug.includes('commitment')) {
    return 'Bracelet';
  }

  if (slug.includes('candle')) {
    return 'Home';
  }

  if (slug.includes('bottle') || slug.includes('tote')) {
    return 'Essentials';
  }

  return 'General';
}

export type ProductSortColumn =
  | 'product'
  | 'category'
  | 'stock'
  | 'price'
  | 'orders'
  | 'status'
  | 'published';

export type SortDirection = 'asc' | 'desc';

export function getMockOrderCount(slug: string): number {
  const hash = slug.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return 40 + (hash % 200);
}

export function getMockPublishedTimestamp(slug: string): number {
  const hash = slug.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return new Date(2025, 3, 1 + (hash % 28), 12 + (hash % 8), hash % 60).getTime();
}

export function sortProducts(
  products: Product[],
  column: ProductSortColumn,
  direction: SortDirection,
): Product[] {
  const sorted = [...products];

  sorted.sort((left, right) => {
    let comparison = 0;

    switch (column) {
      case 'product':
        comparison = left.name.localeCompare(right.name);
        break;
      case 'category':
        comparison = inferCategoryLabel(left.slug).localeCompare(
          inferCategoryLabel(right.slug),
        );
        break;
      case 'stock':
        comparison = left.stock - right.stock;
        break;
      case 'price':
        comparison = left.priceCents - right.priceCents;
        break;
      case 'orders':
        comparison = getMockOrderCount(left.slug) - getMockOrderCount(right.slug);
        break;
      case 'status':
        comparison = left.status.localeCompare(right.status);
        break;
      case 'published':
        comparison =
          getMockPublishedTimestamp(left.slug) -
          getMockPublishedTimestamp(right.slug);
        break;
      default:
        comparison = 0;
    }

    if (comparison === 0) {
      comparison = left.name.localeCompare(right.name);
    }

    return direction === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

export function getMockPublishedAt(
  slug: string,
  locale: Locale,
): { date: string; time: string } {
  const hash = slug.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const publishedAt = new Date(
    2025,
    3,
    1 + (hash % 28),
    12 + (hash % 8),
    hash % 60,
  );

  const date = new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(publishedAt);

  const time = new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(publishedAt);

  return { date, time };
}

/** Single-line published label for product detail (Figma: "28 Apr, 2025 10:15 AM"). */
export function formatProductPublishedAt(slug: string, locale: Locale): string {
  const { date, time } = getMockPublishedAt(slug, locale);

  if (locale === 'ko') {
    return `${date} ${time}`;
  }

  const formattedDate = date.replace(/^(\d+ \w+) (\d{4})$/, '$1, $2');
  return `${formattedDate} ${time}`;
}
