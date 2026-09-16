import type { SortDirection } from '@/lib/table';
import type { InventoryListRow, InventoryStockStatus } from '@/lib/inventory/mock-data';

export type InventorySortColumn =
  | 'product'
  | 'variation'
  | 'sku'
  | 'initialStock'
  | 'availableStock'
  | 'reservedStock'
  | 'soldQuantity'
  | 'cancelledReturned'
  | 'stockStatus';

export function matchesInventorySearch(row: InventoryListRow, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  return (
    row.productName.toLowerCase().includes(normalized) ||
    row.sku.toLowerCase().includes(normalized) ||
    row.variation.toLowerCase().includes(normalized) ||
    row.productBrand.toLowerCase().includes(normalized)
  );
}

export function matchesVariationFilter(
  row: InventoryListRow,
  filter: 'all' | string,
): boolean {
  if (filter === 'all') {
    return true;
  }

  return row.variationKey === filter;
}

export function matchesStockStatusFilter(
  row: InventoryListRow,
  filter: 'all' | InventoryStockStatus,
): boolean {
  if (filter === 'all') {
    return true;
  }

  return row.stockStatus === filter;
}

function compareNullableNumber(
  left: number | null,
  right: number | null,
  direction: SortDirection,
): number {
  const leftValue = left ?? -1;
  const rightValue = right ?? -1;
  const result = leftValue - rightValue;
  return direction === 'asc' ? result : -result;
}

export function sortInventoryRows(
  rows: InventoryListRow[],
  column: InventorySortColumn,
  direction: SortDirection,
): InventoryListRow[] {
  const sorted = [...rows];

  sorted.sort((left, right) => {
    let result = 0;

    switch (column) {
      case 'product':
        result = left.productName.localeCompare(right.productName);
        break;
      case 'variation':
        result = left.variation.localeCompare(right.variation);
        break;
      case 'sku':
        result = left.sku.localeCompare(right.sku);
        break;
      case 'initialStock':
        result = left.initialStock - right.initialStock;
        break;
      case 'availableStock':
        result = left.availableStock - right.availableStock;
        break;
      case 'reservedStock':
        result = left.reservedStock - right.reservedStock;
        break;
      case 'soldQuantity':
        result = compareNullableNumber(left.soldQuantity, right.soldQuantity, 'asc');
        break;
      case 'cancelledReturned':
        result = compareNullableNumber(
          left.cancelledReturned,
          right.cancelledReturned,
          'asc',
        );
        break;
      case 'stockStatus':
        result = left.stockStatus.localeCompare(right.stockStatus);
        break;
      default:
        break;
    }

    return direction === 'asc' ? result : -result;
  });

  return sorted;
}

export function formatInventoryQuantity(value: number | null): string {
  if (value == null || value === 0) {
    return '-';
  }

  return String(value);
}
