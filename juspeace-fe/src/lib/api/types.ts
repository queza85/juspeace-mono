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
  items: Product[];
  total: number;
  limit: number;
  offset: number;
}

/** Standard API envelope from juspeace-be. */
export interface ApiEnvelope<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  data: unknown;
}

/** @deprecated Prefer ApiErrorBody; kept for transitional typing. */
export type ApiProblem = ApiErrorBody;

export interface HealthStatus {
  status: 'ok' | 'error' | 'shutting_down';
  info?: Record<string, { status: string }>;
  error?: Record<string, { status: string; message?: string }>;
  details?: Record<string, { status: string; message?: string }>;
}

export type UserRole = 'USER' | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokensResponse {
  accessToken: string;
  user: AuthUser;
}

export interface AccessTokenResponse {
  accessToken: string;
}

export interface MessageResponse {
  message: string;
}
