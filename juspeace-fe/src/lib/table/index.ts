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
