import { cookies } from 'next/headers';
import {
  defaultLocale,
  isLocale,
  LOCALE_COOKIE,
  type Locale,
} from './config';
import { formatPriceForLocale, translate } from './translate';

export async function getLocale(): Promise<Locale> {
  const jar = await cookies();
  const value = jar.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : defaultLocale;
}

export async function getTranslator() {
  const locale = await getLocale();

  return {
    locale,
    t: (key: string, values?: Record<string, string | number>) =>
      translate(locale, key, values),
    formatPrice: (priceCents: number, currency = 'USD') =>
      formatPriceForLocale(locale, priceCents, currency),
  };
}
