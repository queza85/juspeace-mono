'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Lock,
  Search,
  SlidersHorizontal,
  SquareArrowOutUpRight,
  TrendingDown,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { InventoryDetailBreadcrumbs } from '@/components/inventory/inventory-detail-breadcrumbs';
import {
  InventoryDetailDialogs,
  type InventoryDetailDialogType,
} from '@/components/inventory/inventory-detail-dialogs';
import { TableFilterSelect } from '@/components/table/table-page-size-select';
import { TablePagination } from '@/components/table/table-pagination';
import { useClientPaginatedItems } from '@/lib/hooks/use-pagination';
import { useT } from '@/lib/i18n/locale-context';
import { formatInventoryQuantity } from '@/lib/inventory/inventory-display';
import type { InventoryDetail } from '@/lib/inventory/inventory-detail-mock';
import {
  getInventoryDetailById,
  stockHistoryActionLabelKey,
  type StockHistoryAction,
  type StockHistoryRow,
} from '@/lib/inventory/inventory-detail-mock';
import {
  stockStatusLabelKey,
} from '@/lib/inventory/mock-data';
import { getProductImageSrc } from '@/lib/products/product-display';
import {
  cycleTableSort,
  type SortDirection,
  type TableSortState,
} from '@/lib/table';
import { cn } from '@/lib/utils';

const detailCardClass =
  'overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-sm';

const backLinkCardClass =
  'overflow-hidden rounded-lg border border-border/60 bg-card shadow-none';

const tableEdgeCellClass = {
  first: 'py-2.5 pr-3 pl-4 md:pl-5',
  middle: 'px-3 py-2.5',
  last: 'py-2.5 pr-4 pl-3 md:pr-5',
} as const;

type HistorySortColumn =
  | 'date'
  | 'action'
  | 'quantity'
  | 'before'
  | 'after'
  | 'reason';

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
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 first:pt-0 last:pb-0">
      <span className="shrink-0 text-[12px] leading-snug text-[#9ca3af]">{label}</span>
      <span className="max-w-[58%] text-right text-[12px] font-semibold leading-snug text-[#1f2937]">
        {value}
      </span>
    </div>
  );
}

const inventoryStockStatusStyles = {
  in_stock: 'bg-emerald-50 text-emerald-600',
  low_stock: 'bg-amber-50 text-amber-600',
  sold_out: 'bg-red-50 text-red-600',
} as const;

function InventoryStockStatusBadge({
  label,
  status,
}: {
  label: string;
  status: InventoryDetail['stockStatus'];
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
        inventoryStockStatusStyles[status],
      )}
    >
      {label}
    </span>
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
  column: HistorySortColumn;
  activeColumn: HistorySortColumn | null;
  direction: SortDirection;
  onSort: (column: HistorySortColumn) => void;
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

function formatQuantityDelta(value: number): string {
  if (value > 0) {
    return `+${value}`;
  }

  return String(value);
}

function matchesHistorySearch(row: StockHistoryRow, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  return (
    row.date.toLowerCase().includes(normalized) ||
    row.reason.toLowerCase().includes(normalized) ||
    String(row.quantityDelta).includes(normalized)
  );
}

function matchesHistoryActionFilter(
  row: StockHistoryRow,
  filter: 'all' | StockHistoryAction,
): boolean {
  if (filter === 'all') {
    return true;
  }

  return row.action === filter;
}

function sortHistoryRows(
  rows: StockHistoryRow[],
  column: HistorySortColumn,
  direction: SortDirection,
): StockHistoryRow[] {
  const sorted = [...rows];

  sorted.sort((left, right) => {
    let result = 0;

    switch (column) {
      case 'date':
        result = `${left.date} ${left.time}`.localeCompare(`${right.date} ${right.time}`);
        break;
      case 'action':
        result = left.action.localeCompare(right.action);
        break;
      case 'quantity':
        result = left.quantityDelta - right.quantityDelta;
        break;
      case 'before':
        result = left.quantityBefore - right.quantityBefore;
        break;
      case 'after':
        result = left.quantityAfter - right.quantityAfter;
        break;
      case 'reason':
        result = left.reason.localeCompare(right.reason);
        break;
      default:
        break;
    }

    return direction === 'asc' ? result : -result;
  });

  return sorted;
}

