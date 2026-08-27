'use client';

import { memo } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  CircleCheck,
  CircleDollarSign,
  Clock3,
  ShieldAlert,
  ShoppingBag,
  ShoppingCart,
  SquareArrowOutUpRight,
  Truck,
  XCircle,
} from 'lucide-react';
import type { KpiFooterDot, KpiMetric } from '@/lib/dashboard/mock-data';
import { useT } from '@/lib/i18n/locale-context';
import { cn } from '@/lib/utils';

const iconById: Record<string, LucideIcon> = {
  totalOrders: ShoppingCart,
  paidOrders: CircleDollarSign,
  awaitingShipment: Clock3,
  shippedOrders: Truck,
  completedOrders: CircleCheck,
  cancelledRefunded: XCircle,
  totalSales: ShoppingBag,
  remainingInventory: ShoppingCart,
  lowStockAlert: ShieldAlert,
};

const badgeStyles = {
  up: 'bg-cyan-100 text-cyan-800',
  down: 'bg-purple-100 text-purple-700',
  new: 'bg-purple-100 text-purple-700',
} as const;

const footerDotStyles: Record<KpiFooterDot, string> = {
  blue: 'bg-sky-400',
  gray: 'bg-slate-400',
  green: 'bg-emerald-400',
  purple: 'bg-purple-500',
};

function KpiStatCardComponent({ metric }: { metric: KpiMetric }) {
  const t = useT();
  const Icon = iconById[metric.id] ?? ShoppingCart;

  return (
    <article className="flex flex-col rounded-md border border-border/70 bg-card p-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="truncate text-xs font-medium text-muted-foreground">
          {t(metric.labelKey)}
        </h3>
        <button
          type="button"
          className="shrink-0 rounded p-0.5 text-muted-foreground/70 hover:bg-muted hover:text-foreground"
          aria-label={t('admin.dashboard.kpi.viewDetails')}
        >
          <SquareArrowOutUpRight className="size-3" />
        </button>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <Icon className="size-4" aria-hidden />
        </span>
        <div className="flex min-w-0 flex-1 items-center justify-between gap-1.5">
          <p className="text-xl font-semibold tracking-tight text-foreground">
            {metric.value}
          </p>
          <span
            className={cn(
              'shrink-0 rounded px-1.5 py-0.5 text-[10px] leading-none font-semibold',
              badgeStyles[metric.trendDirection],
            )}
          >
            {metric.trend}
          </span>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 border-t border-border/60 pt-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span
            className={cn(
              'size-1.5 shrink-0 rounded-full',
              footerDotStyles[metric.footerDot],
            )}
            aria-hidden
          />
          <p className="truncate text-[11px] text-muted-foreground">
            {t(metric.subLabelKey)}
          </p>
        </div>
        <p className="shrink-0 text-xs font-semibold text-foreground">
          {metric.subValue}
        </p>
      </div>
    </article>
  );
}

export const KpiStatCard = memo(KpiStatCardComponent);
