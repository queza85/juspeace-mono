'use client';

import { memo } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useT } from '@/lib/i18n/locale-context';

function ProductPageBreadcrumbsComponent({
  currentLabelKey,
  parent,
}: {
  currentLabelKey: string;
  parent?: { href: string; labelKey: string };
}) {
  const t = useT();

  const items = [
    { href: '/dashboard', label: t('admin.nav.dashboard') },
    { href: '/products', label: t('admin.products.detail.breadcrumbEcommerce') },
    ...(parent
      ? [{ href: parent.href, label: t(parent.labelKey) }]
      : []),
    { label: t(currentLabelKey) },
  ] as const;

  return (
    <nav
      aria-label={t('admin.products.detail.breadcrumbLabel')}
      className="flex flex-wrap items-center gap-1 text-[12px] text-[#9ca3af]"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={item.label} className="inline-flex items-center gap-1">
            {index > 0 ? (
              <ChevronRight className="size-3 text-muted-foreground/70" aria-hidden />
            ) : null}
            {'href' in item && item.href && !isLast ? (
              <Link
                href={item.href}
                className="transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'font-semibold text-[#374151]' : undefined}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export const ProductPageBreadcrumbs = memo(ProductPageBreadcrumbsComponent);