function InventoryDetailActionsBar({
  onAdjustStock,
  onMarkSoldOut,
  onSetThreshold,
  onExport,
}: {
  onAdjustStock: () => void;
  onMarkSoldOut: () => void;
  onSetThreshold: () => void;
  onExport: () => void;
}) {
  const t = useT();

  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      <DetailActionButton
        label={t('admin.inventory.detail.actions.adjustStock')}
        icon={SlidersHorizontal}
        className="bg-[#5d3e9e] hover:bg-[#5d3e9e]/90"
        onClick={onAdjustStock}
      />
      <DetailActionButton
        label={t('admin.inventory.detail.actions.markSoldOut')}
        icon={Lock}
        className="bg-[#5d3e9e] hover:bg-[#5d3e9e]/90"
        onClick={onMarkSoldOut}
      />
      <DetailActionButton
        label={t('admin.inventory.detail.actions.setLowStockThreshold')}
        icon={TrendingDown}
        className="bg-[#5d3e9e] hover:bg-[#5d3e9e]/90"
        onClick={onSetThreshold}
      />
      <DetailActionButton
        label={t('admin.inventory.detail.actions.exportData')}
        icon={SquareArrowOutUpRight}
        className="bg-[#14b8a6] hover:bg-[#14b8a6]/90"
        onClick={onExport}
      />
    </div>
  );
}

function InventoryProductSummary({ detail }: { detail: InventoryDetail }) {
  const t = useT();
  const productImageSrc = getProductImageSrc(detail.productSlug);

  return (
    <DetailCard title={t('admin.inventory.detail.sections.productSummary')}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <div className="size-[7.5rem] shrink-0 overflow-hidden rounded-lg border border-[#e5e7eb] bg-[#f9fafb]">
          {productImageSrc ? (
            <Image
              src={productImageSrc}
              alt={detail.productName}
              width={120}
              height={120}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-[11px] text-muted-foreground">
              {t('admin.inventory.detail.noImage')}
            </div>
          )}
        </div>

        <div className="grid min-w-0 flex-1 gap-4 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-[#e5e7eb]">
          <div className="sm:pr-6">
            <DetailRow
              label={t('admin.inventory.detail.fields.productName')}
              value={detail.productName}
            />
            <DetailRow
              label={t('admin.inventory.detail.fields.productVariation')}
              value={detail.variation}
            />
            <DetailRow label={t('admin.inventory.detail.fields.sku')} value={detail.sku} />
          </div>

          <div className="sm:px-6">
            <DetailRow
              label={t('admin.inventory.detail.fields.initialStock')}
              value={detail.initialStock}
            />
            <DetailRow
              label={t('admin.inventory.detail.fields.availableStock')}
              value={detail.availableStock}
            />
            <DetailRow
              label={t('admin.inventory.detail.fields.reservedStock')}
              value={detail.reservedStock}
            />
          </div>

          <div className="sm:pl-6">
            <DetailRow
              label={t('admin.inventory.detail.fields.soldQuantity')}
              value={formatInventoryQuantity(detail.soldQuantity)}
            />
            <DetailRow
              label={t('admin.inventory.detail.fields.cancelledReturnedQuantity')}
              value={formatInventoryQuantity(detail.cancelledReturned)}
            />
            <DetailRow
              label={t('admin.inventory.detail.fields.stockStatus')}
              value={
                <InventoryStockStatusBadge
                  label={t(stockStatusLabelKey(detail.stockStatus))}
                  status={detail.stockStatus}
                />
              }
            />
          </div>
        </div>
      </div>
    </DetailCard>
  );
}

