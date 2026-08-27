import { getCatalog, type Messages } from './catalogs';
import type { Locale } from './config';
import { defaultLocale, toBcp47 } from './config';

function getNestedValue(source: Record<string, unknown>, path: string) {
  return path.split('.').reduce<unknown>((current, key) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key];
    }

    return undefined;
  }, source);
}

export function translate(
  locale: Locale,
  key: string,
  values?: Record<string, string | number>,
): string {
  const catalog = getCatalog(locale) as unknown as Record<string, unknown>;
  const fallback = getCatalog(defaultLocale) as unknown as Record<
    string,
    unknown
  >;
  const raw =
    getNestedValue(catalog, key) ?? getNestedValue(fallback, key);

  if (typeof raw !== 'string') {
    return key;
  }

  if (!values) {
    return raw;
  }

  return Object.entries(values).reduce(
    (result, [token, value]) => result.replaceAll(`{${token}}`, String(value)),
    raw,
  );
}

export function formatPriceForLocale(
  locale: Locale,
  priceCents: number,
  currency = 'USD',
) {
  return new Intl.NumberFormat(toBcp47(locale), {
    style: 'currency',
    currency,
  }).format(priceCents / 100);
}

export type { Messages };
