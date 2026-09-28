'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CartOrderSummary } from '@/components/cart/cart-order-summary';
import { ShippingForm } from '@/components/checkout/shipping-form';
import { useT } from '@/lib/i18n/locale-context';
import { useCartStore } from '@/stores/cart-store';

export function CheckoutPageContent() {
  const t = useT();
  const router = useRouter();
  const items = useCartStore((state) => state.items);

  useEffect(() => {
    if (items.length === 0) {
      router.replace('/cart');
    }
  }, [items.length, router]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <header>
        <h1 className="font-display text-[clamp(1.375rem,2.2vw,1.75rem)] font-semibold leading-tight text-black">
          {t('checkout.title')}
        </h1>
        <p className="mt-1.5 font-mono text-[11px] text-jp-muted sm:text-xs">
          {t('checkout.subtitle')}
        </p>
      </header>

      <div className="mt-5 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,380px)] lg:gap-x-12">
        <div className="min-w-0">
          <ShippingForm />
        </div>

        <div className="min-w-0 lg:self-start">
          <CartOrderSummary items={items} variant="shipping" />
        </div>
      </div>
    </div>
  );
}
