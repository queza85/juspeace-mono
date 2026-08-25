import { apiRequest } from './client';
import type { PaginatedProducts, Product } from './types';

export interface ListProductsParams {
  status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  category?: string;
  limit?: number;
  offset?: number;
}

export function listProducts(params: ListProductsParams = {}) {
  return apiRequest<PaginatedProducts>('/products', {
    params: {
      status: params.status ?? 'ACTIVE',
      category: params.category,
      limit: params.limit ?? 12,
      offset: params.offset ?? 0,
    },
  });
}

export function getProductBySlug(slug: string) {
  return apiRequest<Product>(`/products/${slug}`, {
    next: { revalidate: 60 },
  });
}

export function getHealthStatus() {
  return apiRequest<{ status: string }>('/health', {
    next: { revalidate: 0 },
  });
}
