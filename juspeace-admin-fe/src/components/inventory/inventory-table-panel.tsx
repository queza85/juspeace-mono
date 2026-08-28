'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Eye,
  LayoutGrid,
  RefreshCw,
  Search,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { TableFilterSelect } from '@/components/table/table-page-size-select';
import { TablePagination } from '@/components/table/table-pagination';
import { useClientPaginatedItems } from '@/lib/hooks/use-pagination';
import { useT } from '@/lib/i18n/locale-context';
import {
  formatInventoryQuantity,
  matchesInventorySearch,
  matchesStockStatusFilter,
  matchesVariationFilter,
  sortInventoryRows,
  type InventorySortColumn,
} from '@/lib/inventory/inventory-display';
import {
  inventoryListRows,
  stockStatusLabelKey,
  stockStatusTone,
  type InventoryListRow,
  type InventoryStockStatus,
} from '@/lib/inventory/mock-data';
import { getProductImageSrc } from '@/lib/products/product-display';
import {
  cycleTableSort,
  type SortDirection,
  type TableSortState,
} from '@/lib/table';
import { cn } from '@/lib/utils';

const inventoryPanelClass =
  'rounded-lg border border-border/60 bg-card shadow-sm';

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
  column: InventorySortColumn;
  activeColumn: InventorySortColumn | null;
  direction: SortDirection;
  onSort: (column: InventorySortColumn) => void;
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

