/** Shared table pagination defaults for admin list UIs. */

export const TABLE_PAGE_SIZE_OPTIONS = [8, 12, 20, 50] as const;

export type TablePageSize = (typeof TABLE_PAGE_SIZE_OPTIONS)[number];

export const DEFAULT_TABLE_PAGE_SIZE: TablePageSize = 8;

export interface PaginationInput {
  total: number;
  page: number;
  pageSize: number;
}

export interface PaginationMeta {
  total: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  pageOffset: number;
  showingFrom: number;
  showingTo: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export function getPaginationMeta({
  total,
  page,
  pageSize,
}: PaginationInput): PaginationMeta {
  const safePageSize = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const pageOffset = (currentPage - 1) * safePageSize;
  const showingFrom = total === 0 ? 0 : pageOffset + 1;
  const showingTo = Math.min(pageOffset + safePageSize, total);

  return {
    total,
    pageSize: safePageSize,
    currentPage,
    totalPages,
    pageOffset,
    showingFrom,
    showingTo,
    hasPreviousPage: currentPage > 1,
    hasNextPage: currentPage < totalPages,
  };
}

/** Client-side slice helper. Server tables pass offset/limit to the API instead. */
export function paginateItems<T>(
  items: readonly T[],
  page: number,
  pageSize: number,
): T[] {
  const { pageOffset } = getPaginationMeta({
    total: items.length,
    page,
    pageSize,
  });

  return items.slice(pageOffset, pageOffset + pageSize);
}

/** 0-based offset for server-side list APIs (`offset` query param). */
export function toApiOffset(page: number, pageSize: number): number {
  const safePageSize = Math.max(1, pageSize);
  return (Math.max(page, 1) - 1) * safePageSize;
}

export function isTablePageSize(value: number): value is TablePageSize {
  return (TABLE_PAGE_SIZE_OPTIONS as readonly number[]).includes(value);
}
