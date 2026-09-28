'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CartOrderSummary } from '@/components/cart/cart-order-summary';
import { PaymentForm } from '@/components/checkout/payment-form';
import { useT } from '@/lib/i18n/locale-context';
import { useCartStore } from '@/stores/cart-store';
import { useCheckoutStore } from '@/stores/checkout-store';

export function PaymentPageContent() {
  const t = useT();
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const shipping = useCheckoutStore((state) => state.shipping);

  useEffect(() => {
    if (items.length === 0) {
      router.replace('/cart');
      return;
    }

    if (!shipping) {
      router.replace('/checkout');
    }
  }, [items.length, router, shipping]);

  if (items.length === 0 || !shipping) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] min-[1680px]:max-w-none">
      <Link
        href="/checkout"
        className="inline-flex items-center gap-1 font-mono text-[11px] text-jp-muted transition-colors hover:text-black sm:text-xs"
      >
        <ArrowLeft className="size-3" aria-hidden />
        {t('payment.back')}
      </Link>

      <header>
        <h1 className="font-display text-[clamp(1.375rem,2.2vw,1.75rem)] font-semibold leading-tight text-black">
          {t('payment.title')}
        </h1>
        <p className="mt-1.5 font-mono text-[11px] text-jp-muted sm:text-xs">
          {t('payment.subtitle')}
        </p>
      </header>

      <div className="mt-5 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,380px)] lg:gap-x-12">
        <div className="min-w-0">
          <PaymentForm />
        </div>

        <div className="min-w-0 lg:self-start">
          <CartOrderSummary items={items} variant="payment" />
        </div>
      </div>
    </div>
  );
}
