'use client';

import { memo } from 'react';
import { KpiStatCard } from '@/components/dashboard/kpi-stat-card';
import { ordersPageKpiMetrics } from '@/lib/orders/mock-data';

function OrdersStatsCardsComponent() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {ordersPageKpiMetrics.map((metric) => (
        <KpiStatCard key={metric.id} metric={metric} />
      ))}
    </div>
  );
}

export const OrdersStatsCards = memo(OrdersStatsCardsComponent);
