import type { KpiMetric } from '@/lib/dashboard/mock-data';
import type { OrderStatusTone } from '@/lib/dashboard/mock-data';

export type OrderPaymentStatus = 'paid' | 'failed' | 'pending' | 'refunded';
export type OrderFulfillmentStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'shipped';
export type OrderShippingStatus = 'pending' | 'shipped' | 'returned';

export interface OrderListRow {
  id: string;
  orderNumber: string;
  orderDate: string;
  orderTime: string;
  customerName: string;
  countryCode: string;
  countryKey: string;
  productName: string;
  productSlug: string;
  productBrand: string;
  quantity: number;
  paymentAmountCents: number;
  paymentStatus: OrderPaymentStatus;
  orderStatus: OrderFulfillmentStatus;
  shippingStatus: OrderShippingStatus;
  trackingNumber?: string;
}

/** Preview KPI metrics for the orders listing page (sample data). */
export const ordersPageKpiMetrics: KpiMetric[] = [
  {
    id: 'totalOrders',
    labelKey: 'admin.dashboard.kpi.totalOrders',
    value: '8,540',
    trend: '+5 New',
    trendDirection: 'new',
    badgeTone: 'purple',
    iconTone: 'sky',
    subLabelKey: 'admin.orders.kpi.todayOrders',
    subValue: '90',
    footerDot: 'blue',
  },
  {
    id: 'paidOrders',
    labelKey: 'admin.dashboard.kpi.paidOrders',
    value: '1,240',
    trend: '+8.2%',
    trendDirection: 'up',
    badgeTone: 'green',
    iconTone: 'slate',
    subLabelKey: 'admin.dashboard.kpi.todaysPaidOrders',
    subValue: '12',
    footerDot: 'blue',
  },
  {
    id: 'awaitingShipment',
    labelKey: 'admin.dashboard.kpi.awaitingShipment',
    value: '1,240',
    trend: '-1.2%',
    trendDirection: 'down',
    badgeTone: 'purple',
    iconTone: 'slate',
    subLabelKey: 'admin.dashboard.kpi.todayAwaitingShipment',
    subValue: '12',
    footerDot: 'green',
  },
  {
    id: 'completedOrders',
    labelKey: 'admin.dashboard.kpi.completedOrders',
    value: '184',
    trend: '-1.2%',
    trendDirection: 'down',
    badgeTone: 'purple',
    iconTone: 'slate',
    subLabelKey: 'admin.dashboard.kpi.todayCompletedOrders',
    subValue: '12',
    footerDot: 'blue',
  },
  {
    id: 'cancelledOrders',
    labelKey: 'admin.orders.kpi.cancelledOrders',
    value: '231',
    trend: '-4.5%',
    trendDirection: 'down',
    badgeTone: 'orange',
    iconTone: 'slate',
    subLabelKey: 'admin.orders.kpi.todaysCancelledOrders',
    subValue: '0',
    footerDot: 'orange',
  },
];

