import { z } from 'zod';
import type { Locale } from '@/lib/i18n/config';
import { translate } from '@/lib/i18n/translate';

export function createContactSchema(locale: Locale) {
  const t = (key: string) => translate(locale, key);

  return z.object({
    name: z.string().trim().min(1, t('contact.validation.nameRequired')).max(80),
    email: z
      .string()
      .trim()
      .min(1, t('contact.validation.emailRequired'))
      .email(t('contact.validation.emailInvalid'))
      .max(254),
    phone: z.string().trim().max(40),
    subject: z.string().trim().max(160),
    message: z.string().trim().min(1, t('contact.validation.messageRequired')).max(4000),
  });
}

export type ContactFormValues = z.infer<ReturnType<typeof createContactSchema>>;
