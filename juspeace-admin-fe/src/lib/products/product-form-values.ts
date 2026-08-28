import type { Product } from '@/lib/api/types';
import type { ProductAddCategory, ProductAddFormValues } from '@/lib/products/product-add-schema';
import { formatProductSku } from '@/lib/products/product-display';

function inferCategoryValue(slug: string): ProductAddCategory {
  if (slug.includes('bracelet') || slug.includes('commitment')) {
    return 'bracelet';
  }

  if (slug.includes('candle')) {
    return 'home';
  }

  if (slug.includes('bottle') || slug.includes('tote')) {
    return 'essentials';
  }

  return 'general';
}

function formatPriceInput(priceCents: number): string {
  const dollars = priceCents / 100;
  return Number.isInteger(dollars) ? String(dollars) : dollars.toFixed(2);
}

export function productToFormValues(
  product: Product,
  descriptionFallback: string,
): ProductAddFormValues {
  return {
    name: product.name,
    sku: formatProductSku(product.slug),
    stock: String(product.stock),
    description: product.description?.trim() || descriptionFallback,
    basePrice: formatPriceInput(product.priceCents),
    discountType: '',
    discountValue: '',
    brand: 'Juspeace',
    category: inferCategoryValue(product.slug),
    status: product.status,
    tags: '',
  };
}
