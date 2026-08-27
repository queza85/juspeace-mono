export type KpiTrendDirection = 'up' | 'down' | 'new';
export type KpiBadgeTone = 'green' | 'purple' | 'indigo' | 'orange' | 'cyan';
export type KpiIconTone = 'slate' | 'lavender' | 'sky';
export type KpiFooterDot =
  | 'blue'
  | 'gray'
  | 'green'
  | 'purple'
  | 'teal'
  | 'orange'
  | 'indigo'
  | 'lavender';

export interface KpiMetric {
  id: string;
  labelKey: string;
  value: string;
  trend: string;
  trendDirection: KpiTrendDirection;
  subLabelKey: string;
  subValue: string;
  footerDot: KpiFooterDot;
  /** Overrides trend-based badge color when set (products page KPIs). */
  badgeTone?: KpiBadgeTone;
  /** Circular icon background on the card. Defaults to slate. */
  iconTone?: KpiIconTone;
}

export interface DailySalesPoint {
  dayKey: string;
  sales: number;
  target: number;
}

export interface ProductSalesSlice {
  labelKey: string;
  value: number;
  color: string;
}

export interface OperationalAlert {
  id: string;
  messageKey: string;
  count: number;
  tone: 'orange' | 'red' | 'purple' | 'blue' | 'cyan';
}

export type OrderStatusTone =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

export interface RecentOrderRow {
  id: string;
  orderNumber: string;
  orderDate: string;
  customerName: string;
  productName: string;
  productBrand: string;
  quantity: number;
  paymentAmountCents: number;
  paymentStatusKey: string;
  paymentStatusTone: OrderStatusTone;
  orderStatusKey: string;
  orderStatusTone: OrderStatusTone;
  shippingStatusKey: string;
  shippingStatusTone: OrderStatusTone;
}

export const kpiMetrics: KpiMetric[] = [
  {
    id: 'totalOrders',
    labelKey: 'admin.dashboard.kpi.totalOrders',
    value: '8,540',
    trend: '+5 New',
    trendDirection: 'new',
    subLabelKey: 'admin.dashboard.kpi.todaysOrders',
    subValue: '90',
    footerDot: 'blue',
  },
  {
    id: 'paidOrders',
    labelKey: 'admin.dashboard.kpi.paidOrders',
    value: '1,240',
    trend: '+8.2%',
    trendDirection: 'up',
    subLabelKey: 'admin.dashboard.kpi.todaysPaidOrders',
    subValue: '12',
    footerDot: 'gray',
  },
  {
    id: 'awaitingShipment',
    labelKey: 'admin.dashboard.kpi.awaitingShipment',
    value: '1,240',
    trend: '-1.2%',
    trendDirection: 'down',
    subLabelKey: 'admin.dashboard.kpi.todayAwaitingShipment',
    subValue: '12',
    footerDot: 'green',
  },
  {
    id: 'shippedOrders',
    labelKey: 'admin.dashboard.kpi.shippedOrders',
    value: '240',
    trend: '-1.2%',
    trendDirection: 'down',
    subLabelKey: 'admin.dashboard.kpi.todaysShippedOrders',
    subValue: '12',
    footerDot: 'green',
  },
  {
    id: 'completedOrders',
    labelKey: 'admin.dashboard.kpi.completedOrders',
    value: '184',
    trend: '-1.2%',
    trendDirection: 'down',
    subLabelKey: 'admin.dashboard.kpi.todayCompletedOrders',
    subValue: '12',
    footerDot: 'purple',
  },
  {
    id: 'cancelledRefunded',
    labelKey: 'admin.dashboard.kpi.cancelledRefunded',
    value: '31',
    trend: '+5 New',
    trendDirection: 'new',
    subLabelKey: 'admin.dashboard.kpi.todaysCancelledRefunded',
    subValue: '90',
    footerDot: 'blue',
  },
  {
    id: 'totalSales',
    labelKey: 'admin.dashboard.kpi.totalSales',
    value: '1,240',
    trend: '+8.2%',
    trendDirection: 'up',
    subLabelKey: 'admin.dashboard.kpi.todaysSales',
    subValue: '12',
    footerDot: 'gray',
  },
  {
    id: 'remainingInventory',
    labelKey: 'admin.dashboard.kpi.remainingInventory',
    value: '1,240',
    trend: '-1.2%',
    trendDirection: 'down',
    subLabelKey: 'admin.dashboard.kpi.lastMonthRemainingInventory',
    subValue: '12',
    footerDot: 'green',
  },
  {
    id: 'lowStockAlert',
    labelKey: 'admin.dashboard.kpi.lowStockAlert',
    value: '184',
    trend: '-1.2%',
    trendDirection: 'down',
    subLabelKey: 'admin.dashboard.kpi.todaysLowStockAlert',
    subValue: '12',
    footerDot: 'purple',
  },
];

export const dailySalesData: DailySalesPoint[] = [
  { dayKey: 'admin.dashboard.charts.days.mon', sales: 22000, target: 18000 },
  { dayKey: 'admin.dashboard.charts.days.tue', sales: 30000, target: 24000 },
  { dayKey: 'admin.dashboard.charts.days.wed', sales: 18000, target: 20000 },
  { dayKey: 'admin.dashboard.charts.days.thu', sales: 35000, target: 28000 },
  { dayKey: 'admin.dashboard.charts.days.fri', sales: 42000, target: 32000 },
  { dayKey: 'admin.dashboard.charts.days.sat', sales: 28000, target: 26000 },
  { dayKey: 'admin.dashboard.charts.days.sun', sales: 24000, target: 22000 },
];

