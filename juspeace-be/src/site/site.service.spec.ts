import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { DiscountType, PaymentProviderKind } from '@prisma/client';
import { SiteService } from './site.service';
import type { ISiteRepository } from './site.repository.interface';

describe('SiteService', () => {
  let repository: jest.Mocked<ISiteRepository>;
  let service: SiteService;

  beforeEach(() => {
    repository = {
      listContent: jest.fn(),
      findContent: jest.fn(),
      createContent: jest.fn(),
      updateContent: jest.fn(),
      deleteContent: jest.fn(),
      listSettings: jest.fn(),
      findSetting: jest.fn(),
      upsertSetting: jest.fn(),
      listShipping: jest.fn(),
      findShipping: jest.fn(),
      findShippingByCode: jest.fn(),
      createShipping: jest.fn(),
      updateShipping: jest.fn(),
      deleteShipping: jest.fn(),
      listPayments: jest.fn(),
      findPayment: jest.fn(),
      findPaymentByCode: jest.fn(),
      createPayment: jest.fn(),
      updatePayment: jest.fn(),
      deletePayment: jest.fn(),
      listPromotions: jest.fn(),
      findPromotion: jest.fn(),
      findPromotionByCode: jest.fn(),
      createPromotion: jest.fn(),
      updatePromotion: jest.fn(),
      deletePromotion: jest.fn(),
      listReviews: jest.fn(),
      findReview: jest.fn(),
      createReview: jest.fn(),
      updateReview: jest.fn(),
      deleteReview: jest.fn(),
      listCategories: jest.fn(),
      findCategory: jest.fn(),
      findCategoryBySlug: jest.fn(),
      createCategory: jest.fn(),
      updateCategory: jest.fn(),
      deleteCategory: jest.fn(),
      listCustomers: jest.fn(),
      findCustomer: jest.fn(),
      setCustomerActive: jest.fn(),
      listInquiries: jest.fn(),
      findInquiry: jest.fn(),
      createInquiry: jest.fn(),
      updateInquiryStatus: jest.fn(),
      listSubscribers: jest.fn(),
      findSubscriberByEmail: jest.fn(),
      findSubscriber: jest.fn(),
      createSubscriber: jest.fn(),
      deleteSubscriber: jest.fn(),
      findProductById: jest.fn(),
      listFeatured: jest.fn(),
      findFeatured: jest.fn(),
      findFeaturedByProductId: jest.fn(),
      createFeatured: jest.fn(),
      updateFeatured: jest.fn(),
      deleteFeatured: jest.fn(),
    };
    service = new SiteService(repository);
  });

  it('stores payment methods on the dummy provider', async () => {
    repository.findPaymentByCode.mockResolvedValue(null);
    repository.createPayment.mockImplementation((input) =>
      Promise.resolve({
        id: 'pay-1',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        ...input,
        instructions: input.instructions ?? null,
      }),
    );

    await service.createPayment({
      code: 'CARD',
      name: 'Card',
      enabled: true,
    });

    expect(repository.createPayment.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        code: 'CARD',
        provider: PaymentProviderKind.DUMMY,
        enabled: true,
      }),
    );
  });

  it('rejects a percentage promotion outside 1-100', async () => {
    await expect(
      service.createPromotion({
        code: 'HALF',
        name: 'Half off',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 150,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.createPromotion.mock.calls).toHaveLength(0);
  });

  it('rejects a duplicate shipping code', async () => {
    repository.findShippingByCode.mockResolvedValue({
      id: 'ship-1',
      code: 'standard',
      name: 'Standard',
      description: null,
      priceCents: 500,
      currency: 'USD',
      estimatedDays: null,
      enabled: true,
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      service.createShipping({
        code: 'Standard',
        name: 'Standard',
        priceCents: 500,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('returns the existing newsletter subscriber', async () => {
    const existing = {
      id: 'sub-1',
      email: 'buyer@example.com',
      locale: 'en',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    };
    repository.findSubscriberByEmail.mockResolvedValue(existing);

    await expect(
      service.subscribe({ email: 'Buyer@Example.com', locale: 'ko' }),
    ).resolves.toEqual(existing);
    expect(repository.createSubscriber.mock.calls).toHaveLength(0);
  });

  it('stores a contact inquiry as waiting', async () => {
    repository.createInquiry.mockImplementation((input) =>
      Promise.resolve({
        id: 'inq-1',
        status: 'WAITING',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        phone: input.phone ?? null,
        subject: input.subject ?? null,
        locale: input.locale ?? null,
        name: input.name,
        email: input.email,
        message: input.message,
      }),
    );

    await expect(
      service.createInquiry({
        name: '  Ada  ',
        email: 'Ada@Example.com',
        phone: '  ',
        subject: ' Order ',
        message: '  Where is my order?  ',
        locale: 'en',
      }),
    ).resolves.toMatchObject({
      name: 'Ada',
      email: 'ada@example.com',
      phone: null,
      subject: 'Order',
      message: 'Where is my order?',
      status: 'WAITING',
    });
  });

  it('updates a contact inquiry status', async () => {
    repository.findInquiry.mockResolvedValue({
      id: 'inq-1',
      name: 'Ada',
      email: 'ada@example.com',
      phone: null,
      subject: null,
      message: 'Hello',
      locale: 'en',
      status: 'WAITING',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    repository.updateInquiryStatus.mockResolvedValue({
      id: 'inq-1',
      name: 'Ada',
      email: 'ada@example.com',
      phone: null,
      subject: null,
      message: 'Hello',
      locale: 'en',
      status: 'REPLIED',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    await expect(
      service.updateInquiryStatus('inq-1', { status: 'REPLIED' }),
    ).resolves.toMatchObject({ status: 'REPLIED' });
  });

  it('throws when the contact inquiry is missing', async () => {
    repository.findInquiry.mockResolvedValue(null);

    await expect(
      service.updateInquiryStatus('missing', { status: 'REPLIED' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws when the customer is not a storefront user', async () => {
    repository.findCustomer.mockResolvedValue(null);

    await expect(
      service.updateCustomer('admin-1', { isActive: false }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
