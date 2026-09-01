import { Injectable } from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateProductInput,
  CreateProductVariantInput,
  IProductsRepository,
  ListProductsOptions,
  UpdateProductInput,
} from './products.repository.interface';

@Injectable()
export class PrismaProductsRepository implements IProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(options: ListProductsOptions): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: this.buildWhere(options),
      orderBy: { createdAt: 'desc' },
      take: options.limit,
      skip: options.offset,
    });
  }

  async count(options: ListProductsOptions): Promise<number> {
    return this.prisma.product.count({
      where: this.buildWhere(options),
    });
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return this.prisma.product.findUnique({ where: { slug } });
  }

  async findById(id: string): Promise<Product | null> {
    return this.prisma.product.findUnique({ where: { id } });
  }

  async findCategoryBySlug(
    slug: string,
  ): Promise<{ id: string; slug: string } | null> {
    return this.prisma.category.findUnique({
      where: { slug },
      select: { id: true, slug: true },
    });
  }

  async create(input: CreateProductInput): Promise<Product> {
    return this.prisma.product.create({
      data: {
        slug: input.slug,
        name: input.name,
        description: input.description,
        priceCents: input.priceCents,
        currency: input.currency ?? 'USD',
        stock: input.stock,
        status: input.status,
        imageUrl: input.imageUrl,
        brand: input.brand,
        tags: input.tags ?? [],
        discountType: input.discountType ?? undefined,
        discountValueCents: input.discountValueCents,
        categoryId: input.categoryId,
      },
    });
  }

  async update(id: string, input: UpdateProductInput): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        priceCents: input.priceCents,
        currency: input.currency,
        stock: input.stock,
        status: input.status,
        imageUrl: input.imageUrl,
        brand: input.brand,
        tags: input.tags,
        discountType: input.discountType ?? undefined,
        discountValueCents: input.discountValueCents,
        categoryId: input.categoryId,
      },
    });
  }

  async createVariant(
    input: CreateProductVariantInput,
  ): Promise<{ id: string }> {
    return this.prisma.productVariant.create({
      data: {
        productId: input.productId,
        sku: input.sku,
        variationLabel: input.variationLabel,
        variationKey: input.variationKey,
        initialStock: input.initialStock,
        availableStock: input.availableStock,
      },
      select: { id: true },
    });
  }

  async slugExists(slug: string): Promise<boolean> {
    const count = await this.prisma.product.count({ where: { slug } });
    return count > 0;
  }

  private buildWhere(options: ListProductsOptions): Prisma.ProductWhereInput {
    const search = options.search?.trim();

    return {
      status: options.status,
      category: options.categorySlug
        ? { slug: options.categorySlug }
        : undefined,
      OR: search
        ? [
            { name: { contains: search, mode: 'insensitive' } },
            { slug: { contains: search, mode: 'insensitive' } },
            { brand: { contains: search, mode: 'insensitive' } },
          ]
        : undefined,
    };
  }
}
