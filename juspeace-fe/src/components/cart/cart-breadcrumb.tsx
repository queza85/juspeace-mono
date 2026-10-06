'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import { useCartStore, type CartItem } from '@/stores/cart-store';

const EMPTY_CART_ITEMS: CartItem[] = [];

function formatBreadcrumbName(name: string) {
  return name.trim().replace(/\s+/g, '_');
}

function useCartItems(): CartItem[] {
  return useSyncExternalStore(
    (onStoreChange) => useCartStore.subscribe(onStoreChange),
    () => useCartStore.getState().items,
    () => EMPTY_CART_ITEMS,
  );
}

export function CartBreadcrumb() {
  const t = useT();
  const items = useCartItems();
  const product = items.at(-1)?.product;

  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-8 font-mono text-[13px] text-jp-muted lg:mb-10"
    >
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/#collection" className="transition-colors hover:text-black">
            {t('products.detail.breadcrumbCollection')}
          </Link>
        </li>
        {product ? (
          <li className="flex items-center gap-1.5">
            <span aria-hidden>/</span>
            <Link
              href={`/products/${product.slug}`}
              className="transition-colors hover:text-black"
            >
              {formatBreadcrumbName(product.name)}
            </Link>
          </li>
        ) : null}
        <li aria-hidden>/</li>
        <li className="text-black">{t('cart.breadcrumb')}</li>
      </ol>
    </nav>
  );
}
