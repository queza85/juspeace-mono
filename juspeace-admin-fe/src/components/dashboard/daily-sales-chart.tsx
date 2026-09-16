'use client';

import { memo, useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartContainer } from '@/components/dashboard/chart-container';
import { DashboardPanel } from '@/components/dashboard/dashboard-panel';
import { dailySalesData } from '@/lib/dashboard/mock-data';
import { useT } from '@/lib/i18n/locale-context';

function formatCurrency(value: number) {
  if (value >= 1000) {
    return `$${Math.round(value / 1000)}K`;
  }
  return `$${value}`;
}

function DailySalesChartComponent() {
  const t = useT();

  const chartData = useMemo(
    () =>
      dailySalesData.map((point) => ({
        day: t(point.dayKey),
        sales: point.sales,
        target: point.target,
      })),
    [t],
  );

  return (
    <DashboardPanel
      title={t('admin.dashboard.charts.dailySales')}
      description={t('admin.dashboard.charts.dateLabel')}
      action={
        <div className="flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
          <span>{t('admin.dashboard.charts.filters.monthValue')}</span>
          <span aria-hidden>·</span>
          <span>{t('admin.dashboard.charts.filters.yearValue')}</span>
          <span aria-hidden>·</span>
          <span>{t('admin.dashboard.charts.filters.weekValue')}</span>
        </div>
      }
      className="h-full"
    >
      <ChartContainer height={224}>
        {(size) => (
          <BarChart
            width={size.width}
            height={size.height}
            data={chartData}
            barGap={3}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f0f0f0"
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              tickFormatter={formatCurrency}
              width={40}
            />
            <Tooltip
              formatter={(value) => [
                `$${Number(value ?? 0).toLocaleString()}`,
                t('admin.dashboard.charts.sales'),
              ]}
              labelFormatter={(label) => label}
            />
            <Bar
              dataKey="target"
              fill="#ede9fe"
              radius={[3, 3, 0, 0]}
              maxBarSize={24}
              isAnimationActive={false}
            />
            <Bar
              dataKey="sales"
              fill="#5d3e9e"
              radius={[3, 3, 0, 0]}
              maxBarSize={24}
              isAnimationActive={false}
            />
          </BarChart>
        )}
      </ChartContainer>
    </DashboardPanel>
  );
}

export const DailySalesChart = memo(DailySalesChartComponent);
