import {
  detectVariantKeyFromSlug,
  VARIANT_MAIN_IMAGES,
} from '@/lib/products/variant-images';
import type { CartItem } from '@/stores/cart-store';

/** Resolve a display image for cart rows when API imageUrl is missing. */
export function resolveCartItemImage(item: CartItem): string {
  if (item.product.imageUrl) {
    return item.product.imageUrl;
  }

  const variantKey = detectVariantKeyFromSlug(item.product.slug);
  return VARIANT_MAIN_IMAGES[variantKey].src;
}
