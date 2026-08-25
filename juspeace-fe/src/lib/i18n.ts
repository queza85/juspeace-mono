/**
 * Shared i18n helpers.
 * - Server Components: `import { getTranslator } from '@/lib/i18n/server'`
 * - Client Components: `import { useT, useLocale } from '@/lib/i18n/locale-context'`
 */
export {
  defaultLocale,
  isLocale,
  locales,
  LOCALE_COOKIE,
  toBcp47,
  type Locale,
} from './i18n/config';
export { translate, formatPriceForLocale } from './i18n/translate';

import { getBrowserLocaleHint } from './i18n/cookie';
import { defaultLocale } from './i18n/config';
import { formatPriceForLocale, translate } from './i18n/translate';

/**
 * Sync translator for non-React modules (API client toasts, etc.).
 * Prefers the browser cookie locale; falls back to English on the server.
 */
export function t(
  key: string,
  values?: Record<string, string | number>,
): string {
  const locale =
    typeof window === 'undefined' ? defaultLocale : getBrowserLocaleHint();
  return translate(locale, key, values);
}

export function formatPrice(priceCents: number, currency = 'USD') {
  const locale =
    typeof window === 'undefined' ? defaultLocale : getBrowserLocaleHint();
  return formatPriceForLocale(locale, priceCents, currency);
}
