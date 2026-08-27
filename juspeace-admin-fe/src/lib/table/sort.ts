/** Shared client-side table sort state (three-click cycle). */

export type SortDirection = 'asc' | 'desc';

export type TableSortState<TColumn extends string> = {
  column: TColumn;
  direction: SortDirection;
} | null;

/**
 * Cycles sort on a column header:
 * inactive → desc → asc → inactive (default order).
 * Switching columns always starts at desc.
 */
export function cycleTableSort<TColumn extends string>(
  current: TableSortState<TColumn>,
  column: TColumn,
): TableSortState<TColumn> {
  if (current?.column !== column) {
    return { column, direction: 'desc' };
  }

  if (current.direction === 'desc') {
    return { column, direction: 'asc' };
  }

  return null;
}
