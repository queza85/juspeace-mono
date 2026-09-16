'use client';

import { memo, useCallback, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Check,
  Printer,
  RefreshCw,
  ShieldCheck,
  ShoppingCart,
  SquareArrowOutUpRight,
  Truck,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {
  OrderDetailDialogs,
  type OrderDetailDialogType,
} from '@/components/orders/order-detail-dialogs';
import { OrderDetailBreadcrumbs } from '@/components/orders/order-detail-breadcrumbs';
import { toast } from '@/components/ui/toast';
import { useFormatPrice, useT } from '@/lib/i18n/locale-context';
import type { OrderDetail } from '@/lib/orders/order-detail-mock';
import { getOrderDetailById } from '@/lib/orders/order-detail-mock';
import type {
  OrderFulfillmentStatus,
  OrderPaymentStatus,
  OrderShippingStatus,
} from '@/lib/orders/mock-data';
import {
  orderStatusLabelKey,
  paymentStatusLabelKey,
  shippingStatusLabelKey,
} from '@/lib/orders/mock-data';
import { getProductImageSrc } from '@/lib/products/product-display';
import { cn } from '@/lib/utils';

const detailCardClass =
  'overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-sm';

type OrderDetailDialog = OrderDetailDialogType;

type DetailStatusVariant =
  | 'confirmed'
  | 'paid'
  | 'pending'
  | 'failed'
  | 'refunded'
  | 'shipped'
  | 'cancelled'
  | 'completed';

const detailStatusStyles: Record<DetailStatusVariant, string> = {
  confirmed: 'bg-pink-50 text-pink-600',
  paid: 'bg-emerald-50 text-emerald-600',
  pending: 'bg-amber-50 text-amber-600',
  failed: 'bg-red-50 text-red-600',
  refunded: 'bg-blue-50 text-blue-600',
  shipped: 'bg-sky-50 text-sky-700',
  cancelled: 'bg-red-50 text-red-600',
  completed: 'bg-emerald-50 text-emerald-600',
};

const detailStatusTextStyles: Record<DetailStatusVariant, string> = {
  confirmed: 'text-pink-600',
  paid: 'text-emerald-600',
  pending: 'text-amber-600',
  failed: 'text-red-600',
  refunded: 'text-blue-600',
  shipped: 'text-sky-700',
  cancelled: 'text-red-600',
  completed: 'text-emerald-600',
};

function orderStatusVariant(status: OrderFulfillmentStatus): DetailStatusVariant {
  switch (status) {
    case 'confirmed':
      return 'confirmed';
    case 'shipped':
      return 'shipped';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'pending';
  }
}

function paymentStatusVariant(status: OrderPaymentStatus): DetailStatusVariant {
  switch (status) {
    case 'paid':
      return 'paid';
    case 'failed':
      return 'failed';
    case 'refunded':
      return 'refunded';
    default:
      return 'pending';
  }
}

function shippingStatusVariant(status: OrderShippingStatus): DetailStatusVariant {
  switch (status) {
    case 'shipped':
      return 'shipped';
    case 'returned':
      return 'cancelled';
    default:
      return 'pending';
  }
}

function OrderDetailStatusBadge({
  label,
  variant,
}: {
  label: string;
  variant: DetailStatusVariant;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
        detailStatusStyles[variant],
      )}
    >
      {label}
    </span>
  );
}

function OrderDetailStatusText({
  label,
  variant,
}: {
  label: string;
  variant: DetailStatusVariant;
}) {
  return (
    <span className={cn('text-[12px] font-semibold', detailStatusTextStyles[variant])}>
      {label}
    </span>
  );
}

function DetailCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn(detailCardClass, 'p-4 md:p-5', className)}>
      <h2 className="mb-3 text-[13px] font-bold text-[#111827]">{title}</h2>
      {children}
    </section>
  );
}

function DetailRow({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 first:pt-0 last:pb-0">
      <span className="shrink-0 text-[12px] leading-snug text-[#9ca3af]">{label}</span>
      <span
        className={cn(
          'text-right text-[12px] font-semibold leading-snug text-[#1f2937]',
          wide ? 'min-w-0 flex-1' : 'max-w-[58%]',
        )}
      >
        {value}
      </span>
    </div>
  );
}

