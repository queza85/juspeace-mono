'use client';

import { memo, useCallback, useState } from 'react';
import { SquareArrowOutUpRight } from 'lucide-react';
import { OrderDialogActions, OrderDialogFrame } from '@/components/orders/order-dialog-shell';
import { toast } from '@/components/ui/toast';
import { useT } from '@/lib/i18n/locale-context';
import { cn } from '@/lib/utils';

type ExportFormat = 'csv' | 'xlsx';

function ExportOrdersDialogComponent({
  open,
  selectedCount,
  onClose,
}: {
  open: boolean;
  selectedCount: number;
  onClose: () => void;
}) {
  const t = useT();
  const [format, setFormat] = useState<ExportFormat>('csv');

  const handleClose = useCallback(() => {
    setFormat('csv');
    onClose();
  }, [onClose]);

  const handleConfirm = useCallback(() => {
    toast(
      t('admin.orders.exportDialog.successPreview', {
        count: selectedCount,
        format: t(`admin.orders.exportDialog.formats.${format}`),
      }),
      'success',
    );
    handleClose();
  }, [format, handleClose, selectedCount, t]);

  return (
    <OrderDialogFrame
      open={open}
      onClose={handleClose}
      closeLabel={t('admin.orders.exportDialog.close')}
      title={t('admin.orders.exportDialog.title')}
      description={t('admin.orders.exportDialog.description', { count: selectedCount })}
      titleId="export-orders-dialog-title"
      descriptionId="export-orders-dialog-description"
      icon={SquareArrowOutUpRight}
      iconWrapClassName="bg-teal-50"
      iconClassName="text-teal-700"
      footer={
        <OrderDialogActions
          cancelLabel={t('admin.orders.exportDialog.cancel')}
          confirmLabel={t('admin.orders.exportDialog.confirm')}
          onCancel={handleClose}
          onConfirm={handleConfirm}
          confirmClassName="bg-teal-600 hover:bg-teal-600/90"
        />
      }
    >
      <fieldset className="space-y-2.5">
        <legend className="sr-only">{t('admin.orders.exportDialog.formatLegend')}</legend>
        {(['csv', 'xlsx'] as const).map((option) => (
          <label
            key={option}
            className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-foreground"
          >
            <input
              type="radio"
              name="export-format"
              value={option}
              checked={format === option}
              onChange={() => setFormat(option)}
              className={cn(
                'size-4 border-border text-teal-600 accent-teal-600',
                'focus-visible:ring-2 focus-visible:ring-ring/30',
              )}
            />
            {t(`admin.orders.exportDialog.formats.${option}`)}
          </label>
        ))}
      </fieldset>
    </OrderDialogFrame>
  );
}

export const ExportOrdersDialog = memo(ExportOrdersDialogComponent);
