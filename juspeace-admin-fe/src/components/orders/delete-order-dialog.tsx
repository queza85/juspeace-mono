'use client';

import { memo, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import { OrderDialogActions, OrderDialogFrame } from '@/components/orders/order-dialog-shell';
import { toast } from '@/components/ui/toast';
import { useT } from '@/lib/i18n/locale-context';

function DeleteOrderDialogComponent({
  open,
  orderNumber,
  onClose,
  onConfirm,
}: {
  open: boolean;
  orderNumber: string | null;
  onClose: () => void;
  onConfirm?: () => void;
}) {
  const t = useT();

  const handleConfirm = useCallback(() => {
    onConfirm?.();
    toast(
      t('admin.orders.deleteOrderDialog.successPreview', {
        orderNumber: orderNumber ?? '',
      }),
      'success',
    );
    onClose();
  }, [onClose, onConfirm, orderNumber, t]);

  if (!orderNumber) {
    return null;
  }

  return (
    <OrderDialogFrame
      open={open}
      onClose={onClose}
      closeLabel={t('admin.orders.deleteOrderDialog.close')}
      title={t('admin.orders.deleteOrderDialog.title')}
      description={t('admin.orders.deleteOrderDialog.description')}
      titleId="delete-order-dialog-title"
      descriptionId="delete-order-dialog-description"
      icon={Trash2}
      iconWrapClassName="bg-red-50"
      iconClassName="text-red-500"
      role="alertdialog"
      footer={
        <OrderDialogActions
          cancelLabel={t('admin.orders.deleteOrderDialog.cancel')}
          confirmLabel={t('admin.orders.deleteOrderDialog.confirm')}
          onCancel={onClose}
          onConfirm={handleConfirm}
          confirmClassName="bg-red-500 hover:bg-red-600"
        />
      }
    />
  );
}

export const DeleteOrderDialog = memo(DeleteOrderDialogComponent);
