import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Product, ProductStatus } from '@prisma/client';
import { slugify } from '../common/utils/slug.util';
import { PrismaService } from '../prisma/prisma.service';
import type {
  IProductsRepository,
  ListProductsOptions,
} from './products.repository.interface';
import { PRODUCTS_REPOSITORY } from './products.repository.interface';
import {
  AdminProductStatsResponseDto,
  CreateProductDto,
  ListProductsQueryDto,
  PaginatedProductsResponseDto,
  ProductResponseDto,
  UpdateProductDto,
} from './dto/product.dto';

type ProductWithCategory = Product & {
  category?: { slug: string } | null;
};

@Injectable()
export class ProductsService {
  constructor(
    @Inject(PRODUCTS_REPOSITORY)
    private readonly productsRepository: IProductsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async list(
    query: ListProductsQueryDto,
  ): Promise<PaginatedProductsResponseDto> {
    const options: ListProductsOptions = {
      status: query.status,
      categorySlug: query.category,
      search: query.search,
      limit: query.limit,
      offset: query.offset,
    };

    const [products, total] = await Promise.all([
      this.findManyWithCategory(options),
      this.productsRepository.count(options),
    ]);

    return {
      items: products.map((product) => this.toResponse(product)),
      total,
      limit: query.limit ?? 20,
      offset: query.offset ?? 0,
    };
  }

  async findBySlug(slug: string): Promise<ProductResponseDto> {
    const product = await this.findBySlugWithCategory(slug);

    if (!product) {
      throw new NotFoundException('PRODUCT_NOT_FOUND');
    }

    return this.toResponse(product);
  }

  async create(dto: CreateProductDto): Promise<ProductResponseDto> {
    const slug = await this.resolveUniqueSlug(dto.name);
    const categoryId = dto.category
      ? await this.resolveCategoryId(dto.category)
      : null;

    const product = await this.productsRepository.create({
      slug,
      name: dto.name.trim(),
      description: dto.description?.trim() || null,
      priceCents: dto.priceCents,
      currency: dto.currency ?? 'USD',
      stock: dto.stock,
      status: dto.status,
      imageUrl: dto.imageUrl ?? null,
      brand: dto.brand?.trim() || null,
      tags: dto.tags ?? [],
      discountType: dto.discountType ?? null,
      discountValueCents: dto.discountValueCents ?? null,
      categoryId,
    });

    const variationLabel = dto.variationLabel?.trim() || 'Standard';
    await this.productsRepository.createVariant({
      productId: product.id,
      sku: dto.sku.trim(),
      variationLabel,
      variationKey: slugify(variationLabel) || 'standard',
      initialStock: 0,
      availableStock: 0,
    });

    const created = await this.findBySlugWithCategory(product.slug);
    return this.toResponse(created!);
  }

  async update(
    slug: string,
    dto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const existing = await this.productsRepository.findBySlug(slug);

    if (!existing) {
      throw new NotFoundException('PRODUCT_NOT_FOUND');
    }

    const categoryId =
      dto.category !== undefined
        ? dto.category
          ? await this.resolveCategoryId(dto.category)
          : null
        : undefined;

    await this.productsRepository.update(existing.id, {
      name: dto.name?.trim(),
      description: dto.description?.trim(),
      priceCents: dto.priceCents,
      currency: dto.currency,
      stock: dto.stock,
      status: dto.status,
      imageUrl: dto.imageUrl,
      brand: dto.brand?.trim(),
      tags: dto.tags,
      discountType: dto.discountType,
      discountValueCents: dto.discountValueCents,
      categoryId,
    });

    const updated = await this.findBySlugWithCategory(slug);
    return this.toResponse(updated!);
  }

  async archive(slug: string): Promise<ProductResponseDto> {
    return this.update(slug, { status: ProductStatus.ARCHIVED });
  }

  async getAdminStats(): Promise<AdminProductStatsResponseDto> {
    const [totalProducts, activeProducts, draftProducts, archivedProducts] =
      await Promise.all([
        this.prisma.product.count(),
        this.prisma.product.count({ where: { status: ProductStatus.ACTIVE } }),
        this.prisma.product.count({ where: { status: ProductStatus.DRAFT } }),
        this.prisma.product.count({
          where: { status: ProductStatus.ARCHIVED },
        }),
      ]);

    return { totalProducts, activeProducts, draftProducts, archivedProducts };
  }

  private async findManyWithCategory(
    options: ListProductsOptions,
  ): Promise<ProductWithCategory[]> {
    return this.prisma.product.findMany({
      where: {
        status: options.status,
        category: options.categorySlug
          ? { slug: options.categorySlug }
          : undefined,
        OR: options.search?.trim()
          ? [
              {
                name: { contains: options.search.trim(), mode: 'insensitive' },
              },
              {
                slug: { contains: options.search.trim(), mode: 'insensitive' },
              },
              {
                brand: { contains: options.search.trim(), mode: 'insensitive' },
              },
            ]
          : undefined,
      },
      include: { category: { select: { slug: true } } },
      orderBy: { createdAt: 'desc' },
      take: options.limit,
      skip: options.offset,
    });
  }

  private async findBySlugWithCategory(
    slug: string,
  ): Promise<ProductWithCategory | null> {
    return this.prisma.product.findUnique({
      where: { slug },
      include: { category: { select: { slug: true } } },
    });
  }

  private async resolveCategoryId(categorySlug: string): Promise<string> {
    const category =
      await this.productsRepository.findCategoryBySlug(categorySlug);

    if (!category) {
      throw new BadRequestException('CATEGORY_NOT_FOUND');
    }

    return category.id;
  }

  private async resolveUniqueSlug(name: string): Promise<string> {
    const base = slugify(name) || 'product';
    let candidate = base;
    let suffix = 1;

    while (await this.productsRepository.slugExists(candidate)) {
      suffix += 1;
      candidate = `${base}-${suffix}`;
    }

    return candidate;
  }

  private toResponse(product: ProductWithCategory): ProductResponseDto {
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
      brand: product.brand,
      tags: product.tags,
      categorySlug: product.category?.slug ?? null,
    };
  }
}
