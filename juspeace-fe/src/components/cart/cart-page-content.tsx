'use client';

import Link from 'next/link';
import { useT } from '@/lib/i18n/locale-context';
import { useCartStore } from '@/stores/cart-store';
import { CartLineItem } from '@/components/cart/cart-line-item';
import { CartOrderSummary } from '@/components/cart/cart-order-summary';

export function CartPageContent() {
  const t = useT();
  const items = useCartStore((state) => state.items);
  const totalItems = useCartStore((state) => state.totalItems());

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center sm:py-24">
        <h1 className="font-display text-2xl font-semibold text-black sm:text-3xl">
          {t('cart.emptyTitle')}
        </h1>
        <p className="mt-3 font-mono text-sm text-jp-muted">
          {t('cart.emptyDescription')}
        </p>
        <Link
          href="/#collection"
          className="mt-8 inline-flex h-12 items-center justify-center border border-black bg-black px-8 font-display text-sm text-white transition-opacity hover:opacity-90"
        >
          {t('cart.continueShopping')}
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <header className="max-w-[720px]">
        <h1 className="font-display text-[clamp(1.625rem,2.8vw,2rem)] font-semibold leading-tight text-black">
          {t('cart.title', { count: totalItems })}
        </h1>
        <p className="mt-2 font-mono text-xs text-jp-muted sm:text-sm">
          {t('cart.subtitle')}
        </p>
      </header>

      <div className="mt-6 grid w-full grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-x-6 xl:max-w-[1120px] xl:grid-cols-[minmax(0,1fr)_440px] 2xl:max-w-none 2xl:grid-cols-[minmax(0,1fr)_460px] 2xl:gap-x-8">
        <section
          aria-labelledby="cart-items-heading"
          className="min-w-0 border border-black/10 bg-white"
        >
          <h2 id="cart-items-heading" className="sr-only">
            {t('cart.title', { count: totalItems })}
          </h2>
          {items.map((item) => (
            <CartLineItem key={item.product.id} item={item} />
          ))}
        </section>

        <CartOrderSummary items={items} />
      </div>
    </div>
  );
}