export const orderListRows: OrderListRow[] = [
  {
    id: '1',
    orderNumber: 'ORD_0001',
    orderDate: '18 Apr, 2025',
    orderTime: '12:24 PM',
    customerName: 'Liam Wong',
    countryCode: 'MM',
    countryKey: 'admin.orders.countries.myanmar',
    productName: 'WHITE _Pure hope',
    productSlug: 'white-pure-hope',
    productBrand: 'juspeace',
    quantity: 1,
    paymentAmountCents: 1010,
    paymentStatus: 'paid',
    orderStatus: 'pending',
    shippingStatus: 'pending',
    trackingNumber: 'DHL 143432346',
  },
  {
    id: '2',
    orderNumber: 'ORD_0002',
    orderDate: '18 Apr, 2025',
    orderTime: '11:48 AM',
    customerName: 'Sophia Lee',
    countryCode: 'SG',
    countryKey: 'admin.orders.countries.singapore',
    productName: 'Earphones',
    productSlug: 'earphones',
    productBrand: 'juspeace',
    quantity: 2,
    paymentAmountCents: 2020,
    paymentStatus: 'paid',
    orderStatus: 'confirmed',
    shippingStatus: 'shipped',
    trackingNumber: 'SF 882910334',
  },
  {
    id: '3',
    orderNumber: 'ORD_0003',
    orderDate: '17 Apr, 2025',
    orderTime: '09:05 PM',
    customerName: 'Michael Chen',
    countryCode: 'TH',
    countryKey: 'admin.orders.countries.thailand',
    productName: 'Organic Cotton Tote',
    productSlug: 'organic-cotton-tote',
    productBrand: 'juspeace',
    quantity: 1,
    paymentAmountCents: 1010,
    paymentStatus: 'failed',
    orderStatus: 'pending',
    shippingStatus: 'pending',
  },
  {
    id: '4',
    orderNumber: 'ORD_0004',
    orderDate: '17 Apr, 2025',
    orderTime: '02:30 PM',
    customerName: 'Emma Wilson',
    countryCode: 'MY',
    countryKey: 'admin.orders.countries.malaysia',
    productName: 'Hand-poured Soy Candle',
    productSlug: 'hand-poured-soy-candle',
    productBrand: 'juspeace',
    quantity: 1,
    paymentAmountCents: 2020,
    paymentStatus: 'pending',
    orderStatus: 'confirmed',
    shippingStatus: 'pending',
  },
  {
    id: '5',
    orderNumber: 'ORD_0005',
    orderDate: '16 Apr, 2025',
    orderTime: '09:45 AM',
    customerName: 'James Carter',
    countryCode: 'MM',
    countryKey: 'admin.orders.countries.myanmar',
    productName: 'Commitment Bracelet',
    productSlug: 'commitment-bracelet',
    productBrand: 'juspeace',
    quantity: 2,
    paymentAmountCents: 2020,
    paymentStatus: 'refunded',
    orderStatus: 'cancelled',
    shippingStatus: 'returned',
    trackingNumber: 'DHL 556677889',
  },
  {
    id: '6',
    orderNumber: 'ORD_0006',
    orderDate: '16 Apr, 2025',
    orderTime: '08:12 AM',
    customerName: 'Sarah Wilson',
    countryCode: 'SG',
    countryKey: 'admin.orders.countries.singapore',
    productName: 'WHITE _Pure hope',
    productSlug: 'white-pure-hope',
    productBrand: 'juspeace',
    quantity: 1,
    paymentAmountCents: 1010,
    paymentStatus: 'paid',
    orderStatus: 'shipped',
    shippingStatus: 'shipped',
    trackingNumber: 'DHL 778899001',
  },
  {
    id: '7',
    orderNumber: 'ORD_0007',
    orderDate: '15 Apr, 2025',
    orderTime: '04:55 PM',
    customerName: 'Tom Brown',
    countryCode: 'TH',
    countryKey: 'admin.orders.countries.thailand',
    productName: 'Bamboo Water Bottle',
    productSlug: 'bamboo-water-bottle',
    productBrand: 'juspeace',
    quantity: 3,
    paymentAmountCents: 3030,
    paymentStatus: 'paid',
    orderStatus: 'confirmed',
    shippingStatus: 'pending',
    trackingNumber: 'FedEx 220011445',
  },
  {
    id: '8',
    orderNumber: 'ORD_0008',
    orderDate: '15 Apr, 2025',
    orderTime: '01:20 PM',
    customerName: 'Jane Doe',
    countryCode: 'VN',
    countryKey: 'admin.orders.countries.vietnam',
    productName: 'Earphones',
    productSlug: 'earphones',
    productBrand: 'juspeace',
    quantity: 1,
    paymentAmountCents: 1010,
    paymentStatus: 'failed',
    orderStatus: 'pending',
    shippingStatus: 'pending',
  },
  {
    id: '9',
    orderNumber: 'ORD_0009',
    orderDate: '14 Apr, 2025',
    orderTime: '10:05 AM',
    customerName: 'John Smith',
    countryCode: 'MY',
    countryKey: 'admin.orders.countries.malaysia',
    productName: 'Organic Cotton Tote',
    productSlug: 'organic-cotton-tote',
    productBrand: 'juspeace',
    quantity: 2,
    paymentAmountCents: 2020,
    paymentStatus: 'paid',
    orderStatus: 'confirmed',
    shippingStatus: 'shipped',
    trackingNumber: 'DHL 334455667',
  },
];

export function paymentStatusLabelKey(status: OrderPaymentStatus): string {
  return `admin.orders.paymentStatus.${status}`;
}

export function paymentStatusTone(status: OrderPaymentStatus): OrderStatusTone {
  switch (status) {
    case 'paid':
      return 'success';
    case 'failed':
      return 'danger';
    case 'pending':
      return 'warning';
    case 'refunded':
      return 'info';
    default:
      return 'neutral';
  }
}

export function orderStatusLabelKey(status: OrderFulfillmentStatus): string {
  return `admin.orders.orderStatus.${status}`;
}

export function orderStatusTone(status: OrderFulfillmentStatus): OrderStatusTone {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'confirmed':
      return 'accent';
    case 'cancelled':
      return 'danger';
    case 'shipped':
      return 'info';
    default:
      return 'neutral';
  }
}

export function shippingStatusLabelKey(status: OrderShippingStatus): string {
  return `admin.orders.shippingStatus.${status}`;
}

export function shippingStatusTone(status: OrderShippingStatus): OrderStatusTone {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'shipped':
      return 'info';
    case 'returned':
      return 'danger';
    default:
      return 'neutral';
  }
}
