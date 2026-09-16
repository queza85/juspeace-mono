'use client';

import { memo, useMemo } from 'react';
import { Cell, Pie, PieChart, Tooltip } from 'recharts';
import { ChartContainer } from '@/components/dashboard/chart-container';
import { DashboardPanel } from '@/components/dashboard/dashboard-panel';
import {
  productSalesData,
  productSalesTotalCents,
} from '@/lib/dashboard/mock-data';
import { useFormatPrice, useT } from '@/lib/i18n/locale-context';

function ProductSalesChartComponent() {
  const t = useT();
  const formatPrice = useFormatPrice();

  const chartData = useMemo(
    () =>
      productSalesData.map((item) => ({
        name: t(item.labelKey),
        value: item.value,
        color: item.color,
      })),
    [t],
  );

  const totalLabel = formatPrice(productSalesTotalCents);

  return (
    <DashboardPanel
      title={t('admin.dashboard.charts.productBreakdown')}
      className="h-full"
    >
      <div className="relative">
        <ChartContainer height={144}>
          {(size) => (
            <PieChart width={size.width} height={size.height}>
              <Pie
                data={chartData}
                cx={size.width / 2}
                cy={size.height / 2}
                innerRadius={42}
                outerRadius={62}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
                isAnimationActive={false}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatPrice(Number(value ?? 0))} />
            </PieChart>
          )}
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[10px] text-muted-foreground">
            {t('admin.dashboard.charts.totalSales')}
          </p>
          <p className="text-sm font-semibold">{totalLabel}</p>
        </div>
      </div>
      <ul className="mt-3 space-y-1.5">
        {productSalesData.map((item) => {
          const pct = ((item.value / productSalesTotalCents) * 100).toFixed(1);
          return (
            <li
              key={item.labelKey}
              className="flex items-center justify-between gap-2 text-[11px]"
            >
              <span className="flex min-w-0 items-center gap-1.5">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate text-muted-foreground">
                  {t(item.labelKey)}
                </span>
              </span>
              <span className="shrink-0 text-foreground/80">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </DashboardPanel>
  );
}

export const ProductSalesChart = memo(ProductSalesChartComponent);
