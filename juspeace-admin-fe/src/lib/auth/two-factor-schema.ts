import { z } from 'zod';
import { translate } from '@/lib/i18n/translate';
import type { Locale } from '@/lib/i18n/config';

export function createTwoFactorVerifySchema(locale: Locale) {
  const t = (key: string) => translate(locale, key);

  return z.object({
    code: z
      .string()
      .trim()
      .min(1, t('auth.twoFactorFlow.validation.codeRequired'))
      .regex(/^\d{6}$/, t('auth.twoFactorFlow.validation.codeInvalid')),
  });
}

export type TwoFactorVerifyValues = z.infer<
  ReturnType<typeof createTwoFactorVerifySchema>
>;
