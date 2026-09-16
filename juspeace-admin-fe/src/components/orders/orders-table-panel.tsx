'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Calendar,
  DollarSign,
  Eye,
  Globe,
  Package,
  Search,
  ShieldCheck,
  ShoppingCart,
  Trash2,
  Truck,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { dashboardPanelClass } from '@/components/dashboard/dashboard-panel';
import { ChangeOrderStatusDialog } from '@/components/orders/change-order-status-dialog';
import { DeleteOrderDialog } from '@/components/orders/delete-order-dialog';
import { ExportOrdersDialog } from '@/components/orders/export-orders-dialog';
import { MarkShippedDialog } from '@/components/orders/mark-shipped-dialog';
import { OrdersBulkActionsBar } from '@/components/orders/orders-bulk-actions-bar';
import { PrintDocumentsDialog } from '@/components/orders/print-documents-dialog';
import { RegisterTrackingDialog } from '@/components/orders/register-tracking-dialog';
import { StatusBadge } from '@/components/dashboard/status-badge';
import {
  TableFilterSelect,
} from '@/components/table/table-page-size-select';
import { TablePagination } from '@/components/table/table-pagination';
import { useClientPaginatedItems } from '@/lib/hooks/use-pagination';
import { useFormatPrice, useT } from '@/lib/i18n/locale-context';
import {
  countryFlagEmoji,
  matchesCountryFilter,
  matchesDateRangeFilter,
  matchesOrderSearch,
  matchesOrderStatusFilter,
  matchesPaymentStatusFilter,
  matchesProductFilter,
  matchesShippingStatusFilter,
  matchesTrackingFilter,
  sortOrders,
  type DateRangeFilter,
  type OrderSortColumn,
  type TrackingFilter,
} from '@/lib/orders/order-display';
import {
  orderListRows,
  orderStatusLabelKey,
  orderStatusTone,
  paymentStatusLabelKey,
  paymentStatusTone,
  shippingStatusLabelKey,
  shippingStatusTone,
  type OrderFulfillmentStatus,
  type OrderListRow,
  type OrderPaymentStatus,
  type OrderShippingStatus,
} from '@/lib/orders/mock-data';
import { getProductImageSrc } from '@/lib/products/product-display';
import {
  cycleTableSort,
  type SortDirection,
  type TableSortState,
} from '@/lib/table';
import { cn } from '@/lib/utils';

const tableEdgeCellClass = {
  first: 'py-2.5 pr-3 pl-4 md:pl-5',
  middle: 'px-3 py-2.5',
  last: 'py-2.5 pr-4 pl-3 text-right md:pr-5',
} as const;

function SortableHeaderButton({
  label,
  column,
  activeColumn,
  direction,
  onSort,
  sortAscendingLabel,
  sortDescendingLabel,
  sortLabel,
}: {
  label: string;
  column: OrderSortColumn;
  activeColumn: OrderSortColumn | null;
  direction: SortDirection;
  onSort: (column: OrderSortColumn) => void;
  sortAscendingLabel: string;
  sortDescendingLabel: string;
  sortLabel: string;
}) {
  const isActive = activeColumn === column;
  const SortIcon = isActive
    ? direction === 'asc'
      ? ArrowUp
      : ArrowDown
    : ArrowUpDown;

  const ariaLabel = isActive
    ? direction === 'asc'
      ? sortAscendingLabel
      : sortDescendingLabel
    : sortLabel;

  return (
    <button
      type="button"
      onClick={() => onSort(column)}
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center gap-1 rounded-sm transition-colors hover:text-foreground',
        isActive ? 'text-foreground' : 'text-muted-foreground',
      )}
    >
      {label}
      <SortIcon
        className={cn('size-2.5', isActive ? 'text-foreground' : 'text-muted-foreground/70')}
        aria-hidden
      />
    </button>
  );
}

type OrderBulkDialog =
  | 'changeStatus'
  | 'registerTracking'
  | 'markShipped'
  | 'export'
  | 'print'
  | null;

function TableActionButton({
  label,
  children,
  destructive = false,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  destructive?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        'inline-flex size-6 items-center justify-center rounded-full border border-border/70 bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
        destructive && 'hover:border-destructive/30 hover:text-destructive',
      )}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
    >
      {children}
    </button>
  );
}

