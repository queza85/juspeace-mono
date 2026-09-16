import {
  Inject,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import type { IInventoryRepository } from '../inventory.repository.interface';
import { INVENTORY_REPOSITORY } from '../inventory.repository.interface';
import type { VariantWithProduct } from '../inventory.repository.interface';
import {
  AdjustInventoryStockDto,
  InventoryDetailResponseDto,
  InventoryListItemDto,
  InventoryStatsResponseDto,
  ListInventoryQueryDto,
  PaginatedInventoryResponseDto,
  UpdateInventoryThresholdDto,
} from '../dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: IInventoryRepository,
  ) {}

  async list(
    query: ListInventoryQueryDto,
  ): Promise<PaginatedInventoryResponseDto> {
    const options = {
      search: query.search,
      limit: query.limit,
      offset: query.offset,
    };

    const [items, total] = await Promise.all([
      this.inventoryRepository.findManyVariants(options),
      this.inventoryRepository.countVariants(options),
    ]);

    return {
      items: items.map((item) => this.toListItem(item)),
      total,
      limit: query.limit ?? 20,
      offset: query.offset ?? 0,
    };
  }

  async getStats(): Promise<InventoryStatsResponseDto> {
    const variantCount = await this.inventoryRepository.countVariants({});

    return {
      totalStock: 0,
      availableStock: 0,
      reservedStock: 0,
      soldQuantity: 0,
      lowStockItems: 0,
      soldOutItems: 0,
      variantCount,
    };
  }

  async findById(id: string): Promise<InventoryDetailResponseDto> {
    const variant = await this.inventoryRepository.findVariantById(id);

    if (!variant) {
      throw new NotFoundException('INVENTORY_VARIANT_NOT_FOUND');
    }

    return {
      ...this.toListItem(variant),
      lowStockThreshold: variant.lowStockThreshold,
      stockHistory: [],
    };
  }

  adjustStock(
    id: string,
    dto: AdjustInventoryStockDto,
  ): Promise<InventoryDetailResponseDto> {
    void id;
    void dto;
    throw new NotImplementedException('INVENTORY_STOCK_ADJUST_NOT_IMPLEMENTED');
  }

  updateThreshold(
    id: string,
    dto: UpdateInventoryThresholdDto,
  ): Promise<InventoryDetailResponseDto> {
    void id;
    void dto;
    throw new NotImplementedException(
      'INVENTORY_THRESHOLD_UPDATE_NOT_IMPLEMENTED',
    );
  }

  private toListItem(variant: VariantWithProduct): InventoryListItemDto {
    return {
      id: variant.id,
      productName: variant.product.name,
      productSlug: variant.product.slug,
      productBrand: variant.product.brand,
      variation: variant.variationLabel,
      variationKey: variant.variationKey,
      sku: variant.sku,
      initialStock: variant.initialStock,
      availableStock: variant.availableStock,
      reservedStock: variant.reservedStock,
      soldQuantity: variant.soldQuantity,
      cancelledReturned: variant.cancelledReturned,
      stockStatus: 'in_stock',
    };
  }
}
