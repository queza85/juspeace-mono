'use client';

import { memo, useCallback, useState } from 'react';
import { ChevronDown, Printer, RefreshCw, ShieldCheck, ShoppingCart, SquareArrowOutUpRight, Truck, X } from 'lucide-react';
import {
  OrderDialogActions,
  OrderDialogFrame,
  orderInputClassName,
  orderSelectClassName,
  orderTextareaClassName,
} from '@/components/orders/order-dialog-shell';
import { toast } from '@/components/ui/toast';
import { useFormatPrice, useT } from '@/lib/i18n/locale-context';
import type { OrderDetail } from '@/lib/orders/order-detail-mock';
import type { OrderFulfillmentStatus } from '@/lib/orders/mock-data';
import { cn } from '@/lib/utils';

const carriers = ['DHL', 'SF', 'FedEx', 'UPS'] as const;
const orderStatusOptions: OrderFulfillmentStatus[] = ['pending', 'confirmed', 'shipped', 'cancelled'];

export type OrderDetailDialogType =
  | 'updateStatus'
  | 'registerTracking'
  | 'markShipped'
  | 'refund'
  | 'download'
  | 'print'
  | 'cancel'
  | null;

type ExportFormat = 'csv' | 'xlsx';
type RefundType = 'full' | 'partial';

function UpdateStatusFields({ initialStatus }: { initialStatus: OrderFulfillmentStatus }) {
  const t = useT();
  const [status, setStatus] = useState(initialStatus);

  return (
    <>
      <label
        htmlFor="detail-update-order-status-select"
        className="mb-1.5 block text-left text-sm font-semibold text-foreground"
      >
        {t('admin.orders.detail.dialogs.updateStatus.orderStatusLabel')}
      </label>
      <div className="relative">
        <select
          id="detail-update-order-status-select"
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
    </>
  );
}

function RegisterTrackingFields({
  initialTrackingNumber,
  trackingRegistered,
}: {
  initialTrackingNumber: string;
  trackingRegistered: boolean;
}) {
  const t = useT();
  const [carrier, setCarrier] = useState<(typeof carriers)[number]>('DHL');
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber);

  return (
    <div className="space-y-4 text-left">
      <div>
        <p className="mb-1 text-sm font-semibold text-foreground">
          {t('admin.orders.detail.dialogs.registerTracking.trackingStatusLabel')}
        </p>
        <p className="text-sm text-muted-foreground">
          {trackingRegistered
            ? t('admin.orders.detail.dialogs.registerTracking.trackingStatusRegistered')
            : t('admin.orders.detail.dialogs.registerTracking.trackingStatusNotRegistered')}
        </p>
      </div>
      <div>
        <label
          htmlFor="detail-register-tracking-number"
          className="mb-1.5 block text-sm font-semibold text-foreground"
        >
          {t('admin.orders.detail.dialogs.registerTracking.trackingNumberLabel')}
        </label>
        <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-2">
          <div className="relative">
            <select
              id="detail-register-tracking-carrier"
              value={carrier}
              onChange={(event) =>
                setCarrier(event.target.value as (typeof carriers)[number])
              }
              className={orderSelectClassName}
              aria-label={t('admin.orders.detail.dialogs.registerTracking.carrierLabel')}
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
            id="detail-register-tracking-number"
            type="text"
            value={trackingNumber}
            onChange={(event) => setTrackingNumber(event.target.value)}
            className={orderInputClassName}
            placeholder={t('admin.orders.detail.dialogs.registerTracking.trackingPlaceholder')}
          />
        </div>
      </div>
    </div>
  );
}

function RefundFields({ initialAmount }: { initialAmount: string }) {
  const t = useT();
  const [refundType, setRefundType] = useState<RefundType>('full');
  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState(initialAmount);

  return (
    <div className="space-y-4 text-left">
      <div>
        <label
          htmlFor="detail-refund-amount"
          className="mb-1.5 block text-sm font-semibold text-foreground"
        >
          {t('admin.orders.detail.dialogs.refund.amountLabel')}
        </label>
        <input
          id="detail-refund-amount"
          type="text"
          value={refundAmount}
          onChange={(event) => setRefundAmount(event.target.value)}
          disabled={refundType === 'full'}
          className={cn(orderInputClassName, refundType === 'full' && 'bg-muted/40')}
        />
      </div>
      <fieldset className="space-y-2">
        <legend className="mb-1.5 text-sm font-semibold text-foreground">
          {t('admin.orders.detail.dialogs.refund.typeLabel')}
        </legend>
        {(['full', 'partial'] as const).map((option) => (
          <label
            key={option}
            className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-foreground"
          >
            <input
              type="radio"
              name="detail-refund-type"
              value={option}
              checked={refundType === option}
              onChange={() => setRefundType(option)}
              className="size-4 border-border accent-[#5d3e9e] focus-visible:ring-2 focus-visible:ring-ring/30"
            />
            {t(`admin.orders.detail.dialogs.refund.types.${option}`)}
          </label>
        ))}
      </fieldset>
      <div>
        <label
          htmlFor="detail-refund-reason"
          className="mb-1.5 block text-sm font-semibold text-foreground"
        >
          {t('admin.orders.detail.dialogs.refund.reasonLabel')}
        </label>
        <textarea
          id="detail-refund-reason"
          value={refundReason}
          onChange={(event) => setRefundReason(event.target.value)}
          rows={3}
          className={orderTextareaClassName}
          placeholder={t('admin.orders.detail.dialogs.refund.reasonPlaceholder')}
        />
      </div>
    </div>
  );
}

function DownloadOrderDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useT();
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');

  const handleDownload = useCallback(() => {
    toast(
      t('admin.orders.detail.dialogs.download.successPreview', {
        format: t(`admin.orders.detail.dialogs.download.formats.${exportFormat}`),
      }),
      'success',
    );
    onClose();
  }, [exportFormat, onClose, t]);

  return (
    <OrderDialogFrame
      open={open}
      onClose={onClose}
      closeLabel={t('admin.orders.detail.dialogs.download.close')}
      title={t('admin.orders.detail.dialogs.download.title')}
      description={t('admin.orders.detail.dialogs.download.description')}
      titleId="detail-download-title"
      descriptionId="detail-download-description"
      icon={SquareArrowOutUpRight}
      iconPresentation="plain"
      footer={
        <OrderDialogActions
          cancelLabel={t('admin.orders.detail.dialogs.download.cancel')}
          confirmLabel={t('admin.orders.detail.dialogs.download.confirm')}
          onCancel={onClose}
          onConfirm={handleDownload}
          confirmClassName="bg-teal-600 hover:bg-teal-600/90"
        />
      }
    >
      {open ? (
        <fieldset className="space-y-2.5 text-left">
          <legend className="sr-only">{t('admin.orders.detail.dialogs.download.formatLegend')}</legend>
          {(['csv', 'xlsx'] as const).map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-foreground"
            >
              <input
                type="radio"
                name="detail-download-format"
                value={option}
                checked={exportFormat === option}
                onChange={() => setExportFormat(option)}
                className="size-4 border-border text-teal-600 accent-teal-600 focus-visible:ring-2 focus-visible:ring-ring/30"
              />
              {t(`admin.orders.detail.dialogs.download.formats.${option}`)}
            </label>
          ))}
        </fieldset>
      ) : null}
    </OrderDialogFrame>
  );
}

