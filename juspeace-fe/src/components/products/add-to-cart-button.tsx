'use client';

import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';
import type { Product } from '@/lib/api/types';
import { useCartStore } from '@/stores/cart-store';

interface AddToCartButtonProps {
  product: Product;
  disabled?: boolean;
}

export function AddToCartButton({ product, disabled }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <Button
      size="lg"
      disabled={disabled}
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
      {t('common.addToCart')}
    </Button>
  );
}
