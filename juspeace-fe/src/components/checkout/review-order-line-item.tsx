'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useFormatPrice, useT } from '@/lib/i18n/locale-context';
import { resolveCartItemImage } from '@/lib/products/cart-item-image';
import type { CartItem } from '@/stores/cart-store';
import { useCartStore } from '@/stores/cart-store';

interface ReviewOrderLineItemProps {
  item: CartItem;
}

function formatReviewPrice(
  formatPrice: (priceCents: number, currency?: string) => string,
  priceCents: number,
  currency: string,
) {
  const formatted = formatPrice(priceCents, currency);
  if (currency === 'USD') {
    return formatted.replace(/^\$/, '$ ');
  }
  return formatted;
}

export function ReviewOrderLineItem({ item }: ReviewOrderLineItemProps) {
  const t = useT();
  const formatPrice = useFormatPrice();
  const updateItemQuantity = useCartStore((state) => state.updateItemQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const lineTotal = item.product.priceCents * item.quantity;
  const imageSrc = resolveCartItemImage(item);

  return (
    <article className="border-b border-black/10 px-4 py-4 last:border-b-0 sm:px-5 sm:py-5">
      <div className="flex gap-3 sm:gap-4">
        <Link
          href={`/products/${item.product.slug}`}
          className="relative block size-[72px] shrink-0 overflow-hidden rounded-sm bg-jp-light-gray sm:size-20"
        >
          <Image
            src={imageSrc}
            alt={item.product.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        </Link>

        <div className="flex min-h-[72px] min-w-0 flex-1 gap-3 sm:min-h-20 sm:gap-4">
          <div className="flex min-w-0 flex-1 flex-col">
            <Link
              href={`/products/${item.product.slug}`}
              className="font-display text-xs font-semibold leading-snug text-black transition-opacity hover:opacity-70 sm:text-sm"
            >
              {item.product.name}
            </Link>

            <p className="mt-1.5 font-mono text-[11px] text-jp-muted sm:text-xs">
              {t('cart.summaryLineQty', { count: item.quantity })}
            </p>

            <div className="mt-auto pt-2.5">
              <div className="flex h-8 w-[88px] items-center justify-between border border-black/10 bg-jp-light-gray px-2.5">
                <button
                  type="button"
                  aria-label={t('landing.collection.qtyDecrease')}
                  className="flex size-4 items-center justify-center disabled:opacity-40"
                  onClick={() =>
                    updateItemQuantity(item.product.id, item.quantity - 1)
                  }
                >
                  <Minus className="size-3" strokeWidth={1.5} />
                </button>
                <span className="font-mono text-xs text-black">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  aria-label={t('landing.collection.qtyIncrease')}
                  className="flex size-4 items-center justify-center"
                  onClick={() =>
                    updateItemQuantity(item.product.id, item.quantity + 1)
                  }
                >
                  <Plus className="size-3" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end justify-between py-0.5">
            <p className="font-display text-sm font-bold text-black sm:text-base">
              {formatReviewPrice(
                formatPrice,
                lineTotal,
                item.product.currency,
              )}
            </p>
            <button
              type="button"
              aria-label={t('cart.removeItem', { name: item.product.name })}
              className="text-black/45 transition-colors hover:text-black"
              onClick={() => removeItem(item.product.id)}
            >
              <Trash2 className="size-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
