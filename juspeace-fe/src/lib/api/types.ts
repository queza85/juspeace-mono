export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export interface Product {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  priceCents: number;
  currency: string;
  stock: number;
  status: ProductStatus;
  imageUrl?: string | null;
}

export interface PaginatedProducts {
  data: Product[];
  total: number;
  limit: number;
  offset: number;
}

export interface ApiProblem {
  type?: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
}

export interface HealthStatus {
  status: 'ok' | 'error' | 'shutting_down';
  info?: Record<string, { status: string }>;
  error?: Record<string, { status: string; message?: string }>;
  details?: Record<string, { status: string; message?: string }>;
}
