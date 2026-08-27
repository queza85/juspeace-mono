import type { Response } from 'express';

export interface RefreshCookieOptions {
  cookieName: string;
  cookieSecure: boolean;
}

const AUTH_COOKIE_PATH = '/api/v1/auth';

export function setRefreshCookie(
  res: Response,
  refreshToken: string,
  maxAgeMs: number,
  options: RefreshCookieOptions,
): void {
  res.cookie(options.cookieName, refreshToken, {
    httpOnly: true,
    secure: options.cookieSecure,
    sameSite: 'strict',
    path: AUTH_COOKIE_PATH,
    maxAge: maxAgeMs,
  });
}

export function clearRefreshCookie(
  res: Response,
  options: RefreshCookieOptions,
): void {
  res.clearCookie(options.cookieName, {
    httpOnly: true,
    secure: options.cookieSecure,
    sameSite: 'strict',
    path: AUTH_COOKIE_PATH,
  });
}
