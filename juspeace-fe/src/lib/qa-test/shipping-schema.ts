import { z } from 'zod';
import type { Locale } from '@/lib/i18n/config';
import { translate } from '@/lib/i18n/translate';

export function createQaShippingSchema(locale: Locale) {
  const t = (key: string) => translate(locale, key);

  return z.object({
    recipient: z
      .string()
      .trim()
      .min(1, t('qaTest.shipping.validation.recipientRequired')),
    phone: z.string().trim().min(1, t('qaTest.shipping.validation.phoneRequired')),
    address: z
      .string()
      .trim()
      .min(1, t('qaTest.shipping.validation.addressRequired')),
  });
}

export type QaShippingValues = z.infer<ReturnType<typeof createQaShippingSchema>>;
