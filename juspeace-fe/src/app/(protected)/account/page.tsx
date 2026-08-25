'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { useT } from '@/lib/i18n/locale-context';

export default function AccountPage() {
  const t = useT();
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const returnUrl = encodeURIComponent(pathname || '/account');
      router.replace(`/login?returnUrl=${returnUrl}`);
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  if (isLoading || !user) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        {t('auth.accountTitle')}
      </h1>
      <dl className="mt-6 space-y-3 text-sm">
        <div>
          <dt className="text-muted-foreground">{t('auth.email')}</dt>
          <dd className="font-medium">{user.email}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t('auth.name')}</dt>
          <dd className="font-medium">{user.name ?? t('auth.noName')}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t('auth.role')}</dt>
          <dd className="font-medium">{user.role}</dd>
        </div>
      </dl>
      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={async () => {
            await logout();
            router.replace('/login');
          }}
          className="inline-flex h-9 items-center rounded-md border border-input px-4 text-sm font-medium hover:bg-accent"
        >
          {t('auth.logout')}
        </button>
        <Link
          href="/"
          className="inline-flex h-9 items-center text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          {t('auth.backHome')}
        </Link>
      </div>
    </div>
  );
}
