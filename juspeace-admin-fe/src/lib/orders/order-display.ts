import type { SortDirection } from '@/lib/table';
import type {
  OrderFulfillmentStatus,
  OrderListRow,
  OrderPaymentStatus,
  OrderShippingStatus,
} from '@/lib/orders/mock-data';

export type OrderSortColumn =
  | 'orderNumber'
  | 'orderDate'
  | 'customer'
  | 'country'
  | 'product'
  | 'quantity'
  | 'paymentAmount'
  | 'paymentStatus'
  | 'orderStatus'
  | 'shippingStatus'
  | 'trackingNumber';

export type DateRangeFilter = 'all' | 'today' | 'week' | 'month';
export type TrackingFilter = 'all' | 'registered' | 'missing';

export function countryFlagEmoji(countryCode: string): string {
  const code = countryCode.toUpperCase();
  if (code.length !== 2) {
    return '';
  }

  return String.fromCodePoint(
    ...[...code].map((char) => 127397 + char.charCodeAt(0)),
  );
}

export function matchesOrderSearch(order: OrderListRow, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  return [
    order.orderNumber,
    order.customerName,
    order.productName,
    order.trackingNumber ?? '',
    order.countryCode,
  ].some((value) => value.toLowerCase().includes(normalized));
}

export function matchesPaymentStatusFilter(
  order: OrderListRow,
  filter: 'all' | OrderPaymentStatus,
): boolean {
  return filter === 'all' || order.paymentStatus === filter;
}

export function matchesOrderStatusFilter(
  order: OrderListRow,
  filter: 'all' | OrderFulfillmentStatus,
): boolean {
  return filter === 'all' || order.orderStatus === filter;
}

export function matchesShippingStatusFilter(
  order: OrderListRow,
  filter: 'all' | OrderShippingStatus,
): boolean {
  return filter === 'all' || order.shippingStatus === filter;
}

export function matchesCountryFilter(
  order: OrderListRow,
  filter: 'all' | string,
): boolean {
  return filter === 'all' || order.countryCode === filter;
}

export function matchesProductFilter(
  order: OrderListRow,
  filter: 'all' | string,
): boolean {
  return filter === 'all' || order.productSlug === filter;
}

export function matchesTrackingFilter(
  order: OrderListRow,
  filter: TrackingFilter,
): boolean {
  if (filter === 'all') {
    return true;
  }

  const hasTracking = Boolean(order.trackingNumber?.trim());
  return filter === 'registered' ? hasTracking : !hasTracking;
}

export function matchesDateRangeFilter(
  order: OrderListRow,
  filter: DateRangeFilter,
): boolean {
  if (filter === 'all') {
    return true;
  }

  const parsed = Date.parse(`${order.orderDate} ${order.orderTime}`);
  if (Number.isNaN(parsed)) {
    return true;
  }

  const now = Date.now();
  const dayMs = 86_400_000;

  switch (filter) {
    case 'today':
      return now - parsed <= dayMs;
    case 'week':
      return now - parsed <= dayMs * 7;
    case 'month':
      return now - parsed <= dayMs * 30;
    default:
      return true;
  }
}

function compareStrings(a: string, b: string): number {
  return a.localeCompare(b, undefined, { sensitivity: 'base' });
}

export function sortOrders(
  orders: readonly OrderListRow[],
  column: OrderSortColumn,
  direction: SortDirection,
): OrderListRow[] {
  const sorted = [...orders].sort((left, right) => {
    switch (column) {
      case 'orderNumber':
        return compareStrings(left.orderNumber, right.orderNumber);
      case 'orderDate': {
        const leftDate = Date.parse(`${left.orderDate} ${left.orderTime}`);
        const rightDate = Date.parse(`${right.orderDate} ${right.orderTime}`);
        return leftDate - rightDate;
      }
      case 'customer':
        return compareStrings(left.customerName, right.customerName);
      case 'country':
        return compareStrings(left.countryCode, right.countryCode);
      case 'product':
        return compareStrings(left.productName, right.productName);
      case 'quantity':
        return left.quantity - right.quantity;
      case 'paymentAmount':
        return left.paymentAmountCents - right.paymentAmountCents;
      case 'paymentStatus':
        return compareStrings(left.paymentStatus, right.paymentStatus);
      case 'orderStatus':
        return compareStrings(left.orderStatus, right.orderStatus);
      case 'shippingStatus':
        return compareStrings(left.shippingStatus, right.shippingStatus);
      case 'trackingNumber':
        return compareStrings(left.trackingNumber ?? '', right.trackingNumber ?? '');
      default:
        return 0;
    }
  });

  return direction === 'desc' ? sorted.reverse() : sorted;
}
