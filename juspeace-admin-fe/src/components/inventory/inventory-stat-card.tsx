'use client';

import { memo } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ClipboardCheck,
  Clock3,
  Layers,
  ShoppingBag,
  ShoppingCart,
  SquareArrowOutUpRight,
  TrendingDown,
} from 'lucide-react';
import type { InventoryStatMetric } from '@/lib/inventory/mock-data';
import { useT } from '@/lib/i18n/locale-context';

const iconById: Record<string, LucideIcon> = {
  totalStock: Layers,
  availableStock: ClipboardCheck,
  reservedStock: Clock3,
  soldQuantity: ShoppingCart,
  lowStockItems: TrendingDown,
  soldOutItems: ShoppingBag,
};

function InventoryStatCardComponent({ metric }: { metric: InventoryStatMetric }) {
  const t = useT();
  const Icon = iconById[metric.id] ?? Layers;

  return (
    <article className="flex flex-col rounded-lg border border-border/60 bg-card p-4 shadow-sm">
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

      <div className="mt-4 flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <Icon className="size-[1.125rem] stroke-[1.75]" aria-hidden />
        </span>
        <p className="text-[1.625rem] font-bold leading-none tracking-tight text-foreground">
          {metric.value}
        </p>
      </div>
    </article>
  );
}

export const InventoryStatCard = memo(InventoryStatCardComponent);
