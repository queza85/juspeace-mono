import { z } from 'zod';
import type { Locale } from '@/lib/i18n/config';
import { translate } from '@/lib/i18n/translate';

export function createQaSignupSchema(locale: Locale) {
  const t = (key: string) => translate(locale, key);

  return z.object({
    name: z.string().trim().min(1, t('qaTest.signup.validation.nameRequired')),
    email: z
      .string()
      .trim()
      .min(1, t('qaTest.signup.validation.emailRequired'))
      .email(t('qaTest.signup.validation.emailInvalid')),
    password: z.string().min(8, t('qaTest.signup.validation.passwordMin')),
    confirmPassword: z.string().min(8, t('qaTest.signup.validation.passwordMin')),
  });
}

export type QaSignupValues = z.infer<ReturnType<typeof createQaSignupSchema>>;
