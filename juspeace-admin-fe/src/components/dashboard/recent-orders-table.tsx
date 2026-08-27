'use client';

import { memo } from 'react';
import { Eye, Trash2 } from 'lucide-react';
import { DashboardPanel } from '@/components/dashboard/dashboard-panel';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { recentOrders } from '@/lib/dashboard/mock-data';
import { useFormatPrice, useT } from '@/lib/i18n/locale-context';

function RecentOrdersTableComponent() {
  const t = useT();
  const formatPrice = useFormatPrice();

  return (
    <DashboardPanel
      title={t('admin.dashboard.orders.title')}
      action={
        <button
          type="button"
          className="text-[11px] font-medium text-primary hover:underline"
        >
          {t('admin.dashboard.orders.viewAll')}
        </button>
      }
    >
      <div className="-mx-4 overflow-x-auto md:-mx-5">
        <table className="w-full min-w-[900px] text-xs">
          <thead>
            <tr className="border-b border-border/60 text-left text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">
                {t('admin.dashboard.orders.columns.orderNumber')}
              </th>
              <th className="px-4 py-2.5 font-medium">
                {t('admin.dashboard.orders.columns.orderDate')}
              </th>
              <th className="px-4 py-2.5 font-medium">
                {t('admin.dashboard.orders.columns.customer')}
              </th>
              <th className="px-4 py-2.5 font-medium">
                {t('admin.dashboard.orders.columns.product')}
              </th>
              <th className="px-4 py-2.5 font-medium">
                {t('admin.dashboard.orders.columns.quantity')}
              </th>
              <th className="px-4 py-2.5 font-medium">
                {t('admin.dashboard.orders.columns.paymentAmount')}
              </th>
              <th className="px-4 py-2.5 font-medium">
                {t('admin.dashboard.orders.columns.paymentStatus')}
              </th>
              <th className="px-4 py-2.5 font-medium">
                {t('admin.dashboard.orders.columns.orderStatus')}
              </th>
              <th className="px-4 py-2.5 font-medium">
                {t('admin.dashboard.orders.columns.shippingStatus')}
              </th>
              <th className="px-4 py-2.5 font-medium">
                {t('admin.dashboard.orders.columns.action')}
              </th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-border/40 last:border-0 hover:bg-muted/20"
              >
                <td className="px-4 py-2.5 font-medium">{order.orderNumber}</td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  {order.orderDate}
                </td>
                <td className="px-4 py-2.5">{order.customerName}</td>
                <td className="px-4 py-2.5">
                  <div>
                    <p className="font-medium">{order.productName}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {order.productBrand}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-2.5">{order.quantity}</td>
                <td className="px-4 py-2.5">{formatPrice(order.paymentAmountCents)}</td>
                <td className="px-4 py-2.5">
                  <StatusBadge
                    label={t(order.paymentStatusKey)}
                    tone={order.paymentStatusTone}
                  />
                </td>
                <td className="px-4 py-2.5">
                  <StatusBadge
                    label={t(order.orderStatusKey)}
                    tone={order.orderStatusTone}
                  />
                </td>
                <td className="px-4 py-2.5">
                  <StatusBadge
                    label={t(order.shippingStatusKey)}
                    tone={order.shippingStatusTone}
                  />
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      className="rounded p-1 text-muted-foreground hover:text-foreground"
                      aria-label={t('admin.dashboard.orders.view')}
                    >
                      <Eye className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      className="rounded p-1 text-muted-foreground hover:text-destructive"
                      aria-label={t('admin.dashboard.orders.delete')}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardPanel>
  );
}

export const RecentOrdersTable = memo(RecentOrdersTableComponent);
