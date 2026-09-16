import { apiRequest } from './client';

export function getHealthStatus() {
  return apiRequest<{ status: string }>('/health', {
    method: 'GET',
    noStore: true,
  });
}
