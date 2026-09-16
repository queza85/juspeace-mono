import { apiRequest, apiRequestEnvelope } from './client';
import type {
  AccessTokenResponse,
  AuthTokensResponse,
  AuthUser,
} from './types';

export async function login(email: string, password: string) {
  const envelope = await apiRequestEnvelope<AuthTokensResponse>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    withCredentials: true,
    noStore: true,
    notify: 'both',
  });

  return envelope.data;
}

export function refreshSession() {
  return apiRequest<AccessTokenResponse>('/auth/refresh', {
    method: 'POST',
    withCredentials: true,
    noStore: true,
  });
}

export function getMe(accessToken: string) {
  return apiRequest<AuthUser>('/auth/me', {
    method: 'GET',
    accessToken,
    withCredentials: true,
    noStore: true,
  });
}

export async function logout(accessToken: string) {
  await apiRequestEnvelope<null>('/auth/logout', {
    method: 'POST',
    accessToken,
    withCredentials: true,
    noStore: true,
    notify: 'success',
  });
}