function InventoryStockHistoryPanel({ history }: { history: StockHistoryRow[] }) {
  const t = useT();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<'all' | StockHistoryAction>('all');
  const [sort, setSort] = useState<TableSortState<HistorySortColumn>>(null);

  const filteredHistory = useMemo(() => {
    return history.filter((row) => {
      if (!matchesHistorySearch(row, search)) {
        return false;
      }
      if (!matchesHistoryActionFilter(row, actionFilter)) {
        return false;
      }
      return true;
    });
  }, [actionFilter, history, search]);

  const sortedHistory = useMemo(() => {
    if (!sort) {
      return filteredHistory;
    }

    return sortHistoryRows(filteredHistory, sort.column, sort.direction);
  }, [filteredHistory, sort]);

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
  } = useClientPaginatedItems(sortedHistory, 12);

  const handleSort = useCallback(
    (column: HistorySortColumn) => {
      setSort((current) => cycleTableSort(current, column));
      resetPage();
    },
    [resetPage],
  );

  const sortLabelFor = useCallback(
    (columnLabel: string) => ({
      sortLabel: t('admin.inventory.detail.history.sortBy', { column: columnLabel }),
      sortAscendingLabel: t('admin.inventory.detail.history.sortAscending', {
        column: columnLabel,
      }),
      sortDescendingLabel: t('admin.inventory.detail.history.sortDescending', {
        column: columnLabel,
      }),
    }),
    [t],
  );

  return (
    <DetailCard title={t('admin.inventory.detail.sections.stockHistory')}>
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
            placeholder={t('admin.inventory.detail.history.searchPlaceholder')}
            className="h-8 w-full rounded-md border border-border/70 bg-background pr-3 pl-8 text-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="shrink-0 text-[11px] text-muted-foreground">
            {t('admin.inventory.detail.history.filterBy')}
          </span>
          <TableFilterSelect
            icon={<SlidersHorizontal className="size-3" aria-hidden />}
            ariaLabel={t('admin.inventory.detail.history.filters.action')}
            value={actionFilter}
            onChange={(value) => {
              setActionFilter(value as 'all' | StockHistoryAction);
              resetPage();
            }}
          >
            <option value="all">{t('admin.inventory.detail.history.filters.action')}</option>
            <option value="stock_added">
              {t('admin.inventory.detail.history.actions.stock_added')}
            </option>
            <option value="sold">{t('admin.inventory.detail.history.actions.sold')}</option>
            <option value="returned">
              {t('admin.inventory.detail.history.actions.returned')}
            </option>
            <option value="reserved">
              {t('admin.inventory.detail.history.actions.reserved')}
            </option>
          </TableFilterSelect>
        </div>
      </div>

      <div className="-mx-4 overflow-x-auto md:-mx-5">
        <table className="w-full min-w-[760px] table-fixed text-xs">
          <colgroup>
            <col className="w-[22%]" />
            <col className="w-[16%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
            <col className="w-[26%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-border/60 bg-muted/30 text-left text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              <th className={tableEdgeCellClass.first}>
                <SortableHeaderButton
                  label={t('admin.inventory.detail.history.columns.date')}
                  column="date"
                  activeColumn={sort?.column ?? null}
                  direction={sort?.direction ?? 'asc'}
                  onSort={handleSort}
                  {...sortLabelFor(t('admin.inventory.detail.history.columns.date'))}
                />
              </th>
              <th className={tableEdgeCellClass.middle}>
                <SortableHeaderButton
                  label={t('admin.inventory.detail.history.columns.action')}
                  column="action"
                  activeColumn={sort?.column ?? null}
                  direction={sort?.direction ?? 'asc'}
                  onSort={handleSort}
                  {...sortLabelFor(t('admin.inventory.detail.history.columns.action'))}
                />
              </th>
              <th className={tableEdgeCellClass.middle}>
                <SortableHeaderButton
                  label={t('admin.inventory.detail.history.columns.quantity')}
                  column="quantity"
                  activeColumn={sort?.column ?? null}
                  direction={sort?.direction ?? 'asc'}
                  onSort={handleSort}
                  {...sortLabelFor(t('admin.inventory.detail.history.columns.quantity'))}
                />
              </th>
              <th className={tableEdgeCellClass.middle}>
                <SortableHeaderButton
                  label={t('admin.inventory.detail.history.columns.before')}
                  column="before"
                  activeColumn={sort?.column ?? null}
                  direction={sort?.direction ?? 'asc'}
                  onSort={handleSort}
                  {...sortLabelFor(t('admin.inventory.detail.history.columns.before'))}
                />
              </th>
              <th className={tableEdgeCellClass.middle}>
                <SortableHeaderButton
                  label={t('admin.inventory.detail.history.columns.after')}
                  column="after"
                  activeColumn={sort?.column ?? null}
                  direction={sort?.direction ?? 'asc'}
                  onSort={handleSort}
                  {...sortLabelFor(t('admin.inventory.detail.history.columns.after'))}
                />
              </th>
              <th className={tableEdgeCellClass.last}>
                <SortableHeaderButton
                  label={t('admin.inventory.detail.history.columns.reason')}
                  column="reason"
                  activeColumn={sort?.column ?? null}
                  direction={sort?.direction ?? 'asc'}
                  onSort={handleSort}
                  {...sortLabelFor(t('admin.inventory.detail.history.columns.reason'))}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                  {t('admin.inventory.detail.history.empty')}
                </td>
              </tr>
            ) : (
              pageItems.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border/40 last:border-0 hover:bg-muted/15"
                >
                  <td className={cn(tableEdgeCellClass.first, 'whitespace-nowrap text-muted-foreground')}>
                    <span>{row.date}</span>{' '}
                    <span className="text-[11px]">{row.time}</span>
                  </td>
                  <td className={cn(tableEdgeCellClass.middle, 'text-foreground')}>
                    {t(stockHistoryActionLabelKey(row.action))}
                  </td>
                  <td className={cn(tableEdgeCellClass.middle, 'font-medium text-foreground')}>
                    {formatQuantityDelta(row.quantityDelta)}
                  </td>
                  <td className={cn(tableEdgeCellClass.middle, 'text-muted-foreground')}>
                    {row.quantityBefore}
                  </td>
                  <td className={cn(tableEdgeCellClass.middle, 'text-muted-foreground')}>
                    {row.quantityAfter}
                  </td>
                  <td className={cn(tableEdgeCellClass.last, 'text-muted-foreground')}>
                    {row.reason}
                  </td>
                </tr>
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
        itemLabel={t('admin.inventory.detail.history.pagination.itemLabel')}
      />
    </DetailCard>
  );
}

