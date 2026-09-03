'use client';

import { Minus, Package, Plus, Star, Truck } from 'lucide-react';
import { useState } from 'react';
import { useFormatPrice, useT } from '@/lib/i18n/locale-context';
import type { Product } from '@/lib/api/types';
import { useCartStore } from '@/stores/cart-store';
import { cn } from '@/lib/utils';

interface ProductDetailPurchaseProps {
  product: Product;
  displayName: string;
  tagline: string;
  reviewCount?: number;
  className?: string;
}

function formatPdpPrice(
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

function StarRating({ reviewCount }: { reviewCount: number }) {
  const t = useT();

  return (
    <div
      className="flex items-center gap-1"
      aria-label={t('products.detail.ratingLabel', { count: 5 })}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className="size-3 fill-[#f5a623] text-[#f5a623]"
          aria-hidden
        />
      ))}
      <span className="ml-0.5 font-mono text-xs text-black">
        {t('products.detail.reviewsCount', { count: reviewCount })}
      </span>
    </div>
  );
}

export function ProductDetailPurchase({
  product,
  displayName,
  tagline,
  reviewCount = 3,
  className,
}: ProductDetailPurchaseProps) {
  const t = useT();
  const formatPrice = useFormatPrice();
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);

  const inStock = product.stock > 0;
  const canBuy = inStock;

  const handleAddToCart = () => {
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
  };

  return (
    <div className={cn('flex min-h-0 min-w-0 flex-col lg:min-h-[564px]', className)}>
      <h1 className="font-display text-[clamp(1.875rem,3vw,2.5rem)] font-black leading-[1.15] tracking-tight text-black">
        {displayName}
      </h1>

      <p className="mt-3 font-display text-xl font-normal text-black">
        {formatPdpPrice(formatPrice, product.priceCents, product.currency)}
      </p>

      <p className="mt-6 min-h-[4.75rem] max-w-[420px] font-mono text-xs leading-[1.75] text-black sm:text-[13px] sm:leading-[1.8]">
        {tagline}
      </p>

      <div className="mt-5">
        <StarRating reviewCount={reviewCount} />
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-5 sm:gap-6">
        <div className="flex h-11 w-[104px] items-center justify-between border border-black/10 bg-jp-light-gray px-3">
          <button
            type="button"
            aria-label={t('landing.collection.qtyDecrease')}
            className="flex size-5 items-center justify-center disabled:opacity-40"
            disabled={!canBuy || quantity <= 1}
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
          >
            <Minus className="size-3" strokeWidth={1.5} />
          </button>
          <span className="font-mono text-sm text-black">{quantity}</span>
          <button
            type="button"
            aria-label={t('landing.collection.qtyIncrease')}
            className="flex size-5 items-center justify-center disabled:opacity-40"
            disabled={!canBuy}
            onClick={() => setQuantity((value) => value + 1)}
          >
            <Plus className="size-3" strokeWidth={1.5} />
          </button>
        </div>

        {inStock ? (
          <div className="font-mono text-xs leading-5 text-black sm:text-[13px]">
            <p>
              {t('products.detail.onlyItemsLeftBefore')}{' '}
              <span className="text-jp-accent-teal">
                {t('products.detail.onlyItemsLeftHighlight', {
                  count: product.stock,
                })}
              </span>{' '}
              {t('products.detail.onlyItemsLeftAfter')}
            </p>
            <p className="text-black">{t('products.detail.dontMiss')}</p>
          </div>
        ) : (
          <p className="font-mono text-sm text-jp-stock-red">
            {t('common.outOfStock')}
          </p>
        )}
      </div>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:gap-3">
        <button
          type="button"
          disabled={!canBuy}
          onClick={handleAddToCart}
          className="inline-flex h-12 flex-1 items-center justify-center bg-black px-6 font-display text-sm font-normal text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t('products.detail.buyNow')}
        </button>
        <button
          type="button"
          disabled={!canBuy}
          onClick={handleAddToCart}
          className="inline-flex h-12 flex-1 items-center justify-center border border-black bg-white px-6 font-display text-sm font-normal text-black transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t('products.detail.addToCart')}
        </button>
      </div>

      <div className="mt-10 flex flex-1 flex-col overflow-hidden border border-black/15">
        <div className="flex gap-4 border-b border-black/15 px-5 py-6">
          <Truck className="mt-0.5 size-[18px] shrink-0 text-black" aria-hidden />
          <div className="min-w-0">
            <p className="font-display text-sm font-semibold text-black">
              {t('products.detail.deliveryTitle')}
            </p>
            <button
              type="button"
              className="mt-1.5 text-left font-mono text-xs leading-relaxed text-black underline underline-offset-4 sm:text-[13px]"
            >
              {t('products.detail.deliveryBody')}
            </button>
          </div>
        </div>

        <div className="flex gap-4 px-5 py-6">
          <Package className="mt-0.5 size-[18px] shrink-0 text-black" aria-hidden />
          <div className="min-w-0">
            <p className="font-display text-sm font-semibold text-black">
              {t('products.detail.returnTitle')}
            </p>
            <p className="mt-1.5 font-mono text-xs leading-relaxed text-black sm:text-[13px]">
              {t('products.detail.returnBody')}{' '}
              <button
                type="button"
                className="underline underline-offset-4"
              >
                {t('products.detail.returnDetails')}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
