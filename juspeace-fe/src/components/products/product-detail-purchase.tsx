'use client';

import { Check, Minus, Plus, Star } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ProductDetailPurchaseInfo } from '@/components/products/product-detail-purchase-info';
import { toast } from '@/components/ui/toast';
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
  const [saved, setSaved] = useState(false);
  const [cartAddedFlash, setCartAddedFlash] = useState(false);
  const cartFlashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const inStock = product.stock > 0;
  const canBuy = inStock;

  useEffect(() => {
    return () => {
      if (cartFlashTimerRef.current) {
        clearTimeout(cartFlashTimerRef.current);
      }
    };
  }, []);

  const addProductToCart = (options?: { animateAddButton?: boolean }) => {
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
    toast(
      quantity > 1
        ? t('products.detail.addedToCartToastQty', { count: quantity })
        : t('products.detail.addedToCartToast'),
      'success',
    );

    if (options?.animateAddButton) {
      setCartAddedFlash(true);
      if (cartFlashTimerRef.current) {
        clearTimeout(cartFlashTimerRef.current);
      }
      cartFlashTimerRef.current = setTimeout(() => {
        setCartAddedFlash(false);
        cartFlashTimerRef.current = null;
      }, 1400);
    }
  };

  return (
    <div className={cn('flex min-h-0 min-w-0 w-full flex-col lg:w-[calc(100%-10px)] 2xl:w-full', className)}>
      <div className="flex items-center justify-between gap-4">
        <h1 className="min-w-0 font-display text-[clamp(1.375rem,2vw,1.75rem)] font-black leading-[1.15] tracking-tight text-black">
          {displayName}
        </h1>
        <button
          type="button"
          aria-pressed={saved}
          aria-label={t('products.detail.save')}
          onClick={() => setSaved((value) => !value)}
          className="inline-flex size-8 shrink-0 items-center justify-center"
        >
          <Image
            src="/product-detail/love%201.png"
            alt=""
            width={32}
            height={32}
            className={cn('size-8', saved && 'opacity-60')}
          />
        </button>
      </div>

      <p className="mt-3 font-display text-xl font-normal text-black">
        {formatPdpPrice(formatPrice, product.priceCents, product.currency)}
      </p>

      <p className="mt-6 max-w-[420px] font-sans text-base font-normal not-italic leading-[38px] tracking-normal text-black">
        {tagline}
      </p>

      <div className="mt-5">
        <StarRating reviewCount={reviewCount} />
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-5 sm:gap-6">
        <div className="flex h-11 w-[148px] items-center justify-between border-t-[1.84px] border-t-[#FFFFFF99] bg-jp-light-gray px-3">
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
          onClick={() => addProductToCart()}
          className="inline-flex h-12 w-full items-center justify-center bg-black px-6 font-display text-sm font-normal text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-[188px]"
        >
          {t('products.detail.buyNow')}
        </button>
        <button
          type="button"
          disabled={!canBuy}
          onClick={() => addProductToCart({ animateAddButton: true })}
          className={cn(
            'inline-flex h-12 w-full items-center justify-center gap-2 border px-6 font-display text-sm font-normal transition-[transform,background-color,border-color,color,opacity] duration-300 disabled:cursor-not-allowed disabled:opacity-50 sm:w-[188px]',
            cartAddedFlash
              ? 'jp-cart-added-pop border-emerald-700 bg-emerald-50 text-emerald-950'
              : 'border-black bg-white text-black hover:opacity-80',
          )}
        >
          {cartAddedFlash ? (
            <>
              <Check className="size-4 shrink-0" aria-hidden />
              {t('products.detail.addedToCartLabel')}
            </>
          ) : (
            t('products.detail.addToCart')
          )}
        </button>
      </div>

      <ProductDetailPurchaseInfo />
    </div>
  );
}
