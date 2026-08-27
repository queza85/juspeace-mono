'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  DEFAULT_TABLE_PAGE_SIZE,
  getPaginationMeta,
  paginateItems,
  type TablePageSize,
} from '@/lib/table/pagination';

export function usePagination(
  total: number,
  initialPageSize: TablePageSize = DEFAULT_TABLE_PAGE_SIZE,
) {
  const [requestedPage, setRequestedPage] = useState(1);
  const [pageSize, setPageSizeState] = useState<TablePageSize>(initialPageSize);

  const meta = useMemo(
    () => getPaginationMeta({ total, page: requestedPage, pageSize }),
    [total, requestedPage, pageSize],
  );

  const setPage = useCallback(
    (nextPage: number) => {
      setRequestedPage(Math.min(Math.max(1, nextPage), meta.totalPages));
    },
    [meta.totalPages],
  );

  const resetPage = useCallback(() => {
    setRequestedPage(1);
  }, []);

  const setPageSize = useCallback((nextPageSize: TablePageSize) => {
    setPageSizeState(nextPageSize);
    setRequestedPage(1);
  }, []);

  const goToPreviousPage = useCallback(() => {
    setPage(meta.currentPage - 1);
  }, [meta.currentPage, setPage]);

  const goToNextPage = useCallback(() => {
    setPage(meta.currentPage + 1);
  }, [meta.currentPage, setPage]);

  return {
    setPage,
    setPageSize,
    resetPage,
    goToPreviousPage,
    goToNextPage,
    ...meta,
    page: meta.currentPage,
    pageSize,
  };
}

/** Client-side tables: filter/sort first, then paginate in memory. */
export function useClientPaginatedItems<T>(
  items: readonly T[],
  initialPageSize: TablePageSize = DEFAULT_TABLE_PAGE_SIZE,
) {
  const pagination = usePagination(items.length, initialPageSize);

  const pageItems = useMemo(
    () => paginateItems(items, pagination.currentPage, pagination.pageSize),
    [items, pagination.currentPage, pagination.pageSize],
  );

  return {
    ...pagination,
    pageItems,
  };
}
