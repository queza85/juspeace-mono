import { Injectable } from '@nestjs/common';
import {
  OrderCancellationStatus,
  OrderFulfillmentStatus,
  OrderPaymentStatus,
  OrderRefundStatus,
  OrderShippingStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  IOrdersRepository,
  ListOrdersOptions,
  OrderWithRelations,
} from './orders.repository.interface';

const orderInclude = {
  lineItems: true,
  statusEvents: { orderBy: { createdAt: 'asc' } },
} satisfies Prisma.OrderInclude;

@Injectable()
export class PrismaOrdersRepository implements IOrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(options: ListOrdersOptions): Promise<OrderWithRelations[]> {
    return this.prisma.order.findMany({
      where: this.buildWhere(options),
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
      take: options.limit,
      skip: options.offset,
    });
  }

  async count(options: ListOrdersOptions): Promise<number> {
    return this.prisma.order.count({ where: this.buildWhere(options) });
  }

  async findById(id: string): Promise<OrderWithRelations | null> {
    return this.prisma.order.findUnique({
      where: { id },
      include: orderInclude,
    });
  }

  async getStats() {
    const [totalOrders, paidOrders, awaitingShipment, completedOrders] =
      await Promise.all([
        this.prisma.order.count(),
        this.prisma.order.count({
          where: { paymentStatus: OrderPaymentStatus.PAID },
        }),
        this.prisma.order.count({
          where: {
            paymentStatus: OrderPaymentStatus.PAID,
            fulfillmentStatus: {
              in: [
                OrderFulfillmentStatus.PENDING,
                OrderFulfillmentStatus.CONFIRMED,
              ],
            },
            shippingStatus: OrderShippingStatus.PENDING,
          },
        }),
        this.prisma.order.count({
          where: {
            fulfillmentStatus: OrderFulfillmentStatus.DELIVERED,
          },
        }),
      ]);

    return { totalOrders, paidOrders, awaitingShipment, completedOrders };
  }

  async updateStatus(
    id: string,
    fulfillmentStatus: OrderFulfillmentStatus,
    note?: string,
    timestamps?: { shippedAt?: Date; cancelledAt?: Date },
  ): Promise<OrderWithRelations> {
    return this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id },
        data: {
          fulfillmentStatus,
          shippedAt: timestamps?.shippedAt,
          cancelledAt: timestamps?.cancelledAt,
          cancellationStatus:
            fulfillmentStatus === OrderFulfillmentStatus.CANCELLED
              ? OrderCancellationStatus.CANCELLED
              : undefined,
          shippingStatus:
            fulfillmentStatus === OrderFulfillmentStatus.SHIPPED
              ? OrderShippingStatus.SHIPPED
              : fulfillmentStatus === OrderFulfillmentStatus.DELIVERED
                ? OrderShippingStatus.DELIVERED
                : undefined,
        },
      });

      await tx.orderStatusEvent.create({
        data: {
          orderId: id,
          status: fulfillmentStatus,
          note,
        },
      });

      return tx.order.findUniqueOrThrow({
        where: { id },
        include: orderInclude,
      });
    });
  }

  async updateTracking(
    id: string,
    trackingNumber: string,
    shippingStatus: OrderShippingStatus,
    shippedAt?: Date,
  ): Promise<OrderWithRelations> {
    return this.prisma.order.update({
      where: { id },
      data: {
        trackingNumber,
        shippingStatus,
        shippedAt,
        fulfillmentStatus:
          shippingStatus === OrderShippingStatus.SHIPPED
            ? OrderFulfillmentStatus.SHIPPED
            : undefined,
      },
      include: orderInclude,
    });
  }

  async cancel(id: string, note?: string): Promise<OrderWithRelations> {
    return this.updateStatus(id, OrderFulfillmentStatus.CANCELLED, note, {
      cancelledAt: new Date(),
    });
  }

  async refund(
    id: string,
    refundAmountCents: number,
    note?: string,
  ): Promise<OrderWithRelations> {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUniqueOrThrow({ where: { id } });

      const refundStatus =
        refundAmountCents >= order.totalCents
          ? OrderRefundStatus.REFUNDED
          : OrderRefundStatus.PARTIAL;

      const paymentStatus =
        refundStatus === OrderRefundStatus.REFUNDED
          ? OrderPaymentStatus.REFUNDED
          : OrderPaymentStatus.PARTIAL_REFUND;

      await tx.order.update({
        where: { id },
        data: {
          refundAmountCents,
          refundStatus,
          paymentStatus,
          refundedAt: new Date(),
          internalNote: note ?? order.internalNote,
        },
      });

      return tx.order.findUniqueOrThrow({
        where: { id },
        include: orderInclude,
      });
    });
  }

  private buildWhere(options: ListOrdersOptions): Prisma.OrderWhereInput {
    const search = options.search?.trim();

    return {
      paymentStatus: options.paymentStatus,
      fulfillmentStatus: options.fulfillmentStatus,
      shippingStatus: options.shippingStatus,
      OR: search
        ? [
            { orderNumber: { contains: search, mode: 'insensitive' } },
            { customerName: { contains: search, mode: 'insensitive' } },
            { customerEmail: { contains: search, mode: 'insensitive' } },
            { trackingNumber: { contains: search, mode: 'insensitive' } },
          ]
        : undefined,
    };
  }
}
