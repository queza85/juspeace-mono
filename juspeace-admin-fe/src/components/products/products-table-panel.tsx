'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  DollarSign,
  Eye,
  Package,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { dashboardPanelClass } from '@/components/dashboard/dashboard-panel';
import { StatusBadge } from '@/components/dashboard/status-badge';
import {
  TableFilterSelect,
  TablePageSizeSelect,
} from '@/components/table/table-page-size-select';
import { TablePagination } from '@/components/table/table-pagination';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useClientPaginatedItems } from '@/lib/hooks/use-pagination';
import { listProducts } from '@/lib/api/products';
import type { Product, ProductStatus } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-context';
import { useFormatPrice, useLocale, useT } from '@/lib/i18n/locale-context';
import {
  formatProductSku,
  getMockOrderCount,
  getMockPublishedAt,
  getProductImageSrc,
  inferCategoryLabel,
  matchesPriceRange,
  matchesSearch,
  productStatusLabelKey,
  productStatusTone,
  sortProducts,
  type PriceRangeFilter,
  type ProductSortColumn,
} from '@/lib/products/product-display';
import { productKeys } from '@/lib/query/keys';
import {
  cycleTableSort,
  DEFAULT_TABLE_PAGE_SIZE,
  type SortDirection,
  type TableSortState,
} from '@/lib/table';
import { cn } from '@/lib/utils';

type StatusFilter = 'all' | ProductStatus;
type CategoryFilter = 'all' | 'essentials' | 'bracelet' | 'home' | 'general';

const categoryFilterMatches: Record<
  Exclude<CategoryFilter, 'all'>,
  (slug: string) => boolean
> = {
  essentials: (slug) =>
    slug.includes('tote') || slug.includes('bottle') || slug.includes('essential'),
  bracelet: (slug) =>
    slug.includes('bracelet') || slug.includes('commitment'),
  home: (slug) => slug.includes('candle') || slug.includes('home'),
  general: (slug) =>
    !slug.includes('tote') &&
    !slug.includes('bottle') &&
    !slug.includes('candle') &&
    !slug.includes('bracelet') &&
    !slug.includes('commitment'),
};

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
  column: ProductSortColumn;
  activeColumn: ProductSortColumn | null;
  direction: SortDirection;
  onSort: (column: ProductSortColumn) => void;
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

function TableActionButton({
  label,
  children,
  destructive = false,
  href,
}: {
  label: string;
  children: React.ReactNode;
  destructive?: boolean;
  href?: string;
}) {
  const className = cn(
    'inline-flex size-6 items-center justify-center rounded-full border border-border/70 bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
    destructive && 'hover:border-destructive/30 hover:text-destructive',
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-label={label}
        className={className}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      className={className}
      onClick={(event) => event.stopPropagation()}
    >
      {children}
    </button>
  );
}