function OrderProductThumbnail({
  name,
  slug,
}: {
  name: string;
  slug: string;
}) {
  const src = getProductImageSrc(slug);

  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={36}
        height={36}
        className="size-9 shrink-0 rounded-md border border-border/60 object-cover"
      />
    );
  }

  return (
    <div
      className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/40 text-[10px] font-semibold text-muted-foreground"
      aria-hidden
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

function OrdersTablePanelComponent() {
  const t = useT();
  const formatPrice = useFormatPrice();

  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<DateRangeFilter>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<
    'all' | OrderFulfillmentStatus
  >('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<
    'all' | OrderPaymentStatus
  >('all');
  const [shippingStatusFilter, setShippingStatusFilter] = useState<
    'all' | OrderShippingStatus
  >('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  const [trackingFilter, setTrackingFilter] = useState<TrackingFilter>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDialog, setBulkDialog] = useState<OrderBulkDialog>(null);
  const [deleteOrderTarget, setDeleteOrderTarget] = useState<{
    id: string;
    orderNumber: string;
  } | null>(null);
  const [sort, setSort] = useState<TableSortState<OrderSortColumn>>(null);

  const productOptions = useMemo(() => {
    const slugs = new Map<string, string>();
    for (const order of orderListRows) {
      slugs.set(order.productSlug, order.productName);
    }
    return Array.from(slugs.entries());
  }, []);

  const countryOptions = useMemo(() => {
    const countries = new Map<string, string>();
    for (const order of orderListRows) {
      countries.set(order.countryCode, order.countryKey);
    }
    return Array.from(countries.entries());
  }, []);

  const filteredOrders = useMemo(() => {
    return orderListRows.filter((order) => {
      if (!matchesOrderSearch(order, search)) {
        return false;
      }
      if (!matchesDateRangeFilter(order, dateRange)) {
        return false;
      }
      if (!matchesOrderStatusFilter(order, orderStatusFilter)) {
        return false;
      }
      if (!matchesPaymentStatusFilter(order, paymentStatusFilter)) {
        return false;
      }
      if (!matchesShippingStatusFilter(order, shippingStatusFilter)) {
        return false;
      }
      if (!matchesCountryFilter(order, countryFilter)) {
        return false;
      }
      if (!matchesProductFilter(order, productFilter)) {
        return false;
      }
      if (!matchesTrackingFilter(order, trackingFilter)) {
        return false;
      }
      return true;
    });
  }, [
    countryFilter,
    dateRange,
    orderStatusFilter,
    paymentStatusFilter,
    productFilter,
    search,
    shippingStatusFilter,
    trackingFilter,
  ]);

  const sortedOrders = useMemo(() => {
    if (!sort) {
      return filteredOrders;
    }

    return sortOrders(filteredOrders, sort.column, sort.direction);
  }, [filteredOrders, sort]);

  const {
    pageItems,
    setPage,
    resetPage,
    showingFrom,
    showingTo,
    total,
    currentPage,
    totalPages,
    hasPreviousPage,
    hasNextPage,
  } = useClientPaginatedItems(sortedOrders, 12);

  const allPageSelected =
    pageItems.length > 0 && pageItems.every((item) => selectedIds.has(item.id));

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        for (const item of pageItems) {
          next.delete(item.id);
        }
      } else {
        for (const item of pageItems) {
          next.add(item.id);
        }
      }
      return next;
    });
  }, [allPageSelected, pageItems]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const selectedCount = selectedIds.size;

  const handleSort = useCallback(
    (column: OrderSortColumn) => {
      setSort((current) => cycleTableSort(current, column));
      resetPage();
    },
    [resetPage],
  );

  const sortLabelFor = useCallback(
    (columnLabel: string) => ({
      sortLabel: t('admin.orders.table.sortBy', { column: columnLabel }),
      sortAscendingLabel: t('admin.orders.table.sortAscending', {
        column: columnLabel,
      }),
      sortDescendingLabel: t('admin.orders.table.sortDescending', {
        column: columnLabel,
      }),
    }),
    [t],
  );

  return (
    <>
      {selectedCount > 0 ? (
        <section className={cn(dashboardPanelClass, 'p-3 md:p-4')}>
          <OrdersBulkActionsBar
            selectedCount={selectedCount}
            onClearSelection={clearSelection}
            onChangeOrderStatus={() => setBulkDialog('changeStatus')}
            onRegisterTracking={() => setBulkDialog('registerTracking')}
            onMarkAsShipped={() => setBulkDialog('markShipped')}
            onExport={() => setBulkDialog('export')}
            onPrintDocument={() => setBulkDialog('print')}
          />
        </section>
      ) : null}

      <ChangeOrderStatusDialog
        open={bulkDialog === 'changeStatus'}
        selectedCount={selectedCount}
        onClose={() => setBulkDialog(null)}
      />
      <RegisterTrackingDialog
        open={bulkDialog === 'registerTracking'}
        selectedCount={selectedCount}
        onClose={() => setBulkDialog(null)}
      />
      <MarkShippedDialog
        open={bulkDialog === 'markShipped'}
        selectedCount={selectedCount}
        onClose={() => setBulkDialog(null)}
      />
      <ExportOrdersDialog
        open={bulkDialog === 'export'}
        selectedCount={selectedCount}
        onClose={() => setBulkDialog(null)}
      />
      <PrintDocumentsDialog
        open={bulkDialog === 'print'}
        selectedCount={selectedCount}
        onClose={() => setBulkDialog(null)}
      />
      <DeleteOrderDialog
        open={deleteOrderTarget != null}
        orderNumber={deleteOrderTarget?.orderNumber ?? null}
        onClose={() => setDeleteOrderTarget(null)}
        onConfirm={() => {
          if (deleteOrderTarget) {
            setSelectedIds((previous) => {
              const next = new Set(previous);
              next.delete(deleteOrderTarget.id);
              return next;
            });
          }
        }}
      />

      <section className={cn(dashboardPanelClass, 'p-3 md:p-4')}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-[220px] shrink-0">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              resetPage();
            }}
            placeholder={t('admin.orders.table.searchPlaceholder')}
            className="h-8 w-full rounded-md border border-border/70 bg-background pr-3 pl-8 text-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="shrink-0 text-[11px] text-muted-foreground">
            {t('admin.orders.table.filterBy')}
          </span>

          <TableFilterSelect
            icon={<Calendar className="size-3" aria-hidden />}
            ariaLabel={t('admin.orders.filters.dateRange')}
            value={dateRange}
            onChange={(value) => {
              setDateRange(value as DateRangeFilter);
              resetPage();
            }}
          >
            <option value="all">{t('admin.orders.filters.dateRange')}</option>
            <option value="today">{t('admin.orders.filters.today')}</option>
            <option value="week">{t('admin.orders.filters.thisWeek')}</option>
            <option value="month">{t('admin.orders.filters.thisMonth')}</option>
          </TableFilterSelect>

          <TableFilterSelect
            icon={<ShoppingCart className="size-3" aria-hidden />}
            ariaLabel={t('admin.orders.filters.orderStatus')}
            value={orderStatusFilter}
            onChange={(value) => {
              setOrderStatusFilter(value as 'all' | OrderFulfillmentStatus);
              resetPage();
            }}
          >
            <option value="all">{t('admin.orders.filters.orderStatus')}</option>
            <option value="pending">{t('admin.orders.orderStatus.pending')}</option>
            <option value="confirmed">{t('admin.orders.orderStatus.confirmed')}</option>
            <option value="shipped">{t('admin.orders.orderStatus.shipped')}</option>
            <option value="cancelled">{t('admin.orders.orderStatus.cancelled')}</option>
          </TableFilterSelect>

          <TableFilterSelect
            icon={<DollarSign className="size-3" aria-hidden />}
            ariaLabel={t('admin.orders.filters.paymentStatus')}
            value={paymentStatusFilter}
            onChange={(value) => {
              setPaymentStatusFilter(value as 'all' | OrderPaymentStatus);
              resetPage();
            }}
          >
            <option value="all">{t('admin.orders.filters.paymentStatus')}</option>
            <option value="paid">{t('admin.orders.paymentStatus.paid')}</option>
            <option value="failed">{t('admin.orders.paymentStatus.failed')}</option>
            <option value="pending">{t('admin.orders.paymentStatus.pending')}</option>
            <option value="refunded">{t('admin.orders.paymentStatus.refunded')}</option>
          </TableFilterSelect>

          <TableFilterSelect
            icon={<Truck className="size-3" aria-hidden />}
            ariaLabel={t('admin.orders.filters.shippingStatus')}
            value={shippingStatusFilter}
            onChange={(value) => {
              setShippingStatusFilter(value as 'all' | OrderShippingStatus);
              resetPage();
            }}
          >
            <option value="all">{t('admin.orders.filters.shippingStatus')}</option>
            <option value="pending">{t('admin.orders.shippingStatus.pending')}</option>
            <option value="shipped">{t('admin.orders.shippingStatus.shipped')}</option>
            <option value="returned">{t('admin.orders.shippingStatus.returned')}</option>
          </TableFilterSelect>

          <TableFilterSelect
            icon={<Globe className="size-3" aria-hidden />}
            ariaLabel={t('admin.orders.filters.country')}
            value={countryFilter}
            onChange={(value) => {
              setCountryFilter(value);
              resetPage();
            }}
          >
            <option value="all">{t('admin.orders.filters.country')}</option>
            {countryOptions.map(([code, key]) => (
              <option key={code} value={code}>
                {t(key)}
              </option>
            ))}
          </TableFilterSelect>

          <TableFilterSelect
            icon={<Package className="size-3" aria-hidden />}
            ariaLabel={t('admin.orders.filters.product')}
            value={productFilter}
            onChange={(value) => {
              setProductFilter(value);
              resetPage();
            }}
          >
            <option value="all">{t('admin.orders.filters.product')}</option>
            {productOptions.map(([slug, name]) => (
              <option key={slug} value={slug}>
                {name}
              </option>
            ))}
          </TableFilterSelect>

          <TableFilterSelect
            icon={<ShieldCheck className="size-3" aria-hidden />}
            ariaLabel={t('admin.orders.filters.trackingStatus')}
            selectClassName="w-[10.75rem]"
            value={trackingFilter}
            onChange={(value) => {
              setTrackingFilter(value as TrackingFilter);
              resetPage();
            }}
          >
            <option value="all">{t('admin.orders.filters.trackingStatus')}</option>
            <option value="registered">{t('admin.orders.filters.trackingRegistered')}</option>
            <option value="missing">{t('admin.orders.filters.trackingMissing')}</option>
          </TableFilterSelect>
        </div>
      </div>

      <div className="-mx-4 overflow-x-auto md:-mx-5">
        <table className="w-full min-w-[1180px] table-fixed text-xs">
          <colgroup>
            <col className="w-[3%]" />
            <col className="w-[7%]" />
            <col className="w-[9%]" />
            <col className="w-[8%]" />
            <col className="w-[6%]" />
            <col className="w-[11%]" />
            <col className="w-[4%]" />
            <col className="w-[6%]" />
            <col className="w-[7%]" />
            <col className="w-[7%]" />
            <col className="w-[7%]" />
            <col className="w-[11%]" />
            <col className="w-[14%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-border/60 bg-muted/30 text-left text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              <th className={cn('w-9', tableEdgeCellClass.first)}>
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  onChange={toggleSelectAll}
                  aria-label={t('admin.orders.table.selectAll')}
                  className="size-3 rounded border-border accent-primary"
                />
              </th>
              <th className={tableEdgeCellClass.middle}>
                <SortableHeaderButton
                  label={t('admin.orders.columns.orderNumber')}
                  column="orderNumber"
                  activeColumn={sort?.column ?? null}
                  direction={sort?.direction ?? 'asc'}
                  onSort={handleSort}
                  {...sortLabelFor(t('admin.orders.columns.orderNumber'))}
                />
              </th>
              <th className={tableEdgeCellClass.middle}>
                <SortableHeaderButton
                  label={t('admin.orders.columns.orderDate')}
                  column="orderDate"
                  activeColumn={sort?.column ?? null}
                  direction={sort?.direction ?? 'asc'}
                  onSort={handleSort}
                  {...sortLabelFor(t('admin.orders.columns.orderDate'))}
                />
              </th>
              <th className={tableEdgeCellClass.middle}>
                <SortableHeaderButton
                  label={t('admin.orders.columns.customer')}
                  column="customer"
                  activeColumn={sort?.column ?? null}
                  direction={sort?.direction ?? 'asc'}
                  onSort={handleSort}
                  {...sortLabelFor(t('admin.orders.columns.customer'))}
                />
              </th>
              <th className={tableEdgeCellClass.middle}>
                <SortableHeaderButton
                  label={t('admin.orders.columns.country')}
                  column="country"
                  activeColumn={sort?.column ?? null}
                  direction={sort?.direction ?? 'asc'}
                  onSort={handleSort}
                  {...sortLabelFor(t('admin.orders.columns.country'))}
                />
              </th>
              <th className={tableEdgeCellClass.middle}>
                <SortableHeaderButton
                  label={t('admin.orders.columns.product')}
                  column="product"
                  activeColumn={sort?.column ?? null}
                  direction={sort?.direction ?? 'asc'}
                  onSort={handleSort}
                  {...sortLabelFor(t('admin.orders.columns.product'))}
                />
              </th>
              <th className={tableEdgeCellClass.middle}>
                <SortableHeaderButton
                  label={t('admin.orders.columns.quantity')}
                  column="quantity"
                  activeColumn={sort?.column ?? null}
                  direction={sort?.direction ?? 'asc'}
                  onSort={handleSort}
                  {...sortLabelFor(t('admin.orders.columns.quantity'))}
                />
              </th>
              <th className={tableEdgeCellClass.middle}>
                <SortableHeaderButton
                  label={t('admin.orders.columns.paymentAmount')}
                  column="paymentAmount"
                  activeColumn={sort?.column ?? null}
                  direction={sort?.direction ?? 'asc'}
                  onSort={handleSort}
                  {...sortLabelFor(t('admin.orders.columns.paymentAmount'))}
                />
              </th>
              <th className={tableEdgeCellClass.middle}>
                <SortableHeaderButton
                  label={t('admin.orders.columns.paymentStatus')}
                  column="paymentStatus"
                  activeColumn={sort?.column ?? null}
                  direction={sort?.direction ?? 'asc'}
                  onSort={handleSort}
                  {...sortLabelFor(t('admin.orders.columns.paymentStatus'))}
                />
              </th>
              <th className={tableEdgeCellClass.middle}>
                <SortableHeaderButton
                  label={t('admin.orders.columns.orderStatus')}
                  column="orderStatus"
                  activeColumn={sort?.column ?? null}
                  direction={sort?.direction ?? 'asc'}
                  onSort={handleSort}
                  {...sortLabelFor(t('admin.orders.columns.orderStatus'))}
                />
              </th>
              <th className={tableEdgeCellClass.middle}>
                <SortableHeaderButton
                  label={t('admin.orders.columns.shippingStatus')}
                  column="shippingStatus"
                  activeColumn={sort?.column ?? null}
                  direction={sort?.direction ?? 'asc'}
                  onSort={handleSort}
                  {...sortLabelFor(t('admin.orders.columns.shippingStatus'))}
                />
              </th>
              <th className={cn(tableEdgeCellClass.middle, 'whitespace-nowrap')}>
                <SortableHeaderButton
                  label={t('admin.orders.columns.trackingNumber')}
                  column="trackingNumber"
                  activeColumn={sort?.column ?? null}
                  direction={sort?.direction ?? 'asc'}
                  onSort={handleSort}
                  {...sortLabelFor(t('admin.orders.columns.trackingNumber'))}
                />
              </th>
              <th className={cn(tableEdgeCellClass.last, 'whitespace-nowrap')}>
                {t('admin.orders.columns.actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td
                  colSpan={13}
                  className="px-3 py-6 text-center text-muted-foreground"
                >
                  {t('admin.orders.table.empty')}
                </td>
              </tr>
            ) : (
              pageItems.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  selected={selectedIds.has(order.id)}
                  onToggleSelect={toggleSelect}
                  onDelete={() =>
                    setDeleteOrderTarget({
                      id: order.id,
                      orderNumber: order.orderNumber,
                    })
                  }
                  formatPrice={formatPrice}
                  t={t}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <TablePagination
        className="mt-3 border-t border-border/60 pt-3"
        showingFrom={showingFrom}
        showingTo={showingTo}
        total={total}
        currentPage={currentPage}
        totalPages={totalPages}
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        onPageChange={setPage}
        itemLabel={t('admin.orders.pagination.itemLabel')}
      />
      </section>
    </>
  );
}

