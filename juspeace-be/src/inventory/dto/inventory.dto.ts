import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { StockMovementAction } from '@prisma/client';

export type InventoryStockStatus = 'in_stock' | 'low_stock' | 'sold_out';

export class ListInventoryQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['in_stock', 'low_stock', 'sold_out'] })
  @IsOptional()
  @IsString()
  stockStatus?: InventoryStockStatus;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ minimum: 0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}

export class InventoryListItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  productName!: string;

  @ApiProperty()
  productSlug!: string;

  @ApiPropertyOptional()
  productBrand?: string | null;

  @ApiProperty()
  variation!: string;

  @ApiProperty()
  variationKey!: string;

  @ApiProperty()
  sku!: string;

  @ApiProperty()
  initialStock!: number;

  @ApiProperty()
  availableStock!: number;

  @ApiProperty()
  reservedStock!: number;

  @ApiProperty()
  soldQuantity!: number;

  @ApiProperty()
  cancelledReturned!: number;

  @ApiProperty({ enum: ['in_stock', 'low_stock', 'sold_out'] })
  stockStatus!: InventoryStockStatus;
}

export class PaginatedInventoryResponseDto {
  @ApiProperty({ type: [InventoryListItemDto] })
  items!: InventoryListItemDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  offset!: number;
}

export class InventoryStatsResponseDto {
  @ApiProperty()
  totalStock!: number;

  @ApiProperty()
  availableStock!: number;

  @ApiProperty()
  reservedStock!: number;

  @ApiProperty()
  soldQuantity!: number;

  @ApiProperty()
  lowStockItems!: number;

  @ApiProperty()
  soldOutItems!: number;

  @ApiProperty({ description: 'Variant row count (stock KPIs deferred)' })
  variantCount!: number;
}

export class StockHistoryItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty({ enum: StockMovementAction })
  action!: StockMovementAction;

  @ApiProperty()
  quantityDelta!: number;

  @ApiProperty()
  quantityBefore!: number;

  @ApiProperty()
  quantityAfter!: number;

  @ApiPropertyOptional()
  reason?: string | null;
}

export class InventoryDetailResponseDto extends InventoryListItemDto {
  @ApiPropertyOptional()
  lowStockThreshold?: number | null;

  @ApiProperty({ type: [StockHistoryItemDto] })
  stockHistory!: StockHistoryItemDto[];
}

export class AdjustInventoryStockDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  quantityDelta!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  reason?: string;
}

export class UpdateInventoryThresholdDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  lowStockThreshold!: number;
}