function ProductThumbnail({
  name,
  slug,
  imageUrl,
}: {
  name: string;
  slug: string;
  imageUrl?: string | null;
}) {
  const src = getProductImageSrc(slug, imageUrl);

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

function ProductsTablePanelComponent() {
  const t = useT();
  const { locale } = useLocale();
  const formatPrice = useFormatPrice();
  const { accessToken } = useAuth();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [priceRange, setPriceRange] = useState<PriceRangeFilter>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<TableSortState<ProductSortColumn>>(null);

  const apiStatus: ProductStatus | undefined =
    statusFilter === 'all' ? 'ACTIVE' : statusFilter;

  const queryParams = useMemo(
    () => ({
      status: apiStatus,
      limit: 100,
      offset: 0,
    }),
    [apiStatus],
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: productKeys.list(queryParams),
    queryFn: () => listProducts(queryParams, accessToken ?? undefined),
  });

  const filteredProducts = useMemo(() => {
    const items = data?.items ?? [];

    return items.filter((product) => {
      if (!matchesSearch(product, search)) {
        return false;
      }

      if (!matchesPriceRange(product.priceCents, priceRange)) {
        return false;
      }

      if (categoryFilter !== 'all') {
        const matcher = categoryFilterMatches[categoryFilter];
        if (!matcher(product.slug)) {
          return false;
        }
      }

      return true;
    });
  }, [categoryFilter, data?.items, priceRange, search]);

  const sortedProducts = useMemo(() => {
    if (!sort) {
      return filteredProducts;
    }

    return sortProducts(filteredProducts, sort.column, sort.direction);
  }, [filteredProducts, sort]);

  const {
    pageItems,
    pageSize,
    setPage,
    setPageSize,
    resetPage,
    showingFrom,
    showingTo,
    total,
    currentPage,
    totalPages,
    hasPreviousPage,
    hasNextPage,
  } = useClientPaginatedItems(sortedProducts, DEFAULT_TABLE_PAGE_SIZE);

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
    (column: ProductSortColumn) => {
      setSort((current) => cycleTableSort(current, column));
      resetPage();
    },
    [resetPage],
  );

  const sortLabelFor = useCallback(
    (columnLabel: string) => ({
      sortLabel: t('admin.products.table.sortBy', { column: columnLabel }),
      sortAscendingLabel: t('admin.products.table.sortAscending', {
        column: columnLabel,
      }),
      sortDescendingLabel: t('admin.products.table.sortDescending', {
        column: columnLabel,
      }),
    }),
    [t],
  );

  return (
    <section className={cn(dashboardPanelClass, 'p-3 md:p-4')}>
      <div className="mb-3 flex items-center justify-between gap-3">
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
            placeholder={t('admin.products.table.searchPlaceholder')}
            className="h-8 w-full rounded-md border border-border/70 bg-background pr-3 pl-8 text-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="shrink-0 text-[11px] text-muted-foreground">
            {t('admin.products.table.filterBy')}
          </span>

          <TableFilterSelect
            icon={<Tag className="size-3" aria-hidden />}
            ariaLabel={t('admin.products.filters.category')}
            value={categoryFilter}
            onChange={(value) => {
              setCategoryFilter(value as CategoryFilter);
              resetPage();
            }}
          >
            <option value="all">{t('admin.products.filters.allCategories')}</option>
            <option value="essentials">
              {t('admin.products.filters.categories.essentials')}
            </option>
            <option value="bracelet">
              {t('admin.products.filters.categories.bracelet')}
            </option>
            <option value="home">{t('admin.products.filters.categories.home')}</option>
            <option value="general">
              {t('admin.products.filters.categories.general')}
            </option>
          </TableFilterSelect>

          <TableFilterSelect
            icon={<Package className="size-3" aria-hidden />}
            ariaLabel={t('admin.products.filters.status')}
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value as StatusFilter);
              resetPage();
            }}
          >
            <option value="all">{t('admin.products.filters.allStatuses')}</option>
            <option value="ACTIVE">{t('admin.products.status.ACTIVE')}</option>
            <option value="DRAFT">{t('admin.products.status.DRAFT')}</option>
            <option value="ARCHIVED">{t('admin.products.status.ARCHIVED')}</option>
          </TableFilterSelect>

          <TableFilterSelect
            icon={<DollarSign className="size-3" aria-hidden />}
            ariaLabel={t('admin.products.filters.priceRange')}
            value={priceRange}
            onChange={(value) => {
              setPriceRange(value as PriceRangeFilter);
              resetPage();
            }}
          >
            <option value="all">{t('admin.products.filters.allPrices')}</option>
            <option value="under50">{t('admin.products.filters.priceUnder50')}</option>
            <option value="50to100">{t('admin.products.filters.price50to100')}</option>
            <option value="over100">{t('admin.products.filters.priceOver100')}</option>
          </TableFilterSelect>

          <TablePageSizeSelect
            value={pageSize}
            onChange={setPageSize}
            ariaLabel={t('common.pagination.pageSize')}
          />
        </div>

        <Button size="xs" className="h-8 shrink-0 px-3">
          <Plus className="size-3.5" aria-hidden />
          {t('admin.products.table.addProduct')}
        </Button>
      </div>

      <div className="-mx-4 overflow-x-auto md:-mx-5">
        <table className="w-full table-fixed text-xs">
          <colgroup>
            <col className="w-[3%]" />
            <col className="w-[20%]" />
            <col className="w-[9%]" />
            <col className="w-[9%]" />
            <col className="w-[7%]" />
            <col className="w-[8%]" />
            <col className="w-[7%]" />
            <col className="w-[9%]" />
            <col className="w-[14%]" />
            <col className="w-[14%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-border/60 bg-muted/30 text-left text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              <th className="w-9 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  onChange={toggleSelectAll}
                  aria-label={t('admin.products.table.selectAll')}
                  className="size-3 rounded border-border accent-primary"
                />
              </th>
              <th className="px-3 py-2.5">
                <SortableHeaderButton
                  label={t('admin.products.columns.product')}
                  column="product"
                  activeColumn={sort?.column ?? null}
                  direction={sort?.direction ?? 'asc'}
                  onSort={handleSort}
                  {...sortLabelFor(t('admin.products.columns.product'))}
                />
              </th>
              <th className="px-3 py-2.5">{t('admin.products.columns.sku')}</th>
              <th className="px-3 py-2.5">
                <SortableHeaderButton
                  label={t('admin.products.columns.category')}
                  column="category"
                  activeColumn={sort?.column ?? null}
                  direction={sort?.direction ?? 'asc'}
                  onSort={handleSort}
                  {...sortLabelFor(t('admin.products.columns.category'))}
                />
              </th>
              <th className="px-3 py-2.5">
                <SortableHeaderButton
                  label={t('admin.products.columns.stock')}
                  column="stock"
                  activeColumn={sort?.column ?? null}
                  direction={sort?.direction ?? 'asc'}
                  onSort={handleSort}
                  {...sortLabelFor(t('admin.products.columns.stock'))}
                />
              </th>
              <th className="px-3 py-2.5">
                <SortableHeaderButton
                  label={t('admin.products.columns.price')}
                  column="price"
                  activeColumn={sort?.column ?? null}
                  direction={sort?.direction ?? 'asc'}
                  onSort={handleSort}
                  {...sortLabelFor(t('admin.products.columns.price'))}
                />
              </th>
              <th className="px-3 py-2.5">
                <SortableHeaderButton
                  label={t('admin.products.columns.orders')}
                  column="orders"
                  activeColumn={sort?.column ?? null}
                  direction={sort?.direction ?? 'asc'}
                  onSort={handleSort}
                  {...sortLabelFor(t('admin.products.columns.orders'))}
                />
              </th>
              <th className="px-3 py-2.5">
                <SortableHeaderButton
                  label={t('admin.products.columns.status')}
                  column="status"
                  activeColumn={sort?.column ?? null}
                  direction={sort?.direction ?? 'asc'}
                  onSort={handleSort}
                  {...sortLabelFor(t('admin.products.columns.status'))}
                />
              </th>
              <th className="px-3 py-2.5">
                <SortableHeaderButton
                  label={t('admin.products.columns.published')}
                  column="published"
                  activeColumn={sort?.column ?? null}
                  direction={sort?.direction ?? 'asc'}
                  onSort={handleSort}
                  {...sortLabelFor(t('admin.products.columns.published'))}
                />
              </th>
              <th className="px-3 py-2.5">{t('admin.products.columns.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: pageSize }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className="border-b border-border/40">
                    <td className="px-3 py-2.5" colSpan={10}>
                      <Skeleton className="h-9 w-full" />
                    </td>
                  </tr>
                ))
              : null}

            {!isLoading && isError ? (
              <tr>
                <td
                  colSpan={10}
                  className="px-3 py-6 text-center text-muted-foreground"
                >
                  {t('admin.products.table.loadError')}
                </td>
              </tr>
            ) : null}

            {!isLoading && !isError && pageItems.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="px-3 py-6 text-center text-muted-foreground"
                >
                  {t('admin.products.table.empty')}
                </td>
              </tr>
            ) : null}

            {!isLoading && !isError
              ? pageItems.map((product: Product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    locale={locale}
                    selected={selectedIds.has(product.id)}
                    onToggleSelect={toggleSelect}
                    formatPrice={formatPrice}
                    t={t}
                  />
                ))
              : null}
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
        itemLabel={t('admin.products.pagination.itemLabel')}
      />
    </section>
  );
}

