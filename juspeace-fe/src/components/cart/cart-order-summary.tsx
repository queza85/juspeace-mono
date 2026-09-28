'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useFormatPrice, useT } from '@/lib/i18n/locale-context';
import { resolveCartItemImage } from '@/lib/products/cart-item-image';
import { CART_SHIPPING_CENTS, type CartItem } from '@/stores/cart-store';
import { cn } from '@/lib/utils';

interface CartOrderSummaryProps {
  items: CartItem[];
  variant?: 'cart' | 'shipping' | 'payment' | 'review';
  onSubmitOrder?: () => void;
}

function formatSummaryPrice(
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

export function CartOrderSummary({
  items,
  variant = 'cart',
  onSubmitOrder,
}: CartOrderSummaryProps) {
  const t = useT();
  const formatPrice = useFormatPrice();
  const [promoCode, setPromoCode] = useState('');

  const currency = items[0]?.product.currency ?? 'USD';
  const subtotalCents = items.reduce(
    (total, item) => total + item.product.priceCents * item.quantity,
    0,
  );
  const orderTotalCents =
    subtotalCents + (items.length > 0 ? CART_SHIPPING_CENTS : 0);
  const compact =
    variant === 'shipping' || variant === 'payment' || variant === 'review';

  return (
    <aside
      className={cn(
        'border border-black/10 bg-white',
        variant === 'cart' && 'lg:sticky lg:top-24',
        compact ? 'p-4 sm:p-5' : 'p-5 sm:p-6',
      )}
    >
      <h2
        className={cn(
          'font-display text-black',
          compact
            ? 'text-lg font-bold'
            : 'text-base font-semibold sm:text-lg',
        )}
      >
        {t('cart.orderSummary')}
      </h2>

      <ul className={cn(compact ? 'mt-3' : 'mt-4')}>
        {items.map((item) => (
          <li
            key={item.product.id}
            className={cn(
              'border-b border-black/10 last:border-b-0',
              compact ? 'py-3' : 'py-4',
            )}
          >
            <div className="flex items-start gap-2.5">
              <div
                className={cn(
                  'relative shrink-0 overflow-hidden rounded-sm bg-jp-light-gray',
                  compact ? 'size-12' : 'size-[60px]',
                )}
              >
                <Image
                  src={resolveCartItemImage(item)}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                  sizes={compact ? '48px' : '60px'}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={cn(
                      'min-w-0 font-display leading-snug text-black',
                      compact ? 'text-xs' : 'text-sm',
                    )}
                  >
                    {item.product.name}
                  </p>
                  <p
                    className={cn(
                      'shrink-0 font-display font-bold text-black',
                      compact ? 'text-xs' : 'text-sm',
                    )}
                  >
                    {formatSummaryPrice(
                      formatPrice,
                      item.product.priceCents * item.quantity,
                      item.product.currency,
                    )}
                  </p>
                </div>
                <p className="mt-0.5 font-mono text-[11px] text-jp-muted">
                  {t('cart.summaryLineQty', { count: item.quantity })}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div
        className={cn(
          'border-y border-black/10',
          compact ? 'mt-4 py-4' : 'mt-5 py-5',
        )}
      >
        <p
          className={cn(
            'font-display font-semibold text-black',
            compact ? 'text-xs' : 'text-sm',
          )}
        >
          {t('cart.promoLabel')}
        </p>
        <div className="mt-1.5 flex gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={(event) => setPromoCode(event.target.value)}
            placeholder={t('cart.promoPlaceholder')}
            className={cn(
              'min-w-0 flex-1 rounded-none border border-black/15 bg-white px-2.5 font-mono text-black outline-none placeholder:text-jp-muted focus:border-black/30',
              compact
                ? 'h-9 text-[11px] sm:text-xs'
                : 'h-10 text-xs sm:text-sm',
            )}
          />
          <button
            type="button"
            className={cn(
              'shrink-0 bg-neutral-400 font-mono text-white transition-opacity hover:opacity-90',
              compact
                ? 'h-9 px-4 text-[11px] sm:text-xs'
                : 'h-10 px-5 text-xs sm:text-sm',
            )}
            onClick={() => setPromoCode('')}
          >
            {t('cart.promoApply')}
          </button>
        </div>
      </div>

      <dl
        className={cn(
          'font-mono text-black',
          compact
            ? 'mt-4 space-y-2.5 text-[11px] sm:text-xs'
            : 'mt-6 space-y-4 text-xs sm:text-sm',
        )}
      >
        <div className="flex items-center justify-between">
          <dt className="text-jp-muted">{t('cart.subtotal')}</dt>
          <dd className="font-semibold">
            {formatSummaryPrice(formatPrice, subtotalCents, currency)}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-jp-muted">{t('cart.shipping')}</dt>
          <dd>
            {formatSummaryPrice(formatPrice, CART_SHIPPING_CENTS, currency)}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-jp-muted">{t('cart.taxIncluded')}</dt>
          <dd>{formatSummaryPrice(formatPrice, 0, currency)}</dd>
        </div>
        <div
          className={cn(
            'flex items-center justify-between border-t border-black/10 font-semibold',
            compact ? 'pt-2 text-xs' : 'pt-3 text-[13px]',
          )}
        >
          <dt>{t('cart.total')}</dt>
          <dd>{formatSummaryPrice(formatPrice, orderTotalCents, currency)}</dd>
        </div>
      </dl>

      <div
        className={cn(
          'flex gap-2.5 rounded-sm border border-black/10 bg-jp-light-gray',
          compact ? 'mt-4 p-3' : 'mt-5 p-4',
        )}
      >
        <Image
          src="/product-detail/express-delivery%201.png"
          alt=""
          width={28}
          height={28}
          className={cn(
            'mt-0.5 shrink-0 object-contain',
            compact ? 'size-5' : 'size-7',
          )}
        />
        <p className="font-mono text-[11px] leading-relaxed text-black">
          {t('cart.deliveryEstimateTitle')}
          <span className="mt-0.5 block font-bold underline underline-offset-2">
            {t('cart.deliveryEstimateBody')}
          </span>
        </p>
      </div>

      <div className={cn('flex flex-col gap-2.5', compact ? 'mt-4' : 'mt-6')}>
        {variant === 'shipping' ? (
          <button
            type="submit"
            form="checkout-shipping-form"
            className={cn(
              'inline-flex w-full items-center justify-center bg-black font-mono text-white transition-opacity hover:opacity-90',
              compact ? 'h-10 px-4 text-xs' : 'h-12 px-6 text-sm',
            )}
          >
            {t('checkout.nextToPayment')}
          </button>
        ) : variant === 'payment' ? (
          <button
            type="submit"
            form="checkout-payment-form"
            className={cn(
              'inline-flex w-full items-center justify-center bg-black font-mono text-white transition-opacity hover:opacity-90',
              compact ? 'h-10 px-4 text-xs' : 'h-12 px-6 text-sm',
            )}
          >
            {t('payment.nextToOrderReview')}
          </button>
        ) : variant === 'review' ? (
          <button
            type="button"
            onClick={onSubmitOrder}
            className={cn(
              'inline-flex w-full items-center justify-center bg-black font-mono text-white transition-opacity hover:opacity-90',
              compact ? 'h-10 px-4 text-xs' : 'h-12 px-6 text-sm',
            )}
          >
            {t('review.submitOrder')}
          </button>
        ) : (
          <>
            <Link
              href="/checkout"
              className="inline-flex h-12 w-full items-center justify-center bg-black px-6 font-mono text-sm text-white transition-opacity hover:opacity-90"
            >
              {t('cart.proceedToCheckout')}
            </Link>
            <Link
              href="/#collection"
              className="inline-flex h-12 w-full items-center justify-center border border-black bg-white px-6 font-mono text-sm text-jp-muted transition-opacity hover:opacity-80"
            >
              {t('cart.continueShopping')}
            </Link>
          </>
        )}
      </div>
    </aside>
  );
}
