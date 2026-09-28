'use client';

import Link from 'next/link';
import { ArrowLeft, Pencil } from 'lucide-react';
import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CartOrderSummary } from '@/components/cart/cart-order-summary';
import { VisaLogo } from '@/components/checkout/visa-logo';
import { ReviewOrderLineItem } from '@/components/checkout/review-order-line-item';
import {
  formatCardExpiry,
  formatMaskedCardNumber,
  formatShippingPhone,
  getPaymentMethodLabelKey,
} from '@/lib/checkout/display';
import {
  formatEstimatedDeliveryRange,
  generateOrderNumber,
} from '@/lib/checkout/order-confirmation';
import { useAuth } from '@/lib/auth/auth-context';
import { useLocale, useT } from '@/lib/i18n/locale-context';
import { useCartStore } from '@/stores/cart-store';
import { useCheckoutStore } from '@/stores/checkout-store';

export function ReviewPageContent() {
  const t = useT();
  const router = useRouter();
  const { locale } = useLocale();
  const { user } = useAuth();
  const items = useCartStore((state) => state.items);
  const shipping = useCheckoutStore((state) => state.shipping);
  const payment = useCheckoutStore((state) => state.payment);
  const orderConfirmation = useCheckoutStore((state) => state.orderConfirmation);
  const setOrderConfirmation = useCheckoutStore(
    (state) => state.setOrderConfirmation,
  );

  const handleSubmitOrder = useCallback(() => {
    setOrderConfirmation({
      orderNumber: generateOrderNumber(),
      email: user?.email ?? t('orderSuccess.guestEmail'),
      estimatedDelivery: formatEstimatedDeliveryRange(locale),
      placedAt: new Date().toISOString(),
    });
    useCheckoutStore.setState({ shipping: null, payment: null });
    router.push('/checkout/success');
  }, [locale, router, setOrderConfirmation, t, user?.email]);

  useEffect(() => {
    if (orderConfirmation) {
      return;
    }

    if (items.length === 0) {
      router.replace('/cart');
      return;
    }

    if (!shipping) {
      router.replace('/checkout');
      return;
    }

    if (!payment) {
      router.replace('/checkout/payment');
    }
  }, [items.length, orderConfirmation, payment, router, shipping]);

  if (items.length === 0 || !shipping || !payment) {
    return null;
  }

  const showCardDetails = payment.paymentMethod === 'card';

  return (
    <div className="mx-auto w-full max-w-[1280px] min-[1680px]:max-w-none">
      <Link
        href="/checkout/payment"
        className="inline-flex items-center gap-1 font-mono text-[11px] text-jp-muted transition-colors hover:text-black sm:text-xs"
      >
        <ArrowLeft className="size-3" aria-hidden />
        {t('review.back')}
      </Link>

      <header>
        <h1 className="font-display text-[clamp(1.375rem,2.2vw,1.75rem)] font-semibold leading-tight text-black">
          {t('review.title')}
        </h1>
        <p className="mt-1.5 font-mono text-[11px] text-jp-muted sm:text-xs">
          {t('review.subtitle')}
        </p>
      </header>

      <div className="mt-5 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,380px)] lg:gap-x-12">
        <div className="min-w-0 space-y-5">
          <section className="border border-black/10 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-display text-sm font-semibold text-black">
                {t('review.shippingAddress')}
              </h2>
              <Link
                href="/checkout"
                className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold tracking-wide text-black transition-opacity hover:opacity-70 sm:text-[11px]"
              >
                <Pencil className="size-3" aria-hidden />
                {t('review.edit')}
              </Link>
            </div>
            <address className="mt-3 space-y-0.5 font-mono text-[11px] not-italic leading-relaxed text-black sm:text-xs">
              <p>{shipping.name}</p>
              <p>{formatShippingPhone(shipping)}</p>
              <p>{shipping.address}</p>
              <p>{shipping.city}</p>
              <p>{shipping.postalCode}</p>
            </address>
          </section>

          <section className="border border-black/10 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-display text-sm font-semibold text-black">
                {t('review.paymentMethod')}
              </h2>
              <Link
                href="/checkout/payment"
                className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold tracking-wide text-black transition-opacity hover:opacity-70 sm:text-[11px]"
              >
                <Pencil className="size-3" aria-hidden />
                {t('review.edit')}
              </Link>
            </div>
            <div className="mt-3 space-y-2">
              {showCardDetails ? (
                <>
                  <div className="inline-flex h-7 items-center justify-center border border-black/10 bg-white px-2.5">
                    <VisaLogo alt={t('payment.visa')} />
                  </div>
                  <p className="font-mono text-[11px] text-black sm:text-xs">
                    {t(getPaymentMethodLabelKey(payment))}
                  </p>
                  <p className="font-mono text-[11px] text-black sm:text-xs">
                    {formatMaskedCardNumber(payment.cardNumber)}
                  </p>
                  <p className="font-mono text-[11px] text-black sm:text-xs">
                    {formatCardExpiry(payment.expiryDate)}
                  </p>
                </>
              ) : (
                <p className="font-mono text-[11px] text-black sm:text-xs">
                  {t(getPaymentMethodLabelKey(payment))}
                </p>
              )}
            </div>
          </section>

          <section>
            <h2 className="font-display text-sm font-semibold text-black">
              {t('review.reviewItems')}
            </h2>
            <div className="mt-3 border border-black/10 bg-white">
              {items.map((item) => (
                <ReviewOrderLineItem key={item.product.id} item={item} />
              ))}
            </div>
          </section>
        </div>

        <div className="min-w-0 lg:self-start">
          <CartOrderSummary
            items={items}
            variant="review"
            onSubmitOrder={handleSubmitOrder}
          />
        </div>
      </div>
    </div>
  );
}
