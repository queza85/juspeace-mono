import { Product, ProductStatus } from '@prisma/client';

export interface ListProductsOptions {
  status?: ProductStatus;
  categorySlug?: string;
  limit?: number;
  offset?: number;
}

export interface IProductsRepository {
  findMany(options: ListProductsOptions): Promise<Product[]>;
  count(options: ListProductsOptions): Promise<number>;
  findBySlug(slug: string): Promise<Product | null>;
}

export const PRODUCTS_REPOSITORY = Symbol('PRODUCTS_REPOSITORY');
