'use client';

import { memo } from 'react';
import { KpiStatCard } from '@/components/dashboard/kpi-stat-card';
import { productsPageKpiMetrics } from '@/lib/products/mock-data';

function ProductsStatsCardsComponent() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {productsPageKpiMetrics.map((metric) => (
        <KpiStatCard key={metric.id} metric={metric} />
      ))}
    </div>
  );
}

export const ProductsStatsCards = memo(ProductsStatsCardsComponent);
