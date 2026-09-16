'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useFormatPrice, useT } from '@/lib/i18n/locale-context';
import { resolveCartItemImage } from '@/lib/products/cart-item-image';
import type { CartItem } from '@/stores/cart-store';
import { useCartStore } from '@/stores/cart-store';

interface CartLineItemProps {
  item: CartItem;
}

function formatCartPrice(
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

export function CartLineItem({ item }: CartLineItemProps) {
  const t = useT();
  const formatPrice = useFormatPrice();
  const updateItemQuantity = useCartStore((state) => state.updateItemQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const lineTotal = item.product.priceCents * item.quantity;
  const imageSrc = resolveCartItemImage(item);

  return (
    <article className="border-b border-black/10 px-4 py-5 last:border-b-0 sm:px-6 sm:py-6">
      <div className="flex gap-4 sm:gap-5">
        <Link
          href={`/products/${item.product.slug}`}
          className="relative block size-[88px] shrink-0 overflow-hidden rounded-sm bg-jp-light-gray sm:size-[100px]"
        >
          <Image
            src={imageSrc}
            alt={item.product.name}
            fill
            className="object-cover"
            sizes="100px"
          />
        </Link>

        <div className="flex min-h-[88px] min-w-0 flex-1 gap-4 sm:min-h-[100px] sm:gap-6">
          <div className="flex min-w-0 flex-1 flex-col">
            <Link
              href={`/products/${item.product.slug}`}
              className="font-display text-sm font-semibold leading-snug text-black transition-opacity hover:opacity-70 sm:text-base"
            >
              {item.product.name}
            </Link>

            <p className="mt-2 font-mono text-xs text-jp-muted">
              {t('cart.qtyLabel', { count: item.quantity })}
            </p>

            <div className="mt-auto pt-3">
              <div className="flex h-9 w-[96px] items-center justify-between border border-black/10 bg-jp-light-gray px-3">
                <button
                  type="button"
                  aria-label={t('landing.collection.qtyDecrease')}
                  className="flex size-5 items-center justify-center disabled:opacity-40"
                  onClick={() =>
                    updateItemQuantity(item.product.id, item.quantity - 1)
                  }
                >
                  <Minus className="size-3" strokeWidth={1.5} />
                </button>
                <span className="font-mono text-sm text-black">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  aria-label={t('landing.collection.qtyIncrease')}
                  className="flex size-5 items-center justify-center"
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
            <p className="font-display text-sm font-semibold text-black sm:text-base">
              {formatCartPrice(
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
              <Trash2 className="size-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