function OrderRow({
  order,
  selected,
  onToggleSelect,
  onDelete,
  formatPrice,
  t,
}: {
  order: OrderListRow;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onDelete: () => void;
  formatPrice: (priceCents: number, currency?: string) => string;
  t: (key: string, values?: Record<string, string | number>) => string;
}) {
  const router = useRouter();
  const detailHref = `/orders/${order.id}`;

  const openDetail = useCallback(() => {
    router.push(detailHref);
  }, [detailHref, router]);

  const stopRowNavigation = useCallback((event: React.MouseEvent | React.KeyboardEvent) => {
    event.stopPropagation();
  }, []);

  return (
    <tr
      className="cursor-pointer border-b border-border/40 last:border-0 hover:bg-muted/15"
      onClick={openDetail}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openDetail();
        }
      }}
      tabIndex={0}
      role="link"
      aria-label={t('admin.orders.actions.view')}
    >
      <td className={tableEdgeCellClass.first} onClick={stopRowNavigation} onKeyDown={stopRowNavigation}>
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(order.id)}
          aria-label={t('admin.orders.table.selectOrder', {
            orderNumber: order.orderNumber,
          })}
          className="size-3 cursor-pointer rounded border-border accent-primary"
        />
      </td>
      <td className={cn(tableEdgeCellClass.middle, 'font-medium text-foreground')}>
        {order.orderNumber}
      </td>
      <td className={cn(tableEdgeCellClass.middle, 'whitespace-nowrap text-muted-foreground')}>
        <span>{order.orderDate}</span>{' '}
        <span className="text-[11px]">{order.orderTime}</span>
      </td>
      <td className={cn(tableEdgeCellClass.middle, 'text-foreground')}>{order.customerName}</td>
      <td className={tableEdgeCellClass.middle}>
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <span aria-hidden>{countryFlagEmoji(order.countryCode)}</span>
          <span>{t(order.countryKey)}</span>
        </span>
      </td>
      <td className={tableEdgeCellClass.middle}>
        <div className="flex items-center gap-2.5">
          <OrderProductThumbnail name={order.productName} slug={order.productSlug} />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold leading-tight text-foreground">
              {order.productName}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {t('admin.products.byBrand', { brand: order.productBrand })}
            </p>
          </div>
        </div>
      </td>
      <td className={cn(tableEdgeCellClass.middle, 'text-muted-foreground')}>{order.quantity}</td>
      <td className={cn(tableEdgeCellClass.middle, 'text-muted-foreground')}>
        {formatPrice(order.paymentAmountCents)}
      </td>
      <td className={tableEdgeCellClass.middle}>
        <StatusBadge
          label={t(paymentStatusLabelKey(order.paymentStatus))}
          tone={paymentStatusTone(order.paymentStatus)}
        />
      </td>
      <td className={tableEdgeCellClass.middle}>
        <StatusBadge
          label={t(orderStatusLabelKey(order.orderStatus))}
          tone={orderStatusTone(order.orderStatus)}
        />
      </td>
      <td className={tableEdgeCellClass.middle}>
        <StatusBadge
          label={t(shippingStatusLabelKey(order.shippingStatus))}
          tone={shippingStatusTone(order.shippingStatus)}
        />
      </td>
      <td className={cn(tableEdgeCellClass.middle, 'whitespace-nowrap text-muted-foreground')}>
        {order.trackingNumber ?? t('admin.orders.table.noTracking')}
      </td>
      <td
        className={tableEdgeCellClass.last}
        onClick={stopRowNavigation}
        onKeyDown={stopRowNavigation}
      >
        <div className="flex items-center justify-end gap-1">
          <Link
            href={detailHref}
            aria-label={t('admin.orders.actions.view')}
            className={cn(
              'inline-flex size-6 items-center justify-center rounded-full border border-border/70 bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
            )}
            onClick={stopRowNavigation}
          >
            <Eye className="size-3" />
          </Link>
          <TableActionButton label={t('admin.orders.actions.delete')} destructive onClick={onDelete}>
            <Trash2 className="size-3" />
          </TableActionButton>
        </div>
      </td>
    </tr>
  );
}

export const OrdersTablePanel = memo(OrdersTablePanelComponent);
