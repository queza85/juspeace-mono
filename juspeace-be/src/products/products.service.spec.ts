import { BadRequestException } from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import { ProductsService } from './products.service';
import type { IProductsRepository } from './products.repository.interface';
import { PrismaService } from '../prisma/prisma.service';

describe('ProductsService', () => {
  let repository: jest.Mocked<IProductsRepository>;
  let prisma: jest.Mocked<Pick<PrismaService, 'product'>>;
  let service: ProductsService;

  beforeEach(() => {
    repository = {
      findMany: jest.fn(),
      count: jest.fn(),
      findBySlug: jest.fn(),
      findById: jest.fn(),
      findCategoryBySlug: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      createVariant: jest.fn(),
      slugExists: jest.fn(),
    };

    prisma = {
      product: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
      },
    } as unknown as jest.Mocked<Pick<PrismaService, 'product'>>;

    service = new ProductsService(
      repository,
      prisma as unknown as PrismaService,
    );
  });

  it('creates product with default variant', async () => {
    repository.slugExists.mockResolvedValue(false);
    repository.findCategoryBySlug.mockResolvedValue({
      id: 'cat-1',
      slug: 'essentials',
    });
    repository.create.mockResolvedValue({
      id: 'product-1',
      slug: 'organic-cotton-tote',
      name: 'Organic Cotton Tote',
      description: null,
      priceCents: 2499,
      currency: 'USD',
      stock: 120,
      status: ProductStatus.ACTIVE,
      imageUrl: null,
      brand: 'Juspeace',
      tags: [],
      discountType: null,
      discountValueCents: null,
      categoryId: 'cat-1',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    repository.createVariant.mockResolvedValue({ id: 'variant-1' });

    (prisma.product.findUnique as jest.Mock).mockResolvedValue({
      id: 'product-1',
      slug: 'organic-cotton-tote',
      name: 'Organic Cotton Tote',
      description: null,
      priceCents: 2499,
      currency: 'USD',
      stock: 120,
      status: ProductStatus.ACTIVE,
      imageUrl: null,
      brand: 'Juspeace',
      tags: [],
      discountType: null,
      discountValueCents: null,
      categoryId: 'cat-1',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      category: { slug: 'essentials' },
    });

    const result = await service.create({
      name: 'Organic Cotton Tote',
      sku: 'JP-TOTE-001',
      stock: 120,
      priceCents: 2499,
      status: ProductStatus.ACTIVE,
      category: 'essentials',
      brand: 'Juspeace',
    });

    expect(repository.create.mock.calls.length).toBe(1);
    expect(repository.createVariant.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        sku: 'JP-TOTE-001',
        availableStock: 0,
      }),
    );
    expect(result.categorySlug).toBe('essentials');
  });

  it('throws when category slug is unknown', async () => {
    repository.slugExists.mockResolvedValue(false);
    repository.findCategoryBySlug.mockResolvedValue(null);

    await expect(
      service.create({
        name: 'Unknown Category Product',
        sku: 'JP-001',
        stock: 1,
        priceCents: 100,
        status: ProductStatus.DRAFT,
        category: 'missing',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
