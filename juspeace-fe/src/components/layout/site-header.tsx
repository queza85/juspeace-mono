'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { t } from '@/lib/i18n';
import { useCartStore } from '@/stores/cart-store';

export function SiteHeader() {
  const totalItems = useCartStore((state) => state.totalItems());

  return (
    <header className="border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-heading text-lg font-semibold tracking-tight">
          {t('common.brand')}
        </Link>

        <Link href="/" className={buttonVariants({ variant: 'outline', size: 'sm', className: 'gap-2' })}>
          <ShoppingBag className="size-4" />
          {t('common.cart')}
          {totalItems > 0 ? (
            <Badge variant="secondary">{totalItems}</Badge>
          ) : null}
        </Link>
      </div>
    </header>
  );
}
