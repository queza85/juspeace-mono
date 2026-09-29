import type { Product } from '@/lib/api/types';

export type VariantKey = 'black' | 'white' | 'stripe';

export const COLLECTION_VARIANTS: VariantKey[] = ['black', 'white', 'stripe'];

/** Landing collection stock counts when API data is missing or for fallbacks. */
export const COLLECTION_STOCK_BY_VARIANT: Record<VariantKey, number> = {
  black: 20,
  white: 15,
  stripe: 18,
};

/** Canonical slugs used when the API has no matching product yet. */
export const VARIANT_DETAIL_SLUGS: Record<VariantKey, string> = {
  black: 'black-strong-commitment',
  white: 'white-pure-hope',
  stripe: 'stripe-harmony-peace',
};

/** Envelope packaging shots for the landing collection cards. */
export const VARIANT_MAIN_IMAGES: Record<
  VariantKey,
  { src: string; width: number; height: number }
> = {
  black: {
    src: '/product-collection/product-collection-one.png',
    width: 1080,
    height: 1350,
  },
  white: {
    src: '/product-collection/product-collection-two.png',
    width: 1080,
    height: 1350,
  },
  stripe: {
    src: '/product-collection/product-collection-three.png',
    width: 1080,
    height: 1350,
  },
};

/** Bracelet product photography for PDP, cart, and related items. */
export const VARIANT_PRODUCT_IMAGES: Record<
  VariantKey,
  { src: string; width: number; height: number }
> = {
  black: {
    src: '/marque/juespeace_mar4.png',
    width: 744,
    height: 930,
  },
  white: {
    src: '/marque/juspeace_mr3.png',
    width: 726,
    height: 920,
  },
  stripe: {
    src: '/marque/ju_mar6.png',
    width: 746,
    height: 926,
  },
};

export const VARIANT_GALLERY_IMAGES: Record<VariantKey, string[]> = {
  black: [
    VARIANT_PRODUCT_IMAGES.black.src,
    '/product-feature/pf1.png',
    '/product-feature/pf2.png',
    '/product-feature/pf3.png',
  ],
  white: [
    VARIANT_PRODUCT_IMAGES.white.src,
    '/product-feature/pf2.png',
    '/product-feature/pf5.png',
    '/product-feature/pf6.png',
  ],
  stripe: [
    VARIANT_PRODUCT_IMAGES.stripe.src,
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
    stock: COLLECTION_STOCK_BY_VARIANT[variantKey],
    status: 'ACTIVE',
    imageUrl: VARIANT_PRODUCT_IMAGES[variantKey].src,
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
