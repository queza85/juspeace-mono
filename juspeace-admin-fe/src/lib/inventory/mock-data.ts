import type { OrderStatusTone } from '@/lib/dashboard/mock-data';

export type InventoryStockStatus = 'in_stock' | 'low_stock' | 'sold_out';

export interface InventoryStatMetric {
  id: string;
  labelKey: string;
  value: string;
}

export interface InventoryListRow {
  id: string;
  productName: string;
  productSlug: string;
  productBrand: string;
  variation: string;
  variationKey: string;
  sku: string;
  initialStock: number;
  availableStock: number;
  reservedStock: number;
  soldQuantity: number | null;
  cancelledReturned: number | null;
  stockStatus: InventoryStockStatus;
}

/** Preview stat metrics for the inventory listing page (sample data). */
export const inventoryPageStatMetrics: InventoryStatMetric[] = [
  {
    id: 'totalStock',
    labelKey: 'admin.inventory.kpi.totalStock',
    value: '8,540',
  },
  {
    id: 'availableStock',
    labelKey: 'admin.inventory.kpi.availableStock',
    value: '1,240',
  },
  {
    id: 'reservedStock',
    labelKey: 'admin.inventory.kpi.reservedStock',
    value: '1,240',
  },
  {
    id: 'soldQuantity',
    labelKey: 'admin.inventory.kpi.soldQuantity',
    value: '184',
  },
  {
    id: 'lowStockItems',
    labelKey: 'admin.inventory.kpi.lowStockItems',
    value: '231',
  },
  {
    id: 'soldOutItems',
    labelKey: 'admin.inventory.kpi.soldOutItems',
    value: '231',
  },
];

export const inventoryListRows: InventoryListRow[] = [
  {
    id: 'inv-10246',
    productName: 'WHITE _Pure hope',
    productSlug: 'white-pure-hope',
    productBrand: 'Juspeace',
    variation: 'Black / Standard',
    variationKey: 'black-standard',
    sku: 'JP-10246',
    initialStock: 500,
    availableStock: 500,
    reservedStock: 0,
    soldQuantity: null,
    cancelledReturned: null,
    stockStatus: 'in_stock',
  },
  {
    id: 'inv-10247',
    productName: 'Celestial Serenity Glass',
    productSlug: 'celestial-serenity-glass',
    productBrand: 'Juspeace',
    variation: 'Black / Standard',
    variationKey: 'black-standard',
    sku: 'JP-10247',
    initialStock: 120,
    availableStock: 18,
    reservedStock: 12,
    soldQuantity: 90,
    cancelledReturned: null,
    stockStatus: 'low_stock',
  },
  {
    id: 'inv-10248',
    productName: 'Earphones',
    productSlug: 'earphones',
    productBrand: 'Juspeace',
    variation: 'White / Standard',
    variationKey: 'white-standard',
    sku: 'JP-10248',
    initialStock: 80,
    availableStock: 0,
    reservedStock: 0,
    soldQuantity: 80,
    cancelledReturned: null,
    stockStatus: 'sold_out',
  },
  {
    id: 'inv-10249',
    productName: 'WHITE _Pure hope',
    productSlug: 'white-pure-hope',
    productBrand: 'Juspeace',
    variation: 'White / Small',
    variationKey: 'white-small',
    sku: 'JP-10249',
    initialStock: 300,
    availableStock: 280,
    reservedStock: 10,
    soldQuantity: 10,
    cancelledReturned: null,
    stockStatus: 'in_stock',
  },
  {
    id: 'inv-10250',
    productName: 'Celestial Serenity Glass',
    productSlug: 'celestial-serenity-glass',
    productBrand: 'Juspeace',
    variation: 'White / Small',
    variationKey: 'white-small',
    sku: 'JP-10250',
    initialStock: 90,
    availableStock: 12,
    reservedStock: 8,
    soldQuantity: 70,
    cancelledReturned: null,
    stockStatus: 'low_stock',
  },
  {
    id: 'inv-10251',
    productName: 'Earphones',
    productSlug: 'earphones',
    productBrand: 'Juspeace',
    variation: 'Black / Standard',
    variationKey: 'black-standard',
    sku: 'JP-10251',
    initialStock: 60,
    availableStock: 0,
    reservedStock: 0,
    soldQuantity: 58,
    cancelledReturned: 2,
    stockStatus: 'sold_out',
  },
  {
    id: 'inv-10252',
    productName: 'WHITE _Pure hope',
    productSlug: 'white-pure-hope',
    productBrand: 'Juspeace',
    variation: 'Black / Large',
    variationKey: 'black-large',
    sku: 'JP-10252',
    initialStock: 200,
    availableStock: 190,
    reservedStock: 5,
    soldQuantity: 5,
    cancelledReturned: null,
    stockStatus: 'in_stock',
  },
  {
    id: 'inv-10253',
    productName: 'Celestial Serenity Glass',
    productSlug: 'celestial-serenity-glass',
    productBrand: 'Juspeace',
    variation: 'White / Large',
    variationKey: 'white-large',
    sku: 'JP-10253',
    initialStock: 75,
    availableStock: 9,
    reservedStock: 6,
    soldQuantity: 60,
    cancelledReturned: null,
    stockStatus: 'low_stock',
  },
  {
    id: 'inv-10254',
    productName: 'Earphones',
    productSlug: 'earphones',
    productBrand: 'Juspeace',
    variation: 'White / Large',
    variationKey: 'white-large',
    sku: 'JP-10254',
    initialStock: 45,
    availableStock: 0,
    reservedStock: 0,
    soldQuantity: 43,
    cancelledReturned: 2,
    stockStatus: 'sold_out',
  },
];

export function stockStatusLabelKey(status: InventoryStockStatus): string {
  return `admin.inventory.stockStatus.${status}`;
}

export function stockStatusTone(status: InventoryStockStatus): OrderStatusTone {
  switch (status) {
    case 'in_stock':
      return 'success';
    case 'low_stock':
      return 'warning';
    case 'sold_out':
      return 'danger';
    default:
      return 'neutral';
  }
}
