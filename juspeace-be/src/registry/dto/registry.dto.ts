import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import {
  CertificateStatus,
  PaymentMethod,
  RegistrationStatus,
  SaleChannel,
  SaleStatus,
  SellerType,
} from '@prisma/client';

export class QuickSaleDto {
  @ApiProperty()
  @IsString()
  productId!: string;

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity?: number = 1;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @ApiPropertyOptional({ enum: SaleChannel, default: SaleChannel.RETAIL })
  @IsOptional()
  @IsEnum(SaleChannel)
  channel?: SaleChannel = SaleChannel.RETAIL;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  locationLabel?: string;
}

export class CompleteOnlineSaleDto {
  @ApiProperty()
  @IsString()
  productId!: string;

  @ApiProperty()
  @IsString()
  authorizedSellerId!: string;

  @ApiProperty()
  @IsEmail()
  customerEmail!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  orderReference!: string;

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity?: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  marketingConsent?: boolean;
}

export class SaleResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  productId!: string;

  @ApiProperty()
  productName!: string;

  @ApiProperty()
  authorizedSellerId!: string;

  @ApiProperty()
  sellerName!: string;

  @ApiProperty()
  marketCode!: string;

  @ApiProperty({ enum: SaleChannel })
  channel!: SaleChannel;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  unitPriceCents!: number;

  @ApiProperty()
  currency!: string;

  @ApiProperty({ enum: PaymentMethod })
  paymentMethod!: PaymentMethod;

  @ApiProperty({ enum: SaleStatus })
  status!: SaleStatus;

  @ApiProperty({ enum: RegistrationStatus })
  registrationStatus!: RegistrationStatus;

  @ApiPropertyOptional()
  orderReference?: string | null;

  @ApiPropertyOptional()
  soldAt?: Date | null;

  @ApiPropertyOptional()
  certificateNo?: string | null;
}

export class QuickSaleResponseDto extends SaleResponseDto {
  @ApiPropertyOptional({
    description:
      'One-time registration token for Transaction QR (offline flow)',
  })
  registrationToken?: string;

  @ApiPropertyOptional({
    description: 'Suggested customer registration URL path',
  })
  registrationPath?: string;
}

export class RegistrationTokenResponseDto {
  @ApiProperty()
  registrationToken!: string;

  @ApiProperty()
  registrationPath!: string;

  @ApiProperty()
  expiresAt!: Date;
}

export class ListSalesQueryDto {
  @ApiPropertyOptional({ enum: SaleStatus })
  @IsOptional()
  @IsEnum(SaleStatus)
  status?: SaleStatus;

  @ApiPropertyOptional({ enum: RegistrationStatus })
  @IsOptional()
  @IsEnum(RegistrationStatus)
  registrationStatus?: RegistrationStatus;

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

export class PaginatedSalesResponseDto {
  @ApiProperty({ type: [SaleResponseDto] })
  items!: SaleResponseDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  offset!: number;
}

export class RegisterPurchaseDto {
  @ApiProperty()
  @IsEmail()
  customerEmail!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  marketingConsent?: boolean = false;
}

export class RegistrationPreviewResponseDto {
  @ApiProperty()
  saleId!: string;

  @ApiProperty()
  sellerName!: string;

  @ApiProperty()
  productName!: string;

  @ApiPropertyOptional()
  locationLabel?: string | null;

  @ApiProperty()
  marketCode!: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty({ enum: RegistrationStatus })
  registrationStatus!: RegistrationStatus;
}

export class RegistrationLookupQueryDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  orderReference!: string;
}

export class CertificateResponseDto {
  @ApiProperty()
  certificateNo!: string;

  @ApiProperty()
  status!: CertificateStatus;

  @ApiProperty()
  productName!: string;

  @ApiPropertyOptional()
  collectionName?: string | null;

  @ApiProperty()
  marketCode!: string;

  @ApiProperty()
  sellerName!: string;

  @ApiProperty({ enum: SaleChannel })
  purchaseChannel!: SaleChannel;

  @ApiProperty()
  registrationDate!: Date;

  @ApiProperty()
  issuedAt!: Date;
}

export class CertificateVerifyResponseDto {
  @ApiProperty()
  certificateNo!: string;

  @ApiProperty({ enum: CertificateStatus })
  status!: CertificateStatus;

  @ApiProperty()
  verified!: boolean;

  @ApiProperty()
  message!: string;
}

export class RegistryDashboardResponseDto {
  @ApiProperty()
  totalSold!: number;

  @ApiProperty()
  registeredCustomers!: number;

  @ApiProperty()
  soldUnregistered!: number;
}

export class AuthorizedSellerResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: SellerType })
  type!: SellerType;

  @ApiProperty()
  marketCode!: string;

  @ApiPropertyOptional()
  locationLabel?: string | null;

  @ApiProperty()
  isActive!: boolean;
}

export class PaginatedCertificatesResponseDto {
  @ApiProperty({ type: [CertificateResponseDto] })
  items!: CertificateResponseDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  offset!: number;
}

export class ListCertificatesQueryDto {
  @ApiPropertyOptional({ enum: CertificateStatus })
  @IsOptional()
  @IsEnum(CertificateStatus)
  status?: CertificateStatus;

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
