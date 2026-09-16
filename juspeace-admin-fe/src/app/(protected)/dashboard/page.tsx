'use client';

import dynamic from 'next/dynamic';
import { memo } from 'react';
import { KpiStatCard } from '@/components/dashboard/kpi-stat-card';
import { kpiMetrics } from '@/lib/dashboard/mock-data';
import { useT } from '@/lib/i18n/locale-context';

function ChartSectionSkeleton() {
  return (
    <div className="h-full min-h-48 animate-pulse rounded-none border border-border/70 bg-muted/20" />
  );
}

const DailySalesChart = dynamic(
  () =>
    import('@/components/dashboard/daily-sales-chart').then(
      (mod) => mod.DailySalesChart,
    ),
  { loading: () => <ChartSectionSkeleton /> },
);

const ProductSalesChart = dynamic(
  () =>
    import('@/components/dashboard/product-sales-chart').then(
      (mod) => mod.ProductSalesChart,
    ),
  { loading: () => <ChartSectionSkeleton /> },
);

const OperationalAlerts = dynamic(
  () =>
    import('@/components/dashboard/operational-alerts').then(
      (mod) => mod.OperationalAlerts,
    ),
  { loading: () => <ChartSectionSkeleton /> },
);

const RecentOrdersTable = dynamic(
  () =>
    import('@/components/dashboard/recent-orders-table').then(
      (mod) => mod.RecentOrdersTable,
    ),
  { loading: () => <ChartSectionSkeleton /> },
);

function DashboardPage() {
  const t = useT();

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">
            {t('admin.dashboard.title')}
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t('admin.dashboard.description')}
          </p>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {t('admin.dashboard.mockDataNotice')}
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {kpiMetrics.slice(0, 5).map((metric) => (
          <KpiStatCard key={metric.id} metric={metric} />
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpiMetrics.slice(5).map((metric) => (
          <KpiStatCard key={metric.id} metric={metric} />
        ))}
      </div>

      <div className="grid gap-3 xl:grid-cols-12">
        <div className="xl:col-span-6">
          <DailySalesChart />
        </div>
        <div className="xl:col-span-3">
          <ProductSalesChart />
        </div>
        <div className="xl:col-span-3">
          <OperationalAlerts />
        </div>
      </div>

      <RecentOrdersTable />
    </div>
  );
}

export default memo(DashboardPage);