function ProductRow({
  product,
  locale,
  selected,
  onToggleSelect,
  formatPrice,
  t,
}: {
  product: Product;
  locale: 'en' | 'ko';
  selected: boolean;
  onToggleSelect: (id: string) => void;
  formatPrice: (priceCents: number, currency?: string) => string;
  t: (key: string, values?: Record<string, string | number>) => string;
}) {
  const router = useRouter();
  const sku = formatProductSku(product.slug);
  const category = inferCategoryLabel(product.slug);
  const orders = getMockOrderCount(product.slug);
  const published = getMockPublishedAt(product.slug, locale);
  const detailHref = `/products/${product.slug}`;

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
      aria-label={t('admin.products.actions.view')}
    >
      <td className="px-3 py-2.5" onClick={stopRowNavigation} onKeyDown={stopRowNavigation}>
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(product.id)}
          aria-label={t('admin.products.table.selectProduct', { name: product.name })}
          className="size-3 cursor-pointer rounded border-border accent-primary"
        />
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <ProductThumbnail
            name={product.name}
            slug={product.slug}
            imageUrl={product.imageUrl}
          />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold leading-tight text-foreground">
              {product.name}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {t('admin.products.byBrand', { brand: 'Juspeace' })}
            </p>
          </div>
        </div>
      </td>
      <td className="px-3 py-2.5 text-muted-foreground">{sku}</td>
      <td className="px-3 py-2.5 text-muted-foreground">{category}</td>
      <td className="px-3 py-2.5 text-muted-foreground">{product.stock}</td>
      <td className="px-3 py-2.5 text-muted-foreground">
        {formatPrice(product.priceCents, product.currency)}
      </td>
      <td className="px-3 py-2.5 text-muted-foreground">{orders}</td>
      <td className="px-3 py-2.5">
        <StatusBadge
          label={t(productStatusLabelKey(product.status))}
          tone={productStatusTone(product.status)}
        />
      </td>
      <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">
        <span>{published.date}</span>{' '}
        <span className="text-[11px]">{published.time}</span>
      </td>
      <td className="px-3 py-2.5" onClick={stopRowNavigation} onKeyDown={stopRowNavigation}>
        <div className="flex items-center gap-1">
          <TableActionButton
            label={t('admin.products.actions.view')}
            href={`/products/${product.slug}`}
          >
            <Eye className="size-3" />
          </TableActionButton>
          <TableActionButton label={t('admin.products.actions.edit')}>
            <Pencil className="size-3" />
          </TableActionButton>
          <TableActionButton
            label={t('admin.products.actions.delete')}
            destructive
          >
            <Trash2 className="size-3" />
          </TableActionButton>
        </div>
      </td>
    </tr>
  );
}

export const ProductsTablePanel = memo(ProductsTablePanelComponent);
