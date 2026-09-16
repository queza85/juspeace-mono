import {
  defaultLocale,
  isLocale,
  LOCALE_COOKIE,
  type Locale,
} from './config';

export function readLocaleCookie(
  cookieHeader: string | null | undefined,
): Locale {
  if (!cookieHeader) {
    return defaultLocale;
  }

  const match = cookieHeader
    .split('; ')
    .find((row) => row.startsWith(`${LOCALE_COOKIE}=`));
  const value = match?.split('=')[1];
  return isLocale(value) ? value : defaultLocale;
}

export function getBrowserLocaleHint(): Locale {
  if (typeof document === 'undefined') {
    return defaultLocale;
  }

  return readLocaleCookie(document.cookie);
}

export function writeLocaleCookie(locale: Locale) {
  if (typeof document === 'undefined') {
    return;
  }

  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${maxAge}; samesite=lax`;
}
