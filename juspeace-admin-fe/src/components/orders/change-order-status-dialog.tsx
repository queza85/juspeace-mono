'use client';

import { memo, useCallback, useState } from 'react';
import { ChevronDown, ShoppingCart } from 'lucide-react';
import {
  OrderDialogActions,
  OrderDialogFrame,
  orderSelectClassName,
} from '@/components/orders/order-dialog-shell';
import { toast } from '@/components/ui/toast';
import { useT } from '@/lib/i18n/locale-context';
import type { OrderFulfillmentStatus } from '@/lib/orders/mock-data';

const orderStatusOptions: OrderFulfillmentStatus[] = [
  'pending',
  'confirmed',
  'shipped',
  'cancelled',
];

function ChangeOrderStatusDialogComponent({
  open,
  selectedCount,
  onClose,
  onConfirm,
}: {
  open: boolean;
  selectedCount: number;
  onClose: () => void;
  onConfirm?: (status: OrderFulfillmentStatus) => void;
}) {
  const t = useT();
  const [status, setStatus] = useState<OrderFulfillmentStatus>('pending');

  const handleClose = useCallback(() => {
    setStatus('pending');
    onClose();
  }, [onClose]);

  const handleConfirm = useCallback(() => {
    onConfirm?.(status);
    toast(t('admin.orders.changeStatusDialog.successPreview', { count: selectedCount }), 'success');
    handleClose();
  }, [handleClose, onConfirm, selectedCount, status, t]);

  return (
    <OrderDialogFrame
      open={open}
      onClose={handleClose}
      closeLabel={t('admin.orders.changeStatusDialog.close')}
      title={t('admin.orders.changeStatusDialog.title')}
      description={t('admin.orders.changeStatusDialog.description')}
      titleId="change-order-status-dialog-title"
      descriptionId="change-order-status-dialog-description"
      icon={ShoppingCart}
      iconWrapClassName="bg-violet-100"
      iconClassName="text-violet-600"
      footer={
        <OrderDialogActions
          cancelLabel={t('admin.orders.changeStatusDialog.cancel')}
          confirmLabel={t('admin.orders.changeStatusDialog.confirm')}
          onCancel={handleClose}
          onConfirm={handleConfirm}
        />
      }
    >
      <label
        htmlFor="change-order-status-select"
        className="mb-1.5 block text-sm font-semibold text-foreground"
      >
        {t('admin.orders.changeStatusDialog.orderStatusLabel')}
      </label>
      <div className="relative">
        <select
          id="change-order-status-select"
          value={status}
          onChange={(event) => setStatus(event.target.value as OrderFulfillmentStatus)}
          className={orderSelectClassName}
        >
          {orderStatusOptions.map((option) => (
            <option key={option} value={option}>
              {t(`admin.orders.orderStatus.${option}`)}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
      </div>
    </OrderDialogFrame>
  );
}

export const ChangeOrderStatusDialog = memo(ChangeOrderStatusDialogComponent);
