'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { useT } from '@/lib/i18n/locale-context';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/qa-test', labelKey: 'qaTest.shell.hub', exact: true },
  { href: '/qa-test/signup', labelKey: 'qaTest.shell.signup', exact: false },
  { href: '/qa-test/cart', labelKey: 'qaTest.shell.cart', exact: false },
  { href: '/qa-test/shipping', labelKey: 'qaTest.shell.shipping', exact: false },
] as const;

export function QaTestShell({ children }: { children: ReactNode }) {
  const t = useT();
  const pathname = usePathname();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-white text-black">
      <header className="border-b border-black/10">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="font-display text-sm font-semibold tracking-wide">
            {t('qaTest.shell.brand')}
          </p>
          <LanguageSwitcher />
        </div>
        <nav
          aria-label={t('qaTest.shell.navLabel')}
          className="mx-auto flex w-full max-w-3xl gap-2 overflow-x-auto px-5 pb-4 sm:px-6"
        >
          {LINKS.map((link) => {
            const active = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap',
                  active
                    ? 'border-black bg-black text-white'
                    : 'border-black/15 text-black/70 hover:border-black/40 hover:text-black',
                )}
              >
                {t(link.labelKey)}
              </Link>
            );
          })}
        </nav>
      </header>
      <div className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-6">{children}</div>
    </div>
  );
}
