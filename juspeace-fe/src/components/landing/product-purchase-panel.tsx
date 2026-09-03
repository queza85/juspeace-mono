'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { useT } from '@/lib/i18n/locale-context';
import type { Product } from '@/lib/api/types';
import { useCartStore } from '@/stores/cart-store';

interface ProductPurchasePanelProps {
  product?: Product | null;
  panelName: string;
  variantLabel: string;
  stock: number;
  detailsHref?: string;
}

export function ProductPurchasePanel({
  product,
  panelName,
  variantLabel,
  stock,
  detailsHref,
}: ProductPurchasePanelProps) {
  const t = useT();
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);

  const canBuy = Boolean(product) && stock > 0;

  return (
    <div className="relative w-full max-w-[480px] rounded-[20px] border border-black/6 bg-jp-card p-3.5 sm:p-4">
      <p className="font-serif text-base text-black sm:text-lg">{panelName}</p>
      <p className="mt-1.5 font-mono text-xs leading-5 text-jp-muted sm:text-sm">
        {variantLabel}|{' '}
        <span className="text-jp-stock-red">
          {t('landing.collection.stocks', { count: stock.toFixed(2) })}
        </span>
      </p>

      {detailsHref ? (
        <Link
          href={detailsHref}
          className="mt-0.5 inline-block font-mono text-xs text-jp-muted underline underline-offset-4 transition-colors hover:text-black"
        >
          {t('landing.collection.moreDetails')}
        </Link>
      ) : (
        <span className="mt-0.5 inline-block font-mono text-xs text-jp-muted underline underline-offset-4">
          {t('landing.collection.moreDetails')}
        </span>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 sm:absolute sm:right-4 sm:top-[42px] sm:mt-0">
        <div className="flex h-9 w-[80px] items-center justify-between border border-black/10 bg-white px-2">
          <button
            type="button"
            aria-label={t('landing.collection.qtyDecrease')}
            className="flex size-4 items-center justify-center"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
          >
            <Minus className="size-2.5" />
          </button>
          <span className="font-mono text-sm">{quantity}</span>
          <button
            type="button"
            aria-label={t('landing.collection.qtyIncrease')}
            className="flex size-4 items-center justify-center"
            onClick={() => setQuantity((value) => value + 1)}
          >
            <Plus className="size-2.5" />
          </button>
        </div>

        <button
          type="button"
          disabled={!canBuy}
          className="inline-flex h-9 min-w-[112px] items-center justify-center bg-white px-4 font-mono text-sm text-black disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => {
            if (!product) return;
            addItem(
              {
                id: product.id,
                slug: product.slug,
                name: product.name,
                priceCents: product.priceCents,
                currency: product.currency,
                imageUrl: product.imageUrl,
              },
              quantity,
            );
          }}
        >
          {t('landing.collection.buyNow')}
        </button>
      </div>
    </div>
  );
}
