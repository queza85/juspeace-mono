import type { InventoryListRow, InventoryStockStatus } from '@/lib/inventory/mock-data';
import { inventoryListRows } from '@/lib/inventory/mock-data';

export type StockHistoryAction =
  | 'stock_added'
  | 'sold'
  | 'returned'
  | 'reserved';

export interface StockHistoryRow {
  id: string;
  date: string;
  time: string;
  action: StockHistoryAction;
  quantityDelta: number;
  quantityBefore: number;
  quantityAfter: number;
  reason: string;
}

export interface InventoryDetail extends InventoryListRow {
  initialStock: number;
  availableStock: number;
  reservedStock: number;
  soldQuantity: number | null;
  cancelledReturned: number | null;
  stockStatus: InventoryStockStatus;
  stockHistory: StockHistoryRow[];
}

const detailOverrides: Record<string, Partial<InventoryDetail>> = {
  'inv-10246': {
    initialStock: 560,
    availableStock: 203,
    reservedStock: 32,
    soldQuantity: null,
    cancelledReturned: null,
    stockStatus: 'in_stock',
  },
};

const defaultStockHistory: StockHistoryRow[] = [
  {
    id: 'sh-1',
    date: '27 Aug, 2026',
    time: '1:24 AM',
    action: 'stock_added',
    quantityDelta: 50,
    quantityBefore: 50,
    quantityAfter: 100,
    reason: 'Restock',
  },
  {
    id: 'sh-2',
    date: '27 Aug, 2026',
    time: '1:24 AM',
    action: 'sold',
    quantityDelta: -2,
    quantityBefore: 23,
    quantityAfter: 21,
    reason: 'ORD-00029',
  },
  {
    id: 'sh-3',
    date: '29 Aug, 2026',
    time: '2:32 PM',
    action: 'stock_added',
    quantityDelta: 12,
    quantityBefore: 142,
    quantityAfter: 154,
    reason: 'Restock',
  },
  {
    id: 'sh-4',
    date: '30 Aug, 2026',
    time: '2:32 PM',
    action: 'returned',
    quantityDelta: 1,
    quantityBefore: 90,
    quantityAfter: 91,
    reason: 'Customer Return',
  },
  {
    id: 'sh-5',
    date: '31 Aug, 2026',
    time: '2:32 PM',
    action: 'reserved',
    quantityDelta: 21,
    quantityBefore: 40,
    quantityAfter: 61,
    reason: 'Pending Orders',
  },
  {
    id: 'sh-6',
    date: '31 Aug, 2026',
    time: '2:32 PM',
    action: 'sold',
    quantityDelta: -3,
    quantityBefore: 100,
    quantityAfter: 97,
    reason: 'ORD-00029',
  },
];

export function getInventoryDetailById(id: string): InventoryDetail | null {
  const row = inventoryListRows.find((item) => item.id === id);
  if (!row) {
    return null;
  }

  const overrides = detailOverrides[id] ?? {};

  return {
    ...row,
    ...overrides,
    stockHistory: defaultStockHistory,
  };
}

export function stockHistoryActionLabelKey(action: StockHistoryAction): string {
  return `admin.inventory.detail.history.actions.${action}`;
}