function DetailActionButton({
  label,
  icon: Icon,
  className,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-medium text-white transition-colors',
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden />
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}

function OrderDetailActionsBar({
  onChangeStatus,
  onRegisterTracking,
  onMarkShipped,
  onRefund,
  onDownload,
  onPrint,
  onCancel,
}: {
  onChangeStatus: () => void;
  onRegisterTracking: () => void;
  onMarkShipped: () => void;
  onRefund: () => void;
  onDownload: () => void;
  onPrint: () => void;
  onCancel: () => void;
}) {
  const t = useT();

  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      <DetailActionButton
        label={t('admin.orders.detail.actions.updateOrderStatus')}
        icon={ShoppingCart}
        className="bg-[#5d3e9e] hover:bg-[#5d3e9e]/90"
        onClick={onChangeStatus}
      />
      <DetailActionButton
        label={t('admin.orders.detail.actions.registerTracking')}
        icon={ShieldCheck}
        className="bg-[#5d3e9e] hover:bg-[#5d3e9e]/90"
        onClick={onRegisterTracking}
      />
      <DetailActionButton
        label={t('admin.orders.detail.actions.markAsShipped')}
        icon={Truck}
        className="bg-[#5d3e9e] hover:bg-[#5d3e9e]/90"
        onClick={onMarkShipped}
      />
      <DetailActionButton
        label={t('admin.orders.detail.actions.refund')}
        icon={RefreshCw}
        className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90"
        onClick={onRefund}
      />
      <DetailActionButton
        label={t('admin.orders.detail.actions.download')}
        icon={SquareArrowOutUpRight}
        className="bg-[#14b8a6] hover:bg-[#14b8a6]/90"
        onClick={onDownload}
      />
      <DetailActionButton
        label={t('admin.orders.detail.actions.print')}
        icon={Printer}
        className="bg-[#10b981] hover:bg-[#10b981]/90"
        onClick={onPrint}
      />
      <DetailActionButton
        label={t('admin.orders.detail.actions.cancelOrder')}
        icon={X}
        className="bg-red-500 hover:bg-red-600"
        onClick={onCancel}
      />
    </div>
  );
}

