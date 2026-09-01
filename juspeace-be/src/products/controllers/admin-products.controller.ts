import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { ApiMessage } from '../../common/decorators/api-message.decorator';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import {
  AdminProductStatsResponseDto,
  CreateProductDto,
  ListProductsQueryDto,
  PaginatedProductsResponseDto,
  ProductResponseDto,
  UpdateProductDto,
} from '../dto/product.dto';
import { ProductsService } from '../products.service';

@ApiTags('admin-products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('stats')
  @ApiMessage('PRODUCT_STATS_RETRIEVED_SUCCESSFULLY')
  @ApiOperation({ summary: 'Product catalog KPI stats' })
  @ApiOkResponse({ type: ApiResponseDto })
  getStats(): Promise<AdminProductStatsResponseDto> {
    return this.productsService.getAdminStats();
  }

  @Get()
  @ApiMessage('PRODUCTS_RETRIEVED_SUCCESSFULLY')
  @ApiOperation({ summary: 'List products (admin)' })
  @ApiOkResponse({ type: ApiResponseDto })
  list(
    @Query() query: ListProductsQueryDto,
  ): Promise<PaginatedProductsResponseDto> {
    return this.productsService.list({ ...query, status: query.status });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiMessage('PRODUCT_CREATED_SUCCESSFULLY')
  @ApiOperation({ summary: 'Create a product with default variant' })
  @ApiOkResponse({ type: ApiResponseDto })
  create(@Body() dto: CreateProductDto): Promise<ProductResponseDto> {
    return this.productsService.create(dto);
  }

  @Patch(':slug')
  @ApiMessage('PRODUCT_UPDATED_SUCCESSFULLY')
  @ApiOperation({ summary: 'Update a product by slug' })
  @ApiOkResponse({ type: ApiResponseDto })
  update(
    @Param('slug') slug: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.update(slug, dto);
  }

  @Delete(':slug')
  @ApiMessage('PRODUCT_ARCHIVED_SUCCESSFULLY')
  @ApiOperation({ summary: 'Archive a product (soft delete)' })
  @ApiOkResponse({ type: ApiResponseDto })
  archive(@Param('slug') slug: string): Promise<ProductResponseDto> {
    return this.productsService.archive(slug);
  }
}
