export const locales = ['en', 'ko'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const LOCALE_COOKIE = 'juspeace_locale';

export function isLocale(value: string | null | undefined): value is Locale {
  return value === 'en' || value === 'ko';
}

export function toBcp47(locale: Locale): string {
  return locale === 'ko' ? 'ko-KR' : 'en-US';
}
