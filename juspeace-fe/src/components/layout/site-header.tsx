'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/auth-context';
import { useT } from '@/lib/i18n/locale-context';
import { useCartTotalItems } from '@/stores/cart-store';

export function SiteHeader() {
  const t = useT();
  const totalItems = useCartTotalItems();
  const { isAuthenticated, isLoading, logout } = useAuth();

  return (
    <header className="border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-heading text-lg font-semibold tracking-tight">
          {t('common.brand')}
        </Link>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          {!isLoading && isAuthenticated ? (
            <>
              <Link
                href="/account"
                className={buttonVariants({ variant: 'ghost', size: 'sm' })}
              >
                {t('auth.account')}
              </Link>
              <button
                type="button"
                onClick={() => void logout()}
                className={buttonVariants({ variant: 'ghost', size: 'sm' })}
              >
                {t('auth.logout')}
              </button>
            </>
          ) : !isLoading ? (
            <Link
              href="/login"
              className={buttonVariants({ variant: 'ghost', size: 'sm' })}
            >
              {t('auth.login')}
            </Link>
          ) : null}

          <Link
            href="/cart"
            className={buttonVariants({
              variant: 'outline',
              size: 'sm',
              className: 'gap-2',
            })}
          >
            <ShoppingBag className="size-4" />
            {t('common.cart')}
            {totalItems > 0 ? (
              <Badge variant="secondary">{totalItems}</Badge>
            ) : null}
          </Link>
        </div>
      </div>
    </header>
  );
}
