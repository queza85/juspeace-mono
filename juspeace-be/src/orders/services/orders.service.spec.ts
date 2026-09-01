import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  OrderCancellationStatus,
  OrderFulfillmentStatus,
  OrderPaymentStatus,
  OrderRefundStatus,
  OrderShippingStatus,
} from '@prisma/client';
import { OrdersService } from './orders.service';
import type {
  IOrdersRepository,
  OrderWithRelations,
} from '../orders.repository.interface';

function buildOrder(
  overrides: Partial<OrderWithRelations> = {},
): OrderWithRelations {
  return {
    id: 'order-1',
    orderNumber: 'ORD-00001',
    customerName: 'Sophie',
    customerEmail: 'sophie@example.com',
    customerPhone: '+959882612581',
    countryCode: 'MM',
    shippingRecipient: 'Sophie',
    shippingAddress: '21 Yadanar st.',
    paymentMethod: 'card',
    paymentProvider: 'KBZPay',
    paymentTransactionNumber: '332178666',
    paymentStatus: OrderPaymentStatus.PAID,
    fulfillmentStatus: OrderFulfillmentStatus.CONFIRMED,
    shippingStatus: OrderShippingStatus.PENDING,
    trackingNumber: null,
    subtotalCents: 4998,
    totalCents: 4998,
    currency: 'USD',
    internalNote: null,
    customerNote: null,
    cancellationStatus: OrderCancellationStatus.NOT_CANCELLED,
    refundStatus: OrderRefundStatus.NOT_REFUNDED,
    refundAmountCents: 0,
    pgTransactionId: '9459489493',
    pgProvider: 'Malaysian Payment Gateway',
    pgResponse: 'success',
    pgStatus: 'completed',
    paidAt: new Date('2026-08-25T03:31:00.000Z'),
    shippedAt: null,
    cancelledAt: null,
    refundedAt: null,
    pgPaidAt: new Date('2026-08-25T03:31:00.000Z'),
    saleId: null,
    createdAt: new Date('2026-08-25T02:46:00.000Z'),
    updatedAt: new Date('2026-08-25T03:31:00.000Z'),
    lineItems: [
      {
        id: 'line-1',
        orderId: 'order-1',
        productId: 'product-1',
        productVariantId: 'variant-1',
        productName: 'Organic Cotton Tote',
        productSlug: 'organic-cotton-tote',
        productBrand: 'Juspeace',
        quantity: 2,
        unitPriceCents: 2499,
        createdAt: new Date('2026-08-25T02:46:00.000Z'),
        updatedAt: new Date('2026-08-25T02:46:00.000Z'),
      },
    ],
    statusEvents: [
      {
        id: 'event-1',
        orderId: 'order-1',
        status: OrderFulfillmentStatus.PENDING,
        note: 'Order placed',
        createdAt: new Date('2026-08-25T02:46:00.000Z'),
      },
      {
        id: 'event-2',
        orderId: 'order-1',
        status: OrderFulfillmentStatus.CONFIRMED,
        note: 'Payment confirmed',
        createdAt: new Date('2026-08-25T03:31:00.000Z'),
      },
    ],
    ...overrides,
  };
}

describe('OrdersService', () => {
  let repository: jest.Mocked<IOrdersRepository>;
  let service: OrdersService;

  beforeEach(() => {
    repository = {
      findMany: jest.fn(),
      count: jest.fn(),
      findById: jest.fn(),
      getStats: jest.fn(),
      updateStatus: jest.fn(),
      updateTracking: jest.fn(),
      cancel: jest.fn(),
      refund: jest.fn(),
    };

    service = new OrdersService(repository);
  });

  it('throws when order is not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.findById('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('maps list item with UTC createdAt ISO string', async () => {
    repository.findMany.mockResolvedValue([buildOrder()]);
    repository.count.mockResolvedValue(1);

    const result = await service.list({ limit: 20, offset: 0 });

    expect(result.items[0].createdAt).toBe('2026-08-25T02:46:00.000Z');
    expect(result.items[0].paymentAmountCents).toBe(4998);
  });

  it('rejects refund above order total', async () => {
    repository.findById.mockResolvedValue(buildOrder());

    await expect(
      service.refund('order-1', { refundAmountCents: 99999 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('cancels order through repository', async () => {
    const cancelled = buildOrder({
      fulfillmentStatus: OrderFulfillmentStatus.CANCELLED,
      cancellationStatus: OrderCancellationStatus.CANCELLED,
    });

    repository.findById.mockResolvedValue(buildOrder());
    repository.cancel.mockResolvedValue(cancelled);

    const result = await service.cancel('order-1', {
      note: 'Customer request',
    });

    expect(repository.cancel.mock.calls[0]).toEqual([
      'order-1',
      'Customer request',
    ]);
    expect(result.orderStatus).toBe(OrderFulfillmentStatus.CANCELLED);
  });
});