function OrderDetailDialogsComponent({
  activeDialog,
  order,
  onClose,
}: {
  activeDialog: OrderDetailDialogType;
  order: OrderDetail;
  onClose: () => void;
}) {
  const t = useT();
  const formatPrice = useFormatPrice();

  const handleUpdateStatus = useCallback(() => {
    toast(t('admin.orders.detail.dialogs.updateStatus.successPreview'), 'success');
    onClose();
  }, [onClose, t]);

  const handleRegisterTracking = useCallback(() => {
    toast(t('admin.orders.detail.dialogs.registerTracking.successPreview'), 'success');
    onClose();
  }, [onClose, t]);

  const handleMarkShipped = useCallback(() => {
    toast(t('admin.orders.detail.dialogs.markShipped.successPreview'), 'success');
    onClose();
  }, [onClose, t]);

  const handleRefund = useCallback(() => {
    toast(t('admin.orders.detail.dialogs.refund.successPreview'), 'success');
    onClose();
  }, [onClose, t]);

  const handlePrint = useCallback(() => {
    toast(t('admin.orders.detail.dialogs.print.successPreview'), 'success');
    onClose();
  }, [onClose, t]);

  const handleCancelOrder = useCallback(() => {
    toast(t('admin.orders.detail.dialogs.cancel.successPreview'), 'success');
    onClose();
  }, [onClose, t]);

  const trackingRegistered = Boolean(order.trackingNumber?.trim());

  return (
    <>
      <OrderDialogFrame
        open={activeDialog === 'updateStatus'}
        onClose={onClose}
        closeLabel={t('admin.orders.detail.dialogs.updateStatus.close')}
        title={t('admin.orders.detail.dialogs.updateStatus.title')}
        description={t('admin.orders.detail.dialogs.updateStatus.description')}
        titleId="detail-update-order-status-title"
        descriptionId="detail-update-order-status-description"
        icon={ShoppingCart}
        iconPresentation="plain"
        footer={
          <OrderDialogActions
            cancelLabel={t('admin.orders.detail.dialogs.updateStatus.cancel')}
            confirmLabel={t('admin.orders.detail.dialogs.updateStatus.confirm')}
            onCancel={onClose}
            onConfirm={handleUpdateStatus}
          />
        }
      >
        {activeDialog === 'updateStatus' ? (
          <UpdateStatusFields
            key={`${order.id}-update-status`}
            initialStatus={order.orderStatus}
          />
        ) : null}
      </OrderDialogFrame>

      <OrderDialogFrame
        open={activeDialog === 'registerTracking'}
        onClose={onClose}
        closeLabel={t('admin.orders.detail.dialogs.registerTracking.close')}
        title={t('admin.orders.detail.dialogs.registerTracking.title')}
        description={t('admin.orders.detail.dialogs.registerTracking.description')}
        titleId="detail-register-tracking-title"
        descriptionId="detail-register-tracking-description"
        icon={ShieldCheck}
        iconPresentation="plain"
        footer={
          <OrderDialogActions
            cancelLabel={t('admin.orders.detail.dialogs.registerTracking.cancel')}
            confirmLabel={t('admin.orders.detail.dialogs.registerTracking.confirm')}
            onCancel={onClose}
            onConfirm={handleRegisterTracking}
          />
        }
      >
        {activeDialog === 'registerTracking' ? (
          <RegisterTrackingFields
            key={`${order.id}-register-tracking`}
            initialTrackingNumber={order.trackingNumber ?? '129300902'}
            trackingRegistered={trackingRegistered}
          />
        ) : null}
      </OrderDialogFrame>

      <OrderDialogFrame
        open={activeDialog === 'markShipped'}
        onClose={onClose}
        closeLabel={t('admin.orders.detail.dialogs.markShipped.close')}
        title={t('admin.orders.detail.dialogs.markShipped.title')}
        description={t('admin.orders.detail.dialogs.markShipped.description')}
        titleId="detail-mark-shipped-title"
        descriptionId="detail-mark-shipped-description"
        icon={Truck}
        iconPresentation="plain"
        role="alertdialog"
        footer={
          <OrderDialogActions
            cancelLabel={t('admin.orders.detail.dialogs.markShipped.cancel')}
            confirmLabel={t('admin.orders.detail.dialogs.markShipped.confirm')}
            onCancel={onClose}
            onConfirm={handleMarkShipped}
          />
        }
      />

      <OrderDialogFrame
        open={activeDialog === 'refund'}
        onClose={onClose}
        closeLabel={t('admin.orders.detail.dialogs.refund.close')}
        title={t('admin.orders.detail.dialogs.refund.title')}
        description={t('admin.orders.detail.dialogs.refund.description')}
        titleId="detail-refund-title"
        descriptionId="detail-refund-description"
        icon={RefreshCw}
        iconPresentation="plain"
        footer={
          <OrderDialogActions
            cancelLabel={t('admin.orders.detail.dialogs.refund.cancel')}
            confirmLabel={t('admin.orders.detail.dialogs.refund.confirm')}
            onCancel={onClose}
            onConfirm={handleRefund}
            confirmClassName="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90"
          />
        }
      >
        {activeDialog === 'refund' ? (
          <RefundFields
            key={`${order.id}-refund`}
            initialAmount={formatPrice(order.paymentAmountCents)}
          />
        ) : null}
      </OrderDialogFrame>

      {activeDialog === 'download' ? (
        <DownloadOrderDialog open onClose={onClose} />
      ) : null}

      <OrderDialogFrame
        open={activeDialog === 'print'}
        onClose={onClose}
        closeLabel={t('admin.orders.detail.dialogs.print.close')}
        title={t('admin.orders.detail.dialogs.print.title')}
        description={t('admin.orders.detail.dialogs.print.description')}
        titleId="detail-print-title"
        descriptionId="detail-print-description"
        icon={Printer}
        iconPresentation="plain"
        role="alertdialog"
        footer={
          <OrderDialogActions
            cancelLabel={t('admin.orders.detail.dialogs.print.cancel')}
            confirmLabel={t('admin.orders.detail.dialogs.print.confirm')}
            onCancel={onClose}
            onConfirm={handlePrint}
            confirmClassName="bg-teal-600 hover:bg-teal-600/90"
          />
        }
      />

      <OrderDialogFrame
        open={activeDialog === 'cancel'}
        onClose={onClose}
        closeLabel={t('admin.orders.detail.dialogs.cancel.close')}
        title={t('admin.orders.detail.dialogs.cancel.title')}
        description={t('admin.orders.detail.dialogs.cancel.description')}
        titleId="detail-cancel-order-title"
        descriptionId="detail-cancel-order-description"
        icon={X}
        iconPresentation="plain"
        iconClassName="text-[#9ca3af]"
        role="alertdialog"
        footer={
          <OrderDialogActions
            cancelLabel={t('admin.orders.detail.dialogs.cancel.cancel')}
            confirmLabel={t('admin.orders.detail.dialogs.cancel.confirm')}
            onCancel={onClose}
            onConfirm={handleCancelOrder}
            confirmClassName="bg-red-500 hover:bg-red-600"
          />
        }
      />
    </>
  );
}

export const OrderDetailDialogs = memo(OrderDetailDialogsComponent);