function InventoryDetailContent({ detail }: { detail: InventoryDetail }) {
  const t = useT();
  const [activeDialog, setActiveDialog] = useState<InventoryDetailDialogType>(null);

  const closeDialog = useCallback(() => {
    setActiveDialog(null);
  }, []);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className={cn(backLinkCardClass, 'px-4 py-3 md:px-5')}>
        <Link
          href="/inventory"
          className="text-sm font-medium text-[#2563eb] underline underline-offset-2 transition-colors hover:text-[#1d4ed8]"
        >
          {t('admin.inventory.detail.backToInventory')}
        </Link>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-[15px] font-bold text-[#111827]">
          {t('admin.inventory.detail.heading')}
        </h2>
        <InventoryDetailActionsBar
          onAdjustStock={() => setActiveDialog('adjustStock')}
          onMarkSoldOut={() => setActiveDialog('markSoldOut')}
          onSetThreshold={() => setActiveDialog('setThreshold')}
          onExport={() => setActiveDialog('export')}
        />
      </div>

      <InventoryProductSummary detail={detail} />
      <InventoryStockHistoryPanel history={detail.stockHistory} />

      <InventoryDetailDialogs
        activeDialog={activeDialog}
        detail={detail}
        onClose={closeDialog}
      />
    </div>
  );
}

function InventoryDetailPageComponent({ id }: { id: string }) {
  const t = useT();
  const detail = getInventoryDetailById(id);

  return (
    <div className="-mx-4 -mt-4 flex min-h-full flex-col md:-mx-6 md:-mt-6">
      <header className="border-b border-border/60 bg-card px-4 py-3 md:px-6">
        <div className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center justify-between gap-3">
          <h1 className="text-sm font-bold tracking-[0.08em] text-[#111827] uppercase">
            {t('admin.inventory.detail.pageTitle')}
          </h1>
          <InventoryDetailBreadcrumbs />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 bg-[#f3f4f6] px-4 py-4 md:px-6 md:py-5">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4">
          {!detail ? (
            <div
              className={cn(
                detailCardClass,
                'px-4 py-8 text-center text-sm text-muted-foreground',
              )}
            >
              {t('admin.inventory.detail.notFound')}
            </div>
          ) : (
            <InventoryDetailContent detail={detail} />
          )}
        </div>
      </div>
    </div>
  );
}

export const InventoryDetailPage = memo(InventoryDetailPageComponent);
