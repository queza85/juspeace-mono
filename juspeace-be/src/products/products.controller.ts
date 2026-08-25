import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiMessage } from '../common/decorators/api-message.decorator';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import {
  ListProductsQueryDto,
  PaginatedProductsResponseDto,
  ProductResponseDto,
} from './dto/product.dto';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiMessage('PRODUCTS_RETRIEVED_SUCCESSFULLY')
  @ApiOperation({ summary: 'List products with pagination' })
  @ApiOkResponse({ type: ApiResponseDto })
  list(
    @Query() query: ListProductsQueryDto,
  ): Promise<PaginatedProductsResponseDto> {
    return this.productsService.list(query);
  }

  @Get(':slug')
  @ApiMessage('PRODUCT_RETRIEVED_SUCCESSFULLY')
  @ApiOperation({ summary: 'Get a product by slug' })
  @ApiOkResponse({ type: ApiResponseDto })
  findBySlug(@Param('slug') slug: string): Promise<ProductResponseDto> {
    return this.productsService.findBySlug(slug);
  }
}
