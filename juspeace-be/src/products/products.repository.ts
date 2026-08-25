import { Injectable } from '@nestjs/common';
import { Prisma, Product, ProductStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  IProductsRepository,
  ListProductsOptions,
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

  private buildWhere(options: ListProductsOptions): Prisma.ProductWhereInput {
    return {
      status: options.status,
      category: options.categorySlug
        ? { slug: options.categorySlug }
        : undefined,
    };
  }
}
