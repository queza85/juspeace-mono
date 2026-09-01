import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import {
  OrderFulfillmentStatus,
  OrderPaymentStatus,
  OrderShippingStatus,
} from '@prisma/client';

export class ListOrdersQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: OrderPaymentStatus })
  @IsOptional()
  @IsEnum(OrderPaymentStatus)
  paymentStatus?: OrderPaymentStatus;

  @ApiPropertyOptional({ enum: OrderFulfillmentStatus })
  @IsOptional()
  @IsEnum(OrderFulfillmentStatus)
  fulfillmentStatus?: OrderFulfillmentStatus;

  @ApiPropertyOptional({ enum: OrderShippingStatus })
  @IsOptional()
  @IsEnum(OrderShippingStatus)
  shippingStatus?: OrderShippingStatus;

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

export class OrderLineItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  productName!: string;

  @ApiProperty()
  productSlug!: string;

  @ApiPropertyOptional()
  productBrand?: string | null;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  unitPriceCents!: number;
}

export class OrderStatusHistoryDto {
  @ApiProperty({ enum: OrderFulfillmentStatus })
  status!: OrderFulfillmentStatus;

  @ApiPropertyOptional()
  createdAt?: string;

  @ApiProperty()
  completed!: boolean;
}

export class OrderListItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  orderNumber!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  customerName!: string;

  @ApiProperty()
  countryCode!: string;

  @ApiProperty()
  productName!: string;

  @ApiProperty()
  productSlug!: string;

  @ApiPropertyOptional()
  productBrand?: string | null;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  paymentAmountCents!: number;

  @ApiProperty({ enum: OrderPaymentStatus })
  paymentStatus!: OrderPaymentStatus;

  @ApiProperty({ enum: OrderFulfillmentStatus })
  orderStatus!: OrderFulfillmentStatus;

  @ApiProperty({ enum: OrderShippingStatus })
  shippingStatus!: OrderShippingStatus;

  @ApiPropertyOptional()
  trackingNumber?: string | null;
}

export class PaginatedOrdersResponseDto {
  @ApiProperty({ type: [OrderListItemDto] })
  items!: OrderListItemDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  offset!: number;
}

export class OrderStatsResponseDto {
  @ApiProperty()
  totalOrders!: number;

  @ApiProperty()
  paidOrders!: number;

  @ApiProperty()
  awaitingShipment!: number;

  @ApiProperty()
  completedOrders!: number;
}

export class OrderDetailResponseDto extends OrderListItemDto {
  @ApiProperty()
  totalAmountCents!: number;

  @ApiProperty()
  unitPriceCents!: number;

  @ApiProperty()
  subtotalCents!: number;

  @ApiProperty()
  customerEmail!: string;

  @ApiPropertyOptional()
  customerPhone?: string | null;

  @ApiPropertyOptional()
  shippingRecipient?: string | null;

  @ApiPropertyOptional()
  shippingAddress?: string | null;

  @ApiPropertyOptional()
  paymentMethod?: string | null;

  @ApiPropertyOptional()
  paymentProvider?: string | null;

  @ApiPropertyOptional()
  paymentTransactionNumber?: string | null;

  @ApiPropertyOptional()
  pgTransactionId?: string | null;

  @ApiPropertyOptional()
  pgProvider?: string | null;

  @ApiPropertyOptional()
  pgPaidAt?: string | null;

  @ApiPropertyOptional()
  pgResponse?: string | null;

  @ApiPropertyOptional()
  pgStatus?: string | null;

  @ApiProperty({ type: [OrderStatusHistoryDto] })
  statusHistory!: OrderStatusHistoryDto[];

  @ApiProperty({ type: [String] })
  trackingEntries!: string[];

  @ApiPropertyOptional()
  internalNote?: string | null;

  @ApiPropertyOptional()
  customerNote?: string | null;

  @ApiProperty()
  cancellationStatus!: string;

  @ApiProperty()
  refundStatus!: string;

  @ApiProperty()
  refundAmountCents!: number;

  @ApiProperty({ type: [OrderLineItemDto] })
  lineItems!: OrderLineItemDto[];
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderFulfillmentStatus })
  @IsEnum(OrderFulfillmentStatus)
  fulfillmentStatus!: OrderFulfillmentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateOrderTrackingDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  trackingNumber!: string;

  @ApiPropertyOptional({ enum: OrderShippingStatus })
  @IsOptional()
  @IsEnum(OrderShippingStatus)
  shippingStatus?: OrderShippingStatus;
}

export class CancelOrderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}

export class RefundOrderDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  refundAmountCents!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
