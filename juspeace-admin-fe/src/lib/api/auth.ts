import { apiRequest, apiRequestEnvelope } from './client';
import type {
  AccessTokenResponse,
  AuthTokensResponse,
  AuthUser,
} from './types';

export async function register(name: string, email: string, password: string) {
  const envelope = await apiRequestEnvelope<AuthUser>('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
    withCredentials: true,
    noStore: true,
    notify: 'success',
  });

  return envelope.data;
}

export async function requestPasswordReset(email: string) {
  const envelope = await apiRequestEnvelope<null>('/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
    withCredentials: true,
    noStore: true,
    notify: 'both',
  });

  return envelope.data;
}

export async function resendPasswordResetCode(email: string) {
  const envelope = await apiRequestEnvelope<null>(
    '/auth/forgot-password/resend',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      withCredentials: true,
      noStore: true,
      notify: 'success',
    },
  );

  return envelope.data;
}

export async function verifyPasswordResetCode(email: string, code: string) {
  const envelope = await apiRequestEnvelope<{ resetToken: string }>(
    '/auth/forgot-password/verify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
      withCredentials: true,
      noStore: true,
      notify: 'error',
    },
  );

  return envelope.data;
}

export async function resetPassword(resetToken: string, password: string) {
  const envelope = await apiRequestEnvelope<null>('/auth/forgot-password/reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resetToken, password }),
    withCredentials: true,
    noStore: true,
    notify: 'success',
  });

  return envelope.data;
}

export async function createTwoFactorChallengeDev(email: string) {
  const envelope = await apiRequestEnvelope<{ challengeToken: string }>(
    '/auth/two-factor/challenge/dev',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      withCredentials: true,
      noStore: true,
      notify: 'both',
    },
  );

  return envelope.data;
}

export async function resendTwoFactorCode(challengeToken: string) {
  const envelope = await apiRequestEnvelope<null>('/auth/two-factor/resend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ challengeToken }),
    withCredentials: true,
    noStore: true,
    notify: 'success',
  });

  return envelope.data;
}

export async function verifyTwoFactorCode(
  challengeToken: string,
  code: string,
) {
  const envelope = await apiRequestEnvelope<AuthTokensResponse>(
    '/auth/two-factor/verify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeToken, code }),
      withCredentials: true,
      noStore: true,
      notify: 'both',
    },
  );

  return envelope.data;
}

export async function login(
  email: string,
  password: string,
  rememberMe = false,
) {
  const envelope = await apiRequestEnvelope<AuthTokensResponse>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, rememberMe }),
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