function OrderStatusTimeline({
  order,
  t,
}: {
  order: OrderDetail;
  t: (key: string, values?: Record<string, string | number>) => string;
}) {
  return (
    <ol className="space-y-0">
      {order.statusHistory.map((entry, index) => {
        const isLast = index === order.statusHistory.length - 1;
        const labelKey =
          entry.status === 'cancelled'
            ? orderStatusLabelKey('cancelled')
            : orderStatusLabelKey(entry.status);

        return (
          <li key={entry.status} className="relative flex gap-3 pb-4 last:pb-0">
            {!isLast ? (
              <span
                className="absolute top-5 left-[9px] h-[calc(100%-12px)] w-px bg-[#e5e7eb]"
                aria-hidden
              />
            ) : null}
            <span
              className={cn(
                'relative z-10 flex size-[18px] shrink-0 items-center justify-center rounded-full border-2',
                entry.completed
                  ? 'border-[#5d3e9e] bg-[#5d3e9e] text-white'
                  : 'border-[#d1d5db] bg-white text-transparent',
              )}
            >
              {entry.completed ? <Check className="size-2.5" strokeWidth={3} aria-hidden /> : null}
            </span>
            <div className="min-w-0 pt-0.5">
              <p
                className={cn(
                  'text-[12px] font-semibold',
                  entry.completed ? 'text-[#1f2937]' : 'text-[#9ca3af]',
                )}
              >
                {t(labelKey)}
              </p>
              {entry.timestamp ? (
                <p className="text-[11px] text-[#9ca3af]">{entry.timestamp}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function OrderDetailContent({ order }: { order: OrderDetail }) {
  const t = useT();
  const formatPrice = useFormatPrice();
  const [dialog, setDialog] = useState<OrderDetailDialog>(null);
  const [internalNote, setInternalNote] = useState(order.internalNote);
  const [customerNote, setCustomerNote] = useState(order.customerFacingNote);

  const productImageSrc = getProductImageSrc(order.productSlug);

  const handleRefund = useCallback(() => {
    setDialog('refund');
  }, []);

  const handleDownload = useCallback(() => {
    setDialog('download');
  }, []);

  const handleCancelOrder = useCallback(() => {
    setDialog('cancel');
  }, []);

  const handleSaveInternalNote = useCallback(() => {
    toast(t('admin.orders.detail.notes.internalSavedPreview'), 'success');
  }, [t]);

  const handleSaveCustomerNote = useCallback(() => {
    toast(t('admin.orders.detail.notes.customerSavedPreview'), 'success');
  }, [t]);

  return (
    <div className="flex w-full flex-col gap-4">
      <Link
        href="/orders"
        className="inline-block text-sm font-medium text-[#2563eb] underline underline-offset-2 transition-colors hover:text-[#1d4ed8]"
      >
        {t('admin.orders.detail.backToOrders')}
      </Link>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-[15px] font-bold text-[#111827]">
          {t('admin.orders.detail.heading')}
        </h2>
        <OrderDetailActionsBar
            onChangeStatus={() => setDialog('updateStatus')}
            onRegisterTracking={() => setDialog('registerTracking')}
            onMarkShipped={() => setDialog('markShipped')}
            onRefund={handleRefund}
            onDownload={handleDownload}
            onPrint={() => setDialog('print')}
            onCancel={handleCancelOrder}
          />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <DetailCard title={t('admin.orders.detail.sections.orderSummary')}>
          <div className="grid gap-x-8 sm:grid-cols-2">
            <div>
              <DetailRow label={t('admin.orders.detail.fields.orderNumber')} value={order.orderNumber} />
              <DetailRow
                label={t('admin.orders.detail.fields.orderDate')}
                value={`${order.orderDate} ${order.orderTime}`}
              />
              <DetailRow label={t('admin.orders.detail.fields.customer')} value={order.customerName} />
              <DetailRow
                label={t('admin.orders.detail.fields.country')}
                value={t(order.countryKey)}
              />
            </div>
            <div>
              <DetailRow
                label={t('admin.orders.detail.fields.orderStatus')}
                value={
                  <OrderDetailStatusBadge
                    label={t(orderStatusLabelKey(order.orderStatus))}
                    variant={orderStatusVariant(order.orderStatus)}
                  />
                }
              />
              <DetailRow
                label={t('admin.orders.detail.fields.paymentStatus')}
                value={
                  <OrderDetailStatusBadge
                    label={t(paymentStatusLabelKey(order.paymentStatus))}
                    variant={paymentStatusVariant(order.paymentStatus)}
                  />
                }
              />
              <DetailRow
                label={t('admin.orders.detail.fields.shippingStatus')}
                value={
                  <OrderDetailStatusBadge
                    label={t(shippingStatusLabelKey(order.shippingStatus))}
                    variant={shippingStatusVariant(order.shippingStatus)}
                  />
                }
              />
              <DetailRow
                label={t('admin.orders.detail.fields.totalAmount')}
                value={formatPrice(order.totalAmountCents)}
              />
            </div>
          </div>
        </DetailCard>

        <DetailCard title={t('admin.orders.detail.sections.productInformation')}>
          <div className="flex gap-4">
            <div className="size-[7.5rem] shrink-0 overflow-hidden rounded-lg border border-[#e5e7eb] bg-[#f9fafb]">
              {productImageSrc ? (
                <Image
                  src={productImageSrc}
                  alt={order.productName}
                  width={120}
                  height={120}
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-[11px] text-muted-foreground">
                  {t('admin.orders.detail.noImage')}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <DetailRow
                label={t('admin.orders.detail.fields.category')}
                value={order.productCategory}
              />
              <DetailRow label={t('admin.orders.detail.fields.sku')} value={order.productSku} />
              <DetailRow label={t('admin.orders.detail.fields.quantity')} value={order.quantity} />
              <DetailRow
                label={t('admin.orders.detail.fields.price')}
                value={formatPrice(order.unitPriceCents)}
              />
              <DetailRow
                label={t('admin.orders.detail.fields.subtotal')}
                value={formatPrice(order.subtotalCents)}
              />
            </div>
          </div>
        </DetailCard>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DetailCard title={t('admin.orders.detail.sections.customerInformation')}>
          <DetailRow label={t('admin.orders.detail.fields.customerName')} value={order.customerName} />
          <DetailRow label={t('admin.orders.detail.fields.email')} value={order.customerEmail} />
          <DetailRow label={t('admin.orders.detail.fields.phone')} value={order.customerPhone} />
          <DetailRow
            label={t('admin.orders.detail.fields.country')}
            value={t(order.countryKey)}
          />
        </DetailCard>

        <DetailCard title={t('admin.orders.detail.sections.shippingInformation')}>
          <DetailRow
            label={t('admin.orders.detail.fields.recipient')}
            value={order.shippingRecipient}
          />
          <DetailRow
            label={t('admin.orders.detail.fields.shippingAddress')}
            value={order.shippingAddress}
          />
          <DetailRow
            label={t('admin.orders.detail.fields.trackingNumber')}
            value={order.trackingNumber ?? t('admin.orders.table.noTracking')}
          />
          <DetailRow
            label={t('admin.orders.detail.fields.shippingStatus')}
            value={
              <OrderDetailStatusText
                label={t(shippingStatusLabelKey(order.shippingStatus))}
                variant={shippingStatusVariant(order.shippingStatus)}
              />
            }
          />
        </DetailCard>

        <DetailCard title={t('admin.orders.detail.sections.paymentInformation')}>
          <DetailRow
            label={t('admin.orders.detail.fields.paymentMethod')}
            value={t(`admin.orders.detail.paymentMethods.${order.paymentMethod}`)}
          />
          <DetailRow
            label={t('admin.orders.detail.fields.paymentProvider')}
            value={order.paymentProvider}
          />
          <DetailRow
            label={t('admin.orders.detail.fields.transactionNumber')}
            value={order.paymentTransactionNumber}
          />
          <DetailRow
            label={t('admin.orders.detail.fields.paymentAmount')}
            value={formatPrice(order.paymentAmountCents)}
          />
          <DetailRow
            label={t('admin.orders.detail.fields.paymentStatus')}
            value={
              <OrderDetailStatusBadge
                label={t(paymentStatusLabelKey(order.paymentStatus))}
                variant={paymentStatusVariant(order.paymentStatus)}
              />
            }
          />
        </DetailCard>

        <DetailCard title={t('admin.orders.detail.sections.pgTransactionInformation')}>
          <DetailRow
            label={t('admin.orders.detail.fields.transactionId')}
            value={order.pgTransactionId}
          />
          <DetailRow label={t('admin.orders.detail.fields.provider')} value={order.pgProvider} />
          <DetailRow
            label={t('admin.orders.detail.fields.paymentTime')}
            value={order.pgPaymentTime}
          />
          <DetailRow
            label={t('admin.orders.detail.fields.response')}
            value={t(`admin.orders.detail.pgResponses.${order.pgResponse}`)}
          />
          <DetailRow
            label={t('admin.orders.detail.fields.status')}
            value={
              <OrderDetailStatusBadge
                label={t(`admin.orders.detail.pgStatus.${order.pgStatus}`)}
                variant={
                  order.pgStatus === 'completed'
                    ? 'completed'
                    : order.pgStatus === 'failed'
                      ? 'failed'
                      : 'pending'
                }
              />
            }
          />
        </DetailCard>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DetailCard title={t('admin.orders.detail.sections.orderStatusHistory')}>
          <OrderStatusTimeline order={order} t={t} />
        </DetailCard>

        <DetailCard title={t('admin.orders.detail.sections.trackingNumber')}>
          {order.trackingEntries.length > 0 ? (
            <ul className="space-y-2">
              {order.trackingEntries.map((entry) => (
                <li key={entry} className="flex items-center gap-2 text-[12px] font-semibold text-[#1f2937]">
                  <span className="size-1.5 rounded-full bg-[#1f2937]" aria-hidden />
                  {entry}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-muted-foreground">
              {t('admin.orders.detail.noTrackingEntries')}
            </p>
          )}
        </DetailCard>

        <DetailCard title={t('admin.orders.detail.sections.internalNotes')}>
          <textarea
            value={internalNote}
            onChange={(event) => setInternalNote(event.target.value)}
            rows={4}
            className="w-full resize-none rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-[12px] text-[#1f2937] outline-none placeholder:text-[#9ca3af] focus-visible:border-[#5d3e9e] focus-visible:ring-2 focus-visible:ring-[#5d3e9e]/20"
            placeholder={t('admin.orders.detail.notes.internalPlaceholder')}
          />
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={handleSaveInternalNote}
              className="inline-flex h-8 items-center rounded-lg bg-[#5d3e9e] px-4 text-[11px] font-medium text-white hover:bg-[#5d3e9e]/90"
            >
              {t('admin.orders.detail.notes.addNote')}
            </button>
          </div>
        </DetailCard>

        <DetailCard title={t('admin.orders.detail.sections.customerFacingNotes')}>
          <textarea
            value={customerNote}
            onChange={(event) => setCustomerNote(event.target.value)}
            rows={4}
            className="w-full resize-none rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-[12px] text-[#1f2937] outline-none placeholder:text-[#9ca3af] focus-visible:border-[#5d3e9e] focus-visible:ring-2 focus-visible:ring-[#5d3e9e]/20"
            placeholder={t('admin.orders.detail.notes.customerPlaceholder')}
          />
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={handleSaveCustomerNote}
              className="inline-flex h-8 items-center rounded-lg bg-[#5d3e9e] px-4 text-[11px] font-medium text-white hover:bg-[#5d3e9e]/90"
            >
              {t('admin.orders.detail.notes.saveNote')}
            </button>
          </div>
        </DetailCard>

        <DetailCard
          title={t('admin.orders.detail.sections.cancellationAndRefund')}
          className="col-span-2"
        >
          <div className="grid gap-4 sm:grid-cols-2 sm:divide-x sm:divide-[#e5e7eb]">
            <div className="sm:pr-6">
              <DetailRow
                wide
                label={t('admin.orders.detail.fields.cancellationStatus')}
                value={t(`admin.orders.detail.cancellationStatus.${order.cancellationStatus}`)}
              />
              <DetailRow
                wide
                label={t('admin.orders.detail.fields.refundStatus')}
                value={t(`admin.orders.detail.refundStatus.${order.refundStatus}`)}
              />
            </div>
            <div className="sm:pl-6">
              <DetailRow
                wide
                label={t('admin.orders.detail.fields.refundAmount')}
                value={formatPrice(order.refundAmountCents)}
              />
              <DetailRow
                wide
                label={t('admin.orders.detail.fields.refundHistory')}
                value={t(`admin.orders.detail.refundHistory.${order.refundHistory}`)}
              />
            </div>
          </div>
        </DetailCard>
      </div>

      <OrderDetailDialogs
        activeDialog={dialog}
        order={order}
        onClose={() => setDialog(null)}
      />
    </div>
  );
}

function OrderDetailPageComponent({ id }: { id: string }) {
  const t = useT();
  const order = getOrderDetailById(id);

  return (
    <div className="-mx-4 -mt-4 flex min-h-full flex-col md:-mx-6 md:-mt-6">
      <header className="border-b border-border/60 bg-card px-4 py-3 md:px-6">
        <div className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center justify-between gap-3">
          <h1 className="text-sm font-bold tracking-[0.08em] text-[#111827] uppercase">
            {t('admin.orders.detail.pageTitle')}
          </h1>
          <OrderDetailBreadcrumbs />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 bg-[#f3f4f6] px-4 py-4 md:px-6 md:py-5">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4">
          {!order ? (
            <div
              className={cn(
                detailCardClass,
                'px-4 py-8 text-center text-sm text-muted-foreground',
              )}
            >
              {t('admin.orders.detail.notFound')}
            </div>
          ) : (
            <OrderDetailContent order={order} />
          )}
        </div>
      </div>
    </div>
  );
}

export const OrderDetailPage = memo(OrderDetailPageComponent);
