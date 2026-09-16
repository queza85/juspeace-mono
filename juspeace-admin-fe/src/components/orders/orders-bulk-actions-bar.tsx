'use client';

import { memo } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Printer,
  ShieldCheck,
  ShoppingCart,
  SquareArrowOutUpRight,
  Truck,
  X,
} from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { useT } from '@/lib/i18n/locale-context';
import { cn } from '@/lib/utils';

function BulkActionButton({
  label,
  icon: Icon,
  tone = 'primary',
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  tone?: 'primary' | 'teal';
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        buttonVariants({ size: 'xs' }),
        'h-7 gap-1.5 px-2.5 text-[11px] font-medium',
        tone === 'primary' && 'bg-primary text-primary-foreground hover:bg-primary/90',
        tone === 'teal' &&
          'border-transparent bg-teal-600 text-white hover:bg-teal-600/90',
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {label}
    </button>
  );
}

function OrdersBulkActionsBarComponent({
  selectedCount,
  onClearSelection,
  onChangeOrderStatus,
  onRegisterTracking,
  onMarkAsShipped,
  onExport,
  onPrintDocument,
}: {
  selectedCount: number;
  onClearSelection: () => void;
  onChangeOrderStatus: () => void;
  onRegisterTracking: () => void;
  onMarkAsShipped: () => void;
  onExport: () => void;
  onPrintDocument: () => void;
}) {
  const t = useT();

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-start gap-2.5">
        <button
          type="button"
          onClick={onClearSelection}
          aria-label={t('admin.orders.bulkActions.clearSelection')}
          className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded border border-primary bg-primary text-primary-foreground"
        >
          <span className="sr-only">{t('admin.orders.bulkActions.clearSelection')}</span>
          <svg viewBox="0 0 12 12" className="size-2.5" aria-hidden>
            <path
              d="M2.5 6.2 5 8.7 9.5 3.8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-primary">
            {t('admin.orders.bulkActions.selectedCount', { count: selectedCount })}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {t('admin.orders.bulkActions.hint')}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-1.5">
        <BulkActionButton
          label={t('admin.orders.bulkActions.changeOrderStatus')}
          icon={ShoppingCart}
          onClick={onChangeOrderStatus}
        />
        <BulkActionButton
          label={t('admin.orders.bulkActions.registerTracking')}
          icon={ShieldCheck}
          onClick={onRegisterTracking}
        />
        <BulkActionButton
          label={t('admin.orders.bulkActions.markAsShipped')}
          icon={Truck}
          onClick={onMarkAsShipped}
        />
        <BulkActionButton
          label={t('admin.orders.bulkActions.export')}
          icon={SquareArrowOutUpRight}
          tone="teal"
          onClick={onExport}
        />
        <BulkActionButton
          label={t('admin.orders.bulkActions.printDocument')}
          icon={Printer}
          tone="teal"
          onClick={onPrintDocument}
        />
        <button
          type="button"
          onClick={onClearSelection}
          className={cn(
            buttonVariants({ variant: 'outline', size: 'xs' }),
            'h-7 gap-1.5 px-2.5 text-[11px] font-medium',
          )}
        >
          <X className="size-3.5" aria-hidden />
          {t('admin.orders.bulkActions.clearSelection')}
        </button>
      </div>
    </div>
  );
}

export const OrdersBulkActionsBar = memo(OrdersBulkActionsBarComponent);
