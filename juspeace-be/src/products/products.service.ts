import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Product } from '@prisma/client';
import type { IProductsRepository, ListProductsOptions } from './products.repository.interface';
import { PRODUCTS_REPOSITORY } from './products.repository.interface';
import {
  ListProductsQueryDto,
  PaginatedProductsResponseDto,
  ProductResponseDto,
} from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(PRODUCTS_REPOSITORY)
    private readonly productsRepository: IProductsRepository,
  ) {}

  async list(query: ListProductsQueryDto): Promise<PaginatedProductsResponseDto> {
    const options: ListProductsOptions = {
      status: query.status,
      categorySlug: query.category,
      limit: query.limit,
      offset: query.offset,
    };

    const [products, total] = await Promise.all([
      this.productsRepository.findMany(options),
      this.productsRepository.count(options),
    ]);

    return {
      data: products.map((product) => this.toResponse(product)),
      total,
      limit: query.limit ?? 20,
      offset: query.offset ?? 0,
    };
  }

  async findBySlug(slug: string): Promise<ProductResponseDto> {
    const product = await this.productsRepository.findBySlug(slug);

    if (!product) {
      throw new NotFoundException(`Product with slug "${slug}" was not found`);
    }

    return this.toResponse(product);
  }

  private toResponse(product: Product): ProductResponseDto {
    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      priceCents: product.priceCents,
      currency: product.currency,
      stock: product.stock,
      status: product.status,
      imageUrl: product.imageUrl,
    };
  }
}
