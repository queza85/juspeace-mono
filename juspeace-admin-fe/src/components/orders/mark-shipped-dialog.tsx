'use client';

import { memo, useCallback } from 'react';
import { Truck } from 'lucide-react';
import { OrderDialogActions, OrderDialogFrame } from '@/components/orders/order-dialog-shell';
import { toast } from '@/components/ui/toast';
import { useT } from '@/lib/i18n/locale-context';

function MarkShippedDialogComponent({
  open,
  selectedCount,
  onClose,
}: {
  open: boolean;
  selectedCount: number;
  onClose: () => void;
}) {
  const t = useT();

  const handleConfirm = useCallback(() => {
    toast(t('admin.orders.markShippedDialog.successPreview', { count: selectedCount }), 'success');
    onClose();
  }, [onClose, selectedCount, t]);

  return (
    <OrderDialogFrame
      open={open}
      onClose={onClose}
      closeLabel={t('admin.orders.markShippedDialog.close')}
      title={t('admin.orders.markShippedDialog.title')}
      description={t('admin.orders.markShippedDialog.description', { count: selectedCount })}
      titleId="mark-shipped-dialog-title"
      descriptionId="mark-shipped-dialog-description"
      icon={Truck}
      iconWrapClassName="bg-violet-100"
      iconClassName="text-violet-700"
      role="alertdialog"
      footer={
        <OrderDialogActions
          cancelLabel={t('admin.orders.markShippedDialog.cancel')}
          confirmLabel={t('admin.orders.markShippedDialog.confirm')}
          onCancel={onClose}
          onConfirm={handleConfirm}
        />
      }
    />
  );
}

export const MarkShippedDialog = memo(MarkShippedDialogComponent);
