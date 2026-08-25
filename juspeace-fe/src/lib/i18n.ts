import messages from '@/messages/en.json';

type Messages = typeof messages;

function getNestedValue(source: Record<string, unknown>, path: string) {
  return path.split('.').reduce<unknown>((current, key) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key];
    }

    return undefined;
  }, source);
}

export function t<K extends string>(
  key: K,
  values?: Record<string, string | number>,
): string {
  const raw = getNestedValue(messages as Record<string, unknown>, key);

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

export type MessageKey = keyof Messages extends string ? string : never;

export function formatPrice(priceCents: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(priceCents / 100);
}