export const productSalesData: ProductSalesSlice[] = [
  {
    labelKey: 'admin.dashboard.charts.products.wirelessHeadphones',
    value: 12890,
    color: '#3b82f6',
  },
  {
    labelKey: 'admin.dashboard.charts.products.smartWatch',
    value: 10450,
    color: '#22c55e',
  },
  {
    labelKey: 'admin.dashboard.charts.products.bluetoothSpeaker',
    value: 8050,
    color: '#f97316',
  },
  {
    labelKey: 'admin.dashboard.charts.products.smartphone',
    value: 5970,
    color: '#8b5cf6',
  },
  {
    labelKey: 'admin.dashboard.charts.products.laptop',
    value: 4390,
    color: '#ef4444',
  },
  {
    labelKey: 'admin.dashboard.charts.products.other',
    value: 3481,
    color: '#14b8a6',
  },
];

export const operationalAlerts: OperationalAlert[] = [
  {
    id: 'awaiting-shipment',
    messageKey: 'admin.dashboard.alerts.awaitingShipment',
    count: 25,
    tone: 'orange',
  },
  {
    id: 'failed-payments',
    messageKey: 'admin.dashboard.alerts.failedPayments',
    count: 10,
    tone: 'red',
  },
  {
    id: 'missing-tracking',
    messageKey: 'admin.dashboard.alerts.missingTracking',
    count: 5,
    tone: 'purple',
  },
  {
    id: 'low-stock',
    messageKey: 'admin.dashboard.alerts.lowStock',
    count: 12,
    tone: 'blue',
  },
  {
    id: 'pending-refunds',
    messageKey: 'admin.dashboard.alerts.pendingRefunds',
    count: 3,
    tone: 'cyan',
  },
];

export const recentOrders: RecentOrderRow[] = [
  {
    id: '1',
    orderNumber: 'ORD_0001',
    orderDate: '18 Apr, 2025 | 12:34 PM',
    customerName: 'John Smith',
    productName: 'WHITE _Pure hope',
    productBrand: 'by: juspeace',
    quantity: 2,
    paymentAmountCents: 4999,
    paymentStatusKey: 'admin.dashboard.orders.status.paid',
    paymentStatusTone: 'success',
    orderStatusKey: 'admin.dashboard.orders.status.confirmed',
    orderStatusTone: 'success',
    shippingStatusKey: 'admin.dashboard.orders.status.shipped',
    shippingStatusTone: 'info',
  },
  {
    id: '2',
    orderNumber: 'ORD_0002',
    orderDate: '18 Apr, 2025 | 11:20 AM',
    customerName: 'Jane Doe',
    productName: 'Smart Watch Pro',
    productBrand: 'by: TechBrand',
    quantity: 1,
    paymentAmountCents: 29999,
    paymentStatusKey: 'admin.dashboard.orders.status.failed',
    paymentStatusTone: 'danger',
    orderStatusKey: 'admin.dashboard.orders.status.pending',
    orderStatusTone: 'warning',
    shippingStatusKey: 'admin.dashboard.orders.status.pending',
    shippingStatusTone: 'warning',
  },
  {
    id: '3',
    orderNumber: 'ORD_0003',
    orderDate: '17 Apr, 2025 | 4:15 PM',
    customerName: 'Mike Johnson',
    productName: 'Wireless Headphones',
    productBrand: 'by: AudioMax',
    quantity: 3,
    paymentAmountCents: 8997,
    paymentStatusKey: 'admin.dashboard.orders.status.paid',
    paymentStatusTone: 'success',
    orderStatusKey: 'admin.dashboard.orders.status.confirmed',
    orderStatusTone: 'success',
    shippingStatusKey: 'admin.dashboard.orders.status.shipped',
    shippingStatusTone: 'info',
  },
  {
    id: '4',
    orderNumber: 'ORD_0004',
    orderDate: '17 Apr, 2025 | 2:30 PM',
    customerName: 'Sarah Wilson',
    productName: 'Bluetooth Speaker',
    productBrand: 'by: SoundWave',
    quantity: 1,
    paymentAmountCents: 7999,
    paymentStatusKey: 'admin.dashboard.orders.status.refunded',
    paymentStatusTone: 'neutral',
    orderStatusKey: 'admin.dashboard.orders.status.cancelled',
    orderStatusTone: 'danger',
    shippingStatusKey: 'admin.dashboard.orders.status.returned',
    shippingStatusTone: 'neutral',
  },
  {
    id: '5',
    orderNumber: 'ORD_0005',
    orderDate: '16 Apr, 2025 | 9:45 AM',
    customerName: 'Tom Brown',
    productName: 'Laptop Stand',
    productBrand: 'by: ErgoDesk',
    quantity: 2,
    paymentAmountCents: 5998,
    paymentStatusKey: 'admin.dashboard.orders.status.paid',
    paymentStatusTone: 'success',
    orderStatusKey: 'admin.dashboard.orders.status.confirmed',
    orderStatusTone: 'success',
    shippingStatusKey: 'admin.dashboard.orders.status.pending',
    shippingStatusTone: 'warning',
  },
];

export const productSalesTotalCents = productSalesData.reduce(
  (sum, item) => sum + item.value,
  0,
);