function InventoryProductThumbnail({
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

function InventoryTablePanelComponent() {
  const t = useT();

  const [search, setSearch] = useState('');
  const [variationFilter, setVariationFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | InventoryStockStatus>(
    'all',
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<TableSortState<InventorySortColumn>>(null);

  const variationOptions = useMemo(() => {
    const variations = new Map<string, string>();
    for (const row of inventoryListRows) {
      variations.set(row.variationKey, row.variation);
    }
    return Array.from(variations.entries());
  }, []);

  const filteredRows = useMemo(() => {
    return inventoryListRows.filter((row) => {
      if (!matchesInventorySearch(row, search)) {
        return false;
      }
      if (!matchesVariationFilter(row, variationFilter)) {
        return false;
      }
      if (!matchesStockStatusFilter(row, stockStatusFilter)) {
        return false;
      }
      return true;
    });
  }, [search, stockStatusFilter, variationFilter]);

  const sortedRows = useMemo(() => {
    if (!sort) {
      return filteredRows;
    }

    return sortInventoryRows(filteredRows, sort.column, sort.direction);
  }, [filteredRows, sort]);

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
  } = useClientPaginatedItems(sortedRows, 12);

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

  const handleSort = useCallback(
    (column: InventorySortColumn) => {
      setSort((current) => cycleTableSort(current, column));
      resetPage();
    },
    [resetPage],
  );

  const sortLabelFor = useCallback(
    (columnLabel: string) => ({
      sortLabel: t('admin.inventory.table.sortBy', { column: columnLabel }),
      sortAscendingLabel: t('admin.inventory.table.sortAscending', {
        column: columnLabel,
      }),
      sortDescendingLabel: t('admin.inventory.table.sortDescending', {
        column: columnLabel,
      }),
    }),
    [t],
  );

  return (
    <section className={cn(inventoryPanelClass, 'p-3 md:p-4')}>
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
            placeholder={t('admin.inventory.table.searchPlaceholder')}
            className="h-8 w-full rounded-md border border-border/70 bg-background pr-3 pl-8 text-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="shrink-0 text-[11px] text-muted-foreground">
            {t('admin.inventory.table.filterBy')}
          </span>

          <TableFilterSelect
            icon={<LayoutGrid className="size-3" aria-hidden />}
            ariaLabel={t('admin.inventory.filters.variation')}
            value={variationFilter}
            onChange={(value) => {
              setVariationFilter(value);
              resetPage();
            }}
          >
            <option value="all">{t('admin.inventory.filters.variation')}</option>
            {variationOptions.map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </TableFilterSelect>

          <TableFilterSelect
            icon={<RefreshCw className="size-3" aria-hidden />}
            ariaLabel={t('admin.inventory.filters.stockStatus')}
            value={stockStatusFilter}
            onChange={(value) => {
              setStockStatusFilter(value as 'all' | InventoryStockStatus);
              resetPage();
            }}
          >
            <option value="all">{t('admin.inventory.filters.stockStatus')}</option>
            <option value="in_stock">{t('admin.inventory.stockStatus.in_stock')}</option>
            <option value="low_stock">{t('admin.inventory.stockStatus.low_stock')}</option>
            <option value="sold_out">{t('admin.inventory.stockStatus.sold_out')}</option>
          </TableFilterSelect>
        </div>
      </div>

      <div className="-mx-4 overflow-x-auto md:-mx-5">
        <table className="w-full min-w-[1120px] table-fixed text-xs">
          <colgroup>
            <col className="w-[3%]" />
            <col className="w-[16%]" />
            <col className="w-[10%]" />
            <col className="w-[8%]" />
            <col className="w-[8%]" />
            <col className="w-[9%]" />
            <col className="w-[9%]" />
            <col className="w-[8%]" />
            <col className="w-[10%]" />
            <col className="w-[9%]" />
            <col className="w-[10%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-border/60 bg-muted/30 text-left text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              <th className={cn('w-9', tableEdgeCellClass.first)}>
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  onChange={toggleSelectAll}
                  aria-label={t('admin.inventory.table.selectAll')}
                  className="size-3 rounded border-border accent-primary"
                />
              </th>
              <th className={tableEdgeCellClass.middle}>
                <SortableHeaderButton
                  label={t('admin.inventory.columns.product')}
                  column="product"
                  activeColumn={sort?.column ?? null}
                  direction={sort?.direction ?? 'asc'}
                  onSort={handleSort}
                  {...sortLabelFor(t('admin.inventory.columns.product'))}
                />
              </th>
              <th className={tableEdgeCellClass.middle}>
                <SortableHeaderButton
                  label={t('admin.inventory.columns.variation')}
                  column="variation"
                  activeColumn={sort?.column ?? null}
                  direction={sort?.direction ?? 'asc'}
                  onSort={handleSort}
                  {...sortLabelFor(t('admin.inventory.columns.variation'))}
                />
              </th>
              <th className={tableEdgeCellClass.middle}>
                <SortableHeaderButton
                  label={t('admin.inventory.columns.sku')}
                  column="sku"
                  activeColumn={sort?.column ?? null}
                  direction={sort?.direction ?? 'asc'}
                  onSort={handleSort}
                  {...sortLabelFor(t('admin.inventory.columns.sku'))}
                />
              </th>
              <th className={tableEdgeCellClass.middle}>
                <SortableHeaderButton
                  label={t('admin.inventory.columns.initialStock')}
                  column="initialStock"
                  activeColumn={sort?.column ?? null}
                  direction={sort?.direction ?? 'asc'}
                  onSort={handleSort}
                  {...sortLabelFor(t('admin.inventory.columns.initialStock'))}
                />
              </th>
              <th className={tableEdgeCellClass.middle}>
                <SortableHeaderButton
                  label={t('admin.inventory.columns.availableStock')}
                  column="availableStock"
                  activeColumn={sort?.column ?? null}
                  direction={sort?.direction ?? 'asc'}
                  onSort={handleSort}
                  {...sortLabelFor(t('admin.inventory.columns.availableStock'))}
                />
              </th>
              <th className={tableEdgeCellClass.middle}>
                <SortableHeaderButton
                  label={t('admin.inventory.columns.reservedStock')}
                  column="reservedStock"
                  activeColumn={sort?.column ?? null}
                  direction={sort?.direction ?? 'asc'}
                  onSort={handleSort}
                  {...sortLabelFor(t('admin.inventory.columns.reservedStock'))}
                />
              </th>
              <th className={tableEdgeCellClass.middle}>
                <SortableHeaderButton
                  label={t('admin.inventory.columns.soldQuantity')}
                  column="soldQuantity"
                  activeColumn={sort?.column ?? null}
                  direction={sort?.direction ?? 'asc'}
                  onSort={handleSort}
                  {...sortLabelFor(t('admin.inventory.columns.soldQuantity'))}
                />
              </th>
              <th className={cn(tableEdgeCellClass.middle, 'whitespace-nowrap')}>
                <SortableHeaderButton
                  label={t('admin.inventory.columns.cancelledReturned')}
                  column="cancelledReturned"
                  activeColumn={sort?.column ?? null}
                  direction={sort?.direction ?? 'asc'}
                  onSort={handleSort}
                  {...sortLabelFor(t('admin.inventory.columns.cancelledReturned'))}
                />
              </th>
              <th className={tableEdgeCellClass.middle}>
                <SortableHeaderButton
                  label={t('admin.inventory.columns.stockStatus')}
                  column="stockStatus"
                  activeColumn={sort?.column ?? null}
                  direction={sort?.direction ?? 'asc'}
                  onSort={handleSort}
                  {...sortLabelFor(t('admin.inventory.columns.stockStatus'))}
                />
              </th>
              <th className={cn(tableEdgeCellClass.last, 'whitespace-nowrap')}>
                {t('admin.inventory.columns.actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td
                  colSpan={11}
                  className="px-3 py-6 text-center text-muted-foreground"
                >
                  {t('admin.inventory.table.empty')}
                </td>
              </tr>
            ) : (
              pageItems.map((row) => (
                <InventoryRow
                  key={row.id}
                  row={row}
                  selected={selectedIds.has(row.id)}
                  onToggleSelect={toggleSelect}
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
        itemLabel={t('admin.inventory.pagination.itemLabel')}
      />
    </section>
  );
}

function InventoryRow({
  row,
  selected,
  onToggleSelect,
  t,
}: {
  row: InventoryListRow;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
}) {
  const router = useRouter();
  const detailHref = `/inventory/${row.id}`;

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
      aria-label={t('admin.inventory.actions.view')}
    >
      <td className={tableEdgeCellClass.first} onClick={stopRowNavigation} onKeyDown={stopRowNavigation}>
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(row.id)}
          aria-label={t('admin.inventory.table.selectItem', {
            name: row.productName,
          })}
          className="size-3 cursor-pointer rounded border-border accent-primary"
        />
      </td>
      <td className={tableEdgeCellClass.middle}>
        <div className="flex items-center gap-2.5">
          <InventoryProductThumbnail name={row.productName} slug={row.productSlug} />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold leading-tight text-foreground">
              {row.productName}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {t('admin.products.byBrand', { brand: row.productBrand })}
            </p>
          </div>
        </div>
      </td>
      <td className={cn(tableEdgeCellClass.middle, 'text-muted-foreground')}>
        {row.variation}
      </td>
      <td className={cn(tableEdgeCellClass.middle, 'text-muted-foreground')}>{row.sku}</td>
      <td className={cn(tableEdgeCellClass.middle, 'text-muted-foreground')}>
        {row.initialStock}
      </td>
      <td className={cn(tableEdgeCellClass.middle, 'text-muted-foreground')}>
        {row.availableStock}
      </td>
      <td className={cn(tableEdgeCellClass.middle, 'text-muted-foreground')}>
        {row.reservedStock}
      </td>
      <td className={cn(tableEdgeCellClass.middle, 'text-muted-foreground')}>
        {formatInventoryQuantity(row.soldQuantity)}
      </td>
      <td className={cn(tableEdgeCellClass.middle, 'text-muted-foreground')}>
        {formatInventoryQuantity(row.cancelledReturned)}
      </td>
      <td className={tableEdgeCellClass.middle}>
        <StatusBadge
          label={t(stockStatusLabelKey(row.stockStatus))}
          tone={stockStatusTone(row.stockStatus)}
        />
      </td>
      <td
        className={tableEdgeCellClass.last}
        onClick={stopRowNavigation}
        onKeyDown={stopRowNavigation}
      >
        <div className="flex items-center justify-end">
          <Link
            href={detailHref}
            aria-label={t('admin.inventory.actions.view')}
            className="inline-flex size-6 items-center justify-center rounded-full border border-border/70 bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={stopRowNavigation}
          >
            <Eye className="size-3" />
          </Link>
        </div>
      </td>
    </tr>
  );
}

export const InventoryTablePanel = memo(InventoryTablePanelComponent);
