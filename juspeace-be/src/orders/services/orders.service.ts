import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderFulfillmentStatus, OrderShippingStatus } from '@prisma/client';
import type {
  IOrdersRepository,
  OrderWithRelations,
} from '../orders.repository.interface';
import { ORDERS_REPOSITORY } from '../orders.repository.interface';
import {
  CancelOrderDto,
  ListOrdersQueryDto,
  OrderDetailResponseDto,
  OrderListItemDto,
  OrderStatsResponseDto,
  PaginatedOrdersResponseDto,
  RefundOrderDto,
  UpdateOrderStatusDto,
  UpdateOrderTrackingDto,
} from '../dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(ORDERS_REPOSITORY)
    private readonly ordersRepository: IOrdersRepository,
  ) {}

  async list(query: ListOrdersQueryDto): Promise<PaginatedOrdersResponseDto> {
    const options = {
      search: query.search,
      paymentStatus: query.paymentStatus,
      fulfillmentStatus: query.fulfillmentStatus,
      shippingStatus: query.shippingStatus,
      limit: query.limit,
      offset: query.offset,
    };

    const [orders, total] = await Promise.all([
      this.ordersRepository.findMany(options),
      this.ordersRepository.count(options),
    ]);

    return {
      items: orders.map((order) => this.toListItem(order)),
      total,
      limit: query.limit ?? 20,
      offset: query.offset ?? 0,
    };
  }

  async getStats(): Promise<OrderStatsResponseDto> {
    return this.ordersRepository.getStats();
  }

  async findById(id: string): Promise<OrderDetailResponseDto> {
    const order = await this.ordersRepository.findById(id);

    if (!order) {
      throw new NotFoundException('ORDER_NOT_FOUND');
    }

    return this.toDetail(order);
  }

  async updateStatus(
    id: string,
    dto: UpdateOrderStatusDto,
  ): Promise<OrderDetailResponseDto> {
    const order = await this.requireOrder(id);

    const timestamps: { shippedAt?: Date; cancelledAt?: Date } = {};

    if (dto.fulfillmentStatus === OrderFulfillmentStatus.SHIPPED) {
      timestamps.shippedAt = new Date();
    }

    if (dto.fulfillmentStatus === OrderFulfillmentStatus.CANCELLED) {
      timestamps.cancelledAt = new Date();
    }

    const updated = await this.ordersRepository.updateStatus(
      order.id,
      dto.fulfillmentStatus,
      dto.note,
      timestamps,
    );

    return this.toDetail(updated);
  }

  async updateTracking(
    id: string,
    dto: UpdateOrderTrackingDto,
  ): Promise<OrderDetailResponseDto> {
    const order = await this.requireOrder(id);
    const shippingStatus = dto.shippingStatus ?? OrderShippingStatus.SHIPPED;
    const shippedAt =
      shippingStatus === OrderShippingStatus.SHIPPED ? new Date() : undefined;

    const updated = await this.ordersRepository.updateTracking(
      order.id,
      dto.trackingNumber,
      shippingStatus,
      shippedAt,
    );

    return this.toDetail(updated);
  }

  async cancel(
    id: string,
    dto: CancelOrderDto,
  ): Promise<OrderDetailResponseDto> {
    const order = await this.requireOrder(id);

    if (order.fulfillmentStatus === OrderFulfillmentStatus.CANCELLED) {
      throw new BadRequestException('ORDER_ALREADY_CANCELLED');
    }

    const updated = await this.ordersRepository.cancel(order.id, dto.note);
    return this.toDetail(updated);
  }

  async refund(
    id: string,
    dto: RefundOrderDto,
  ): Promise<OrderDetailResponseDto> {
    const order = await this.requireOrder(id);

    if (dto.refundAmountCents > order.totalCents) {
      throw new BadRequestException('REFUND_AMOUNT_EXCEEDS_TOTAL');
    }

    const updated = await this.ordersRepository.refund(
      order.id,
      dto.refundAmountCents,
      dto.note,
    );

    return this.toDetail(updated);
  }

  private async requireOrder(id: string): Promise<OrderWithRelations> {
    const order = await this.ordersRepository.findById(id);

    if (!order) {
      throw new NotFoundException('ORDER_NOT_FOUND');
    }

    return order;
  }

  private toListItem(order: OrderWithRelations): OrderListItemDto {
    const primaryLine = order.lineItems[0];

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt.toISOString(),
      customerName: order.customerName,
      countryCode: order.countryCode,
      productName: primaryLine?.productName ?? '',
      productSlug: primaryLine?.productSlug ?? '',
      productBrand: primaryLine?.productBrand,
      quantity: primaryLine?.quantity ?? 0,
      paymentAmountCents: order.totalCents,
      paymentStatus: order.paymentStatus,
      orderStatus: order.fulfillmentStatus,
      shippingStatus: order.shippingStatus,
      trackingNumber: order.trackingNumber,
    };
  }

  private toDetail(order: OrderWithRelations): OrderDetailResponseDto {
    const primaryLine = order.lineItems[0];
    const unitPriceCents = primaryLine?.unitPriceCents ?? 0;

    const statusHistory = order.statusEvents.map((event, index, events) => ({
      status: event.status,
      createdAt: event.createdAt.toISOString(),
      completed:
        index < events.length - 1 || event.status === order.fulfillmentStatus,
    }));

    const trackingEntries = order.trackingNumber ? [order.trackingNumber] : [];

    return {
      ...this.toListItem(order),
      totalAmountCents: order.totalCents,
      unitPriceCents,
      subtotalCents: order.subtotalCents,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      shippingRecipient: order.shippingRecipient,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      paymentProvider: order.paymentProvider,
      paymentTransactionNumber: order.paymentTransactionNumber,
      pgTransactionId: order.pgTransactionId,
      pgProvider: order.pgProvider,
      pgPaidAt: order.pgPaidAt?.toISOString() ?? null,
      pgResponse: order.pgResponse,
      pgStatus: order.pgStatus,
      statusHistory,
      trackingEntries,
      internalNote: order.internalNote,
      customerNote: order.customerNote,
      cancellationStatus: order.cancellationStatus,
      refundStatus: order.refundStatus,
      refundAmountCents: order.refundAmountCents,
      lineItems: order.lineItems.map((line) => ({
        id: line.id,
        productName: line.productName,
        productSlug: line.productSlug,
        productBrand: line.productBrand,
        quantity: line.quantity,
        unitPriceCents: line.unitPriceCents,
      })),
    };
  }
}
