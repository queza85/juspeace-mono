import { apiRequest } from './client';
import type { PaginatedProducts, Product, ProductStatus } from './types';

export interface ListProductsParams {
  status?: ProductStatus;
  category?: string;
  limit?: number;
  offset?: number;
}

export function listProducts(
  params: ListProductsParams = {},
  accessToken?: string,
) {
  return apiRequest<PaginatedProducts>('/products', {
    params: {
      status: params.status,
      category: params.category,
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
    },
    accessToken,
    noStore: true,
  });
}

export function getProductBySlug(slug: string, accessToken?: string) {
  return apiRequest<Product>(`/products/${slug}`, {
    accessToken,
    noStore: true,
  });
}
