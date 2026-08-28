'use client';

import { memo } from 'react';
import { OrdersStatsCards } from '@/components/orders/orders-stats-cards';
import { OrdersTablePanel } from '@/components/orders/orders-table-panel';
import { useT } from '@/lib/i18n/locale-context';

function OrdersPage() {
  const t = useT();

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">
            {t('admin.orders.title')}
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t('admin.orders.description')}
          </p>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {t('admin.orders.mockDataNotice')}
        </p>
      </header>

      <OrdersStatsCards />
      <OrdersTablePanel />
    </div>
  );
}

export default memo(OrdersPage);
