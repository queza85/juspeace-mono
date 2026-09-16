import { Product, ProductStatus } from '@prisma/client';

export interface ListProductsOptions {
  status?: ProductStatus;
  categorySlug?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreateProductInput {
  slug: string;
  name: string;
  description?: string | null;
  priceCents: number;
  currency?: string;
  stock: number;
  status: ProductStatus;
  imageUrl?: string | null;
  brand?: string | null;
  tags?: string[];
  discountType?: 'PERCENTAGE' | 'FIXED' | null;
  discountValueCents?: number | null;
  categoryId?: string | null;
}

export interface UpdateProductInput {
  name?: string;
  description?: string | null;
  priceCents?: number;
  currency?: string;
  stock?: number;
  status?: ProductStatus;
  imageUrl?: string | null;
  brand?: string | null;
  tags?: string[];
  discountType?: 'PERCENTAGE' | 'FIXED' | null;
  discountValueCents?: number | null;
  categoryId?: string | null;
}

export interface CreateProductVariantInput {
  productId: string;
  sku: string;
  variationLabel: string;
  variationKey: string;
  initialStock: number;
  availableStock: number;
}

export interface IProductsRepository {
  findMany(options: ListProductsOptions): Promise<Product[]>;
  count(options: ListProductsOptions): Promise<number>;
  findBySlug(slug: string): Promise<Product | null>;
  findById(id: string): Promise<Product | null>;
  findCategoryBySlug(
    slug: string,
  ): Promise<{ id: string; slug: string } | null>;
  create(input: CreateProductInput): Promise<Product>;
  update(id: string, input: UpdateProductInput): Promise<Product>;
  createVariant(input: CreateProductVariantInput): Promise<{ id: string }>;
  slugExists(slug: string): Promise<boolean>;
}

export const PRODUCTS_REPOSITORY = Symbol('PRODUCTS_REPOSITORY');
