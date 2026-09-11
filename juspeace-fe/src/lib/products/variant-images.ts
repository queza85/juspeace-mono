import type { Product } from '@/lib/api/types';

export type VariantKey = 'black' | 'white' | 'stripe';

export const COLLECTION_VARIANTS: VariantKey[] = ['black', 'white', 'stripe'];

/** Canonical slugs used when the API has no matching product yet. */
export const VARIANT_DETAIL_SLUGS: Record<VariantKey, string> = {
  black: 'black-strong-commitment',
  white: 'white-pure-hope',
  stripe: 'stripe-harmony-peace',
};

export const VARIANT_MAIN_IMAGES: Record<
  VariantKey,
  { src: string; width: number; height: number }
> = {
  black: {
    src: '/product-collection-one.png',
    width: 1080,
    height: 1350,
  },
  white: {
    src: '/product-collection-two.png',
    width: 1080,
    height: 1350,
  },
  stripe: {
    src: '/product-collection-three.png',
    width: 1080,
    height: 1350,
  },
};

export const VARIANT_GALLERY_IMAGES: Record<VariantKey, string[]> = {
  black: [
    '/product-collection-one.png',
    '/product-feature/pf1.png',
    '/product-feature/pf2.png',
    '/product-feature/pf3.png',
  ],
  white: [
    '/product-collection-two.png',
    '/product-feature/pf2.png',
    '/product-feature/pf5.png',
    '/product-feature/pf6.png',
  ],
  stripe: [
    '/product-collection-three.png',
    '/product-feature/pf1.png',
    '/product-feature/pf3.png',
    '/product-feature/pf5.png',
  ],
};

/** PDP "Close Up Image" tab — 3× grid, 4th tile left-aligned on row 2 (Figma). */
export const CLOSE_UP_IMAGES = [
  { src: '/product-feature/pf2.png', width: 502, height: 494 },
  { src: '/product-feature/pf3.png', width: 498, height: 484 },
  { src: '/product-feature/pf6.png', width: 488, height: 488 },
  { src: '/product-feature/pf5.png', width: 484, height: 478 },
] as const;

export function detectVariantKeyFromSlug(slug: string): VariantKey {
  const haystack = slug.toLowerCase();
  if (haystack.includes('black')) return 'black';
  if (haystack.includes('stripe')) return 'stripe';
  if (haystack.includes('white')) return 'white';
  return 'white';
}

export function detectVariantKey(product: Pick<Product, 'slug' | 'name'>): VariantKey {
  return detectVariantKeyFromSlug(`${product.slug} ${product.name}`);
}

export function getProductDetailHref(
  variantKey: VariantKey,
  product?: Product | null,
): string {
  if (product?.slug) return `/products/${product.slug}`;
  return `/products/${VARIANT_DETAIL_SLUGS[variantKey]}`;
}

export function isKnownProductSlug(slug: string): boolean {
  const normalized = slug.toLowerCase();
  if (Object.values(VARIANT_DETAIL_SLUGS).includes(normalized)) return true;
  return /black|white|stripe/.test(normalized);
}

export function createFallbackProduct(
  slug: string,
  variantKey: VariantKey,
  labels: { name: string; description: string },
): Product {
  return {
    id: `fallback-${variantKey}`,
    slug,
    name: labels.name,
    description: labels.description,
    priceCents: 150_00,
    currency: 'USD',
    stock: 20,
    status: 'ACTIVE',
    imageUrl: VARIANT_MAIN_IMAGES[variantKey].src,
  };
}

export function buildFallbackCatalog(
  labelsByVariant: Record<VariantKey, { name: string; description: string }>,
  excludeSlug?: string,
): Product[] {
  return COLLECTION_VARIANTS.map((variantKey) =>
    createFallbackProduct(
      VARIANT_DETAIL_SLUGS[variantKey],
      variantKey,
      labelsByVariant[variantKey],
    ),
  ).filter((product) => product.slug !== excludeSlug);
}

export function getFallbackI18nPrefix(variantKey: VariantKey): string {
  return `landing.collection.fallback${variantKey[0].toUpperCase()}${variantKey.slice(1)}`;
}
