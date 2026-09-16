import { z } from 'zod';
import { translate } from '@/lib/i18n/translate';
import type { Locale } from '@/lib/i18n/config';

export function createLoginFormSchema(locale: Locale) {
  const t = (key: string) => translate(locale, key);

  return z.object({
    email: z
      .string()
      .trim()
      .min(1, t('auth.validation.emailRequired'))
      .email(t('auth.validation.emailInvalid')),
    password: z.string().min(8, t('auth.validation.passwordMin')),
  });
}

export type LoginFormValues = z.infer<ReturnType<typeof createLoginFormSchema>>;
