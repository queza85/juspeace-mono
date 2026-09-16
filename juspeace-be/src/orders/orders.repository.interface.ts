import {
  Order,
  OrderFulfillmentStatus,
  OrderLineItem,
  OrderPaymentStatus,
  OrderShippingStatus,
  OrderStatusEvent,
} from '@prisma/client';

export type OrderWithRelations = Order & {
  lineItems: OrderLineItem[];
  statusEvents: OrderStatusEvent[];
};

export interface ListOrdersOptions {
  search?: string;
  paymentStatus?: OrderPaymentStatus;
  fulfillmentStatus?: OrderFulfillmentStatus;
  shippingStatus?: OrderShippingStatus;
  limit?: number;
  offset?: number;
}

export interface IOrdersRepository {
  findMany(options: ListOrdersOptions): Promise<OrderWithRelations[]>;
  count(options: ListOrdersOptions): Promise<number>;
  findById(id: string): Promise<OrderWithRelations | null>;
  getStats(): Promise<{
    totalOrders: number;
    paidOrders: number;
    awaitingShipment: number;
    completedOrders: number;
  }>;
  updateStatus(
    id: string,
    fulfillmentStatus: OrderFulfillmentStatus,
    note?: string,
    timestamps?: {
      shippedAt?: Date;
      cancelledAt?: Date;
    },
  ): Promise<OrderWithRelations>;
  updateTracking(
    id: string,
    trackingNumber: string,
    shippingStatus: OrderShippingStatus,
    shippedAt?: Date,
  ): Promise<OrderWithRelations>;
  cancel(id: string, note?: string): Promise<OrderWithRelations>;
  refund(
    id: string,
    refundAmountCents: number,
    note?: string,
  ): Promise<OrderWithRelations>;
}

export const ORDERS_REPOSITORY = Symbol('ORDERS_REPOSITORY');
