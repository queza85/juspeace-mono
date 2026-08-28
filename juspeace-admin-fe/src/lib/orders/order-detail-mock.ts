import { formatProductSku, inferCategoryLabel } from '@/lib/products/product-display';
import type {
  OrderFulfillmentStatus,
  OrderListRow,
} from '@/lib/orders/mock-data';
import { orderListRows } from '@/lib/orders/mock-data';

export type PgTransactionStatus = 'completed' | 'pending' | 'failed';
export type OrderCancellationStatus = 'notCancelled' | 'cancelled';
export type OrderRefundStatus = 'notRefund' | 'refunded' | 'partial';

export interface OrderStatusHistoryEntry {
  status: OrderFulfillmentStatus | 'cancelled';
  timestamp?: string;
  completed: boolean;
}

export interface OrderDetail extends OrderListRow {
  totalAmountCents: number;
  unitPriceCents: number;
  subtotalCents: number;
  productCategory: string;
  productSku: string;
  customerEmail: string;
  customerPhone: string;
  shippingRecipient: string;
  shippingAddress: string;
  paymentMethod: string;
  paymentProvider: string;
  paymentTransactionNumber: string;
  pgTransactionId: string;
  pgProvider: string;
  pgPaymentTime: string;
  pgResponse: string;
  pgStatus: PgTransactionStatus;
  statusHistory: OrderStatusHistoryEntry[];
  trackingEntries: string[];
  internalNote: string;
  customerFacingNote: string;
  cancellationStatus: OrderCancellationStatus;
  refundStatus: OrderRefundStatus;
  refundAmountCents: number;
  refundHistory: string;
}

const detailOverrides: Partial<
  Record<string, Partial<Omit<OrderDetail, 'id'>>>
> = {
  '2': {
    orderNumber: 'ORD-0013',
    orderDate: '25 Aug, 2025',
    orderTime: '2:57 AM',
    customerName: 'Sophie',
    countryCode: 'MM',
    countryKey: 'admin.orders.countries.myanmar',
    productName: 'Commitment Bracelet',
    productSlug: 'commitment-bracelet',
    quantity: 2,
    paymentAmountCents: 2020,
    totalAmountCents: 1000,
    paymentStatus: 'paid',
    orderStatus: 'confirmed',
    shippingStatus: 'pending',
    trackingNumber: 'DHL 143432346',
    customerEmail: 'sophie@13gmail.com',
    customerPhone: '+959 882612581',
    shippingRecipient: 'Sophie',
    shippingAddress: '21 Yadanar st. Yangon, Myanmar',
    paymentMethod: 'card',
    paymentProvider: 'KBZPay',
    paymentTransactionNumber: '332178666',
    pgTransactionId: '9459489493',
    pgProvider: 'Malaysian Payment Gateway',
    pgPaymentTime: '25 Aug, 2025 3:31 AM',
    pgResponse: 'success',
    pgStatus: 'completed',
    statusHistory: [
      {
        status: 'pending',
        timestamp: '25 Aug, 2025 2:46 AM',
        completed: true,
      },
      {
        status: 'confirmed',
        timestamp: '25 Aug, 2025 3:46 AM',
        completed: true,
      },
      {
        status: 'shipped',
        timestamp: '25 Aug, 2025 3:46 AM',
        completed: false,
      },
      {
        status: 'cancelled',
        completed: false,
      },
    ],
    trackingEntries: ['DHL 143432346'],
    internalNote: 'Customer requested careful packaging.',
    customerFacingNote: 'Customer requested careful packaging.',
    cancellationStatus: 'notCancelled',
    refundStatus: 'notRefund',
    refundAmountCents: 0,
    refundHistory: 'none',
  },
};

function slugToEmail(name: string, id: string): string {
  const local = name.toLowerCase().replace(/\s+/g, '.');
  return `${local}.${id}@example.com`;
}

function buildDefaultDetail(row: OrderListRow): OrderDetail {
  const unitPriceCents = Math.round(row.paymentAmountCents / row.quantity);
  const subtotalCents = unitPriceCents * row.quantity;

  const history: OrderStatusHistoryEntry[] = [
    {
      status: 'pending',
      timestamp: `${row.orderDate} ${row.orderTime}`,
      completed: true,
    },
    {
      status: 'confirmed',
      timestamp: row.orderStatus !== 'pending' ? `${row.orderDate} ${row.orderTime}` : undefined,
      completed: row.orderStatus !== 'pending',
    },
    {
      status: 'shipped',
      timestamp: row.orderStatus === 'shipped' ? `${row.orderDate} ${row.orderTime}` : undefined,
      completed: row.orderStatus === 'shipped',
    },
    {
      status: 'cancelled',
      timestamp: row.orderStatus === 'cancelled' ? `${row.orderDate} ${row.orderTime}` : undefined,
      completed: row.orderStatus === 'cancelled',
    },
  ];

  return {
    ...row,
    totalAmountCents: row.paymentAmountCents,
    unitPriceCents,
    subtotalCents,
    productCategory: inferCategoryLabel(row.productSlug),
    productSku: formatProductSku(row.productSlug),
    customerEmail: slugToEmail(row.customerName, row.id),
    customerPhone: '+959 000 000 000',
    shippingRecipient: row.customerName,
    shippingAddress: '21 Sample Street, Yangon, Myanmar',
    paymentMethod: 'card',
    paymentProvider: 'KBZPay',
    paymentTransactionNumber: `33217${row.id.padStart(4, '0')}`,
    pgTransactionId: `945948${row.id.padStart(4, '0')}`,
    pgProvider: 'Malaysian Payment Gateway',
    pgPaymentTime: `${row.orderDate} ${row.orderTime}`,
    pgResponse: row.paymentStatus === 'failed' ? 'failed' : 'success',
    pgStatus: row.paymentStatus === 'failed' ? 'failed' : 'completed',
    statusHistory: history,
    trackingEntries: row.trackingNumber ? [row.trackingNumber] : [],
    internalNote: '',
    customerFacingNote: '',
    cancellationStatus: row.orderStatus === 'cancelled' ? 'cancelled' : 'notCancelled',
    refundStatus: row.paymentStatus === 'refunded' ? 'refunded' : 'notRefund',
    refundAmountCents: row.paymentStatus === 'refunded' ? row.paymentAmountCents : 0,
    refundHistory: row.paymentStatus === 'refunded' ? 'refunded' : 'none',
  };
}

export function getOrderDetailById(id: string): OrderDetail | null {
  const row = orderListRows.find((order) => order.id === id);
  if (!row) {
    return null;
  }

  const base = buildDefaultDetail(row);
  const override = detailOverrides[id];
  if (!override) {
    return base;
  }

  const merged = { ...base, ...override };
  merged.totalAmountCents =
    override.totalAmountCents ?? merged.paymentAmountCents;
  merged.unitPriceCents = Math.round(merged.paymentAmountCents / merged.quantity);
  merged.subtotalCents = merged.unitPriceCents * merged.quantity;
  merged.productCategory = inferCategoryLabel(merged.productSlug);
  merged.productSku = formatProductSku(merged.productSlug);

  return merged;
}

export function pgStatusTone(
  status: PgTransactionStatus,
): 'success' | 'warning' | 'danger' {
  switch (status) {
    case 'completed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
      return 'danger';
    default:
      return 'warning';
  }
}
