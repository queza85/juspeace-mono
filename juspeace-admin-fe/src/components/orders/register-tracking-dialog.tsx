'use client';

import { memo, useCallback, useState } from 'react';
import { ChevronDown, ShieldCheck } from 'lucide-react';
import {
  OrderDialogActions,
  OrderDialogFrame,
  orderInputClassName,
  orderSelectClassName,
} from '@/components/orders/order-dialog-shell';
import { toast } from '@/components/ui/toast';
import { useT } from '@/lib/i18n/locale-context';

const carriers = ['DHL', 'SF', 'FedEx', 'UPS'] as const;

function RegisterTrackingDialogComponent({
  open,
  selectedCount,
  onClose,
}: {
  open: boolean;
  selectedCount: number;
  onClose: () => void;
}) {
  const t = useT();
  const [carrier, setCarrier] = useState<(typeof carriers)[number]>('DHL');
  const [trackingNumber, setTrackingNumber] = useState('129300902');

  const handleClose = useCallback(() => {
    setCarrier('DHL');
    setTrackingNumber('129300902');
    onClose();
  }, [onClose]);

  const handleConfirm = useCallback(() => {
    toast(
      t('admin.orders.registerTrackingDialog.successPreview', { count: selectedCount }),
      'success',
    );
    handleClose();
  }, [handleClose, selectedCount, t]);

  return (
    <OrderDialogFrame
      open={open}
      onClose={handleClose}
      closeLabel={t('admin.orders.registerTrackingDialog.close')}
      title={t('admin.orders.registerTrackingDialog.title')}
      description={t('admin.orders.registerTrackingDialog.description')}
      titleId="register-tracking-dialog-title"
      descriptionId="register-tracking-dialog-description"
      icon={ShieldCheck}
      iconWrapClassName="bg-violet-100"
      iconClassName="text-violet-700"
      footer={
        <OrderDialogActions
          cancelLabel={t('admin.orders.registerTrackingDialog.cancel')}
          confirmLabel={t('admin.orders.registerTrackingDialog.confirm')}
          onCancel={handleClose}
          onConfirm={handleConfirm}
        />
      }
    >
      <label
        htmlFor="register-tracking-number"
        className="mb-1.5 block text-sm font-semibold text-foreground"
      >
        {t('admin.orders.registerTrackingDialog.trackingNumberLabel')}
      </label>
      <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-2">
        <div className="relative">
          <select
            id="register-tracking-carrier"
            value={carrier}
            onChange={(event) =>
              setCarrier(event.target.value as (typeof carriers)[number])
            }
            className={orderSelectClassName}
            aria-label={t('admin.orders.registerTrackingDialog.carrierLabel')}
          >
            {carriers.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
        </div>
        <input
          id="register-tracking-number"
          type="text"
          value={trackingNumber}
          onChange={(event) => setTrackingNumber(event.target.value)}
          className={orderInputClassName}
          placeholder={t('admin.orders.registerTrackingDialog.trackingPlaceholder')}
        />
      </div>
    </OrderDialogFrame>
  );
}

export const RegisterTrackingDialog = memo(RegisterTrackingDialogComponent);
