import { NotFoundException, NotImplementedException } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import type { IInventoryRepository } from '../inventory.repository.interface';

describe('InventoryService', () => {
  const variant = {
    id: 'variant-1',
    productId: 'product-1',
    sku: 'JP-001',
    variationLabel: 'Standard',
    variationKey: 'standard',
    initialStock: 0,
    availableStock: 0,
    reservedStock: 0,
    soldQuantity: 0,
    cancelledReturned: 0,
    lowStockThreshold: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    product: {
      name: 'Organic Cotton Tote',
      slug: 'organic-cotton-tote',
      brand: 'Juspeace',
    },
  };

  let repository: jest.Mocked<IInventoryRepository>;
  let service: InventoryService;

  beforeEach(() => {
    repository = {
      findManyVariants: jest.fn(),
      countVariants: jest.fn(),
      findVariantById: jest.fn(),
    };

    service = new InventoryService(repository);
  });

  it('throws when variant is missing on detail lookup', async () => {
    repository.findVariantById.mockResolvedValue(null);

    await expect(service.findById('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('returns placeholder stats without stock aggregation', async () => {
    repository.countVariants.mockResolvedValue(3);

    const stats = await service.getStats();

    expect(stats).toEqual({
      totalStock: 0,
      availableStock: 0,
      reservedStock: 0,
      soldQuantity: 0,
      lowStockItems: 0,
      soldOutItems: 0,
      variantCount: 3,
    });
  });

  it('returns empty stock history until calculations are implemented', async () => {
    repository.findVariantById.mockResolvedValue(variant);

    const result = await service.findById('variant-1');

    expect(result.stockHistory).toEqual([]);
    expect(result.stockStatus).toBe('in_stock');
  });

  it('rejects stock adjust until implemented', () => {
    expect(() =>
      service.adjustStock('variant-1', { quantityDelta: 10 }),
    ).toThrow(NotImplementedException);
  });
});
