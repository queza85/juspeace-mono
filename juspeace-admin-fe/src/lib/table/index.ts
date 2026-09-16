/**
 * Re-export TanStack Table v9 primitives for admin / list UIs.
 * Prefer this entry over importing `@tanstack/react-table` in feature code.
 */
export {
  createColumnHelper,
  createCoreRowModel,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  flexRender,
  useTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from '@tanstack/react-table';

export {
  DEFAULT_TABLE_PAGE_SIZE,
  TABLE_PAGE_SIZE_OPTIONS,
  getPaginationMeta,
  isTablePageSize,
  paginateItems,
  toApiOffset,
  type PaginationInput,
  type PaginationMeta,
  type TablePageSize,
} from './pagination';

export {
  cycleTableSort,
  type SortDirection,
  type TableSortState,
} from './sort';
