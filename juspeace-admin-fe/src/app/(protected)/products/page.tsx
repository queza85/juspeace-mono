'use client';

import { memo } from 'react';
import { ProductsStatsCards } from '@/components/products/products-stats-cards';
import { ProductsTablePanel } from '@/components/products/products-table-panel';
import { useT } from '@/lib/i18n/locale-context';

function ProductsPage() {
  const t = useT();

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">
            {t('admin.products.title')}
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t('admin.products.description')}
          </p>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {t('admin.products.mockDataNotice')}
        </p>
      </header>

      <ProductsStatsCards />
      <ProductsTablePanel />
    </div>
  );
}

export default memo(ProductsPage);
