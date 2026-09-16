'use client';

import type { Product } from '@/lib/api/types';
import { useCartStore } from '@/stores/cart-store';

interface CollectionCtaButtonProps {
  product: Product;
  label: string;
}

export function CollectionCtaButton({
  product,
  label,
}: CollectionCtaButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const inStock = product.stock > 0;

  return (
    <button
      type="button"
      disabled={!inStock}
      className="mt-5 min-w-[180px] bg-black px-6 py-3 font-sans text-sm text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      onClick={() =>
        addItem({
          id: product.id,
          slug: product.slug,
          name: product.name,
          priceCents: product.priceCents,
          currency: product.currency,
          imageUrl: product.imageUrl,
        })
      }
    >
      {label}
    </button>
  );
}
