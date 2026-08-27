'use client';

import { memo } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  CircleCheck,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  Package,
  ShieldAlert,
  ShoppingBag,
  ShoppingCart,
  SquareArrowOutUpRight,
  Truck,
  UserCircle,
  XCircle,
} from 'lucide-react';
import type {
  KpiBadgeTone,
  KpiFooterDot,
  KpiIconTone,
  KpiMetric,
  KpiTrendDirection,
} from '@/lib/dashboard/mock-data';
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
  products: Package,
  orders: ShoppingCart,
  sales: ClipboardCheck,
  customers: UserCircle,
  revenue: BarChart3,
};

const badgeToneByTrend: Record<KpiTrendDirection, KpiBadgeTone> = {
  up: 'cyan',
  down: 'purple',
  new: 'purple',
};

const badgeStyles: Record<KpiBadgeTone, string> = {
  green: 'bg-emerald-50 text-emerald-600',
  purple: 'bg-violet-50 text-violet-600',
  indigo: 'bg-indigo-50 text-indigo-600',
  orange: 'bg-orange-50 text-orange-600',
  cyan: 'bg-sky-50 text-sky-700',
};

const iconToneStyles: Record<KpiIconTone, string> = {
  slate: 'bg-slate-100 text-slate-500',
  lavender: 'bg-violet-100 text-violet-500',
  sky: 'bg-sky-100 text-sky-600',
};

const footerDotStyles: Record<KpiFooterDot, string> = {
  blue: 'bg-sky-500',
  gray: 'bg-slate-400',
  green: 'bg-emerald-500',
  purple: 'bg-purple-500',
  teal: 'bg-teal-500',
  orange: 'bg-orange-400',
  indigo: 'bg-indigo-500',
  lavender: 'bg-violet-400',
};

function KpiStatCardComponent({ metric }: { metric: KpiMetric }) {
  const t = useT();
  const Icon = iconById[metric.id] ?? ShoppingCart;
  const badgeTone = metric.badgeTone ?? badgeToneByTrend[metric.trendDirection];
  const iconTone = metric.iconTone ?? 'slate';

  return (
    <article className="flex min-h-[7.75rem] flex-col rounded-none border border-border/60 bg-card p-3.5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="truncate text-xs font-normal text-muted-foreground">
          {t(metric.labelKey)}
        </h3>
        <button
          type="button"
          className="shrink-0 rounded p-0.5 text-muted-foreground/60 transition-colors hover:bg-muted/80 hover:text-foreground"
          aria-label={t('admin.dashboard.kpi.viewDetails')}
        >
          <SquareArrowOutUpRight className="size-3.5 stroke-[1.75]" />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2.5">
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-full',
            iconToneStyles[iconTone],
          )}
        >
          <Icon className="size-4 stroke-[1.75]" aria-hidden />
        </span>
        <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
          <p className="text-[1.35rem] font-bold leading-none tracking-tight text-foreground">
            {metric.value}
          </p>
          <span
            className={cn(
              'shrink-0 rounded-full px-2 py-0.5 text-[10px] leading-tight font-semibold whitespace-nowrap',
              badgeStyles[badgeTone],
            )}
          >
            {metric.trend}
          </span>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 pt-2.5">
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
        <p className="shrink-0 text-xs font-bold text-foreground">
          {metric.subValue}
        </p>
      </div>
    </article>
  );
}

export const KpiStatCard = memo(KpiStatCardComponent);
