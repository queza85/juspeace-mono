import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  IInventoryRepository,
  ListInventoryOptions,
  VariantWithProduct,
} from './inventory.repository.interface';

const variantInclude = {
  product: {
    select: {
      name: true,
      slug: true,
      brand: true,
    },
  },
} satisfies Prisma.ProductVariantInclude;

@Injectable()
export class PrismaInventoryRepository implements IInventoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findManyVariants(
    options: ListInventoryOptions,
  ): Promise<VariantWithProduct[]> {
    return this.prisma.productVariant.findMany({
      where: this.buildWhere(options),
      include: variantInclude,
      orderBy: { updatedAt: 'desc' },
      take: options.limit,
      skip: options.offset,
    });
  }

  async countVariants(options: ListInventoryOptions): Promise<number> {
    return this.prisma.productVariant.count({
      where: this.buildWhere(options),
    });
  }

  async findVariantById(id: string): Promise<VariantWithProduct | null> {
    return this.prisma.productVariant.findUnique({
      where: { id },
      include: variantInclude,
    });
  }

  private buildWhere(
    options: ListInventoryOptions,
  ): Prisma.ProductVariantWhereInput {
    const search = options.search?.trim();

    if (!search) {
      return {};
    }

    return {
      OR: [
        { sku: { contains: search, mode: 'insensitive' } },
        { variationLabel: { contains: search, mode: 'insensitive' } },
        { product: { name: { contains: search, mode: 'insensitive' } } },
        { product: { slug: { contains: search, mode: 'insensitive' } } },
      ],
    };
  }
}
