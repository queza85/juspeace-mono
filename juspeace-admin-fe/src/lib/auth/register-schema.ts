import { z } from 'zod';
import { translate } from '@/lib/i18n/translate';
import type { Locale } from '@/lib/i18n/config';

export function createRegisterFormSchema(locale: Locale) {
  const t = (key: string) => translate(locale, key);

  return z
    .object({
      name: z.string().trim().min(1, t('auth.validation.nameRequired')),
      email: z
        .string()
        .trim()
        .min(1, t('auth.validation.emailRequired'))
        .email(t('auth.validation.emailInvalid')),
      password: z.string().min(8, t('auth.validation.passwordMin')),
      confirmPassword: z
        .string()
        .min(1, t('auth.validation.confirmPasswordRequired')),
      acceptTerms: z.boolean(),
    })
    .refine((values) => values.password === values.confirmPassword, {
      message: t('auth.validation.passwordMismatch'),
      path: ['confirmPassword'],
    })
    .refine((values) => values.acceptTerms, {
      message: t('auth.validation.termsRequired'),
      path: ['acceptTerms'],
    });
}

export type RegisterFormValues = z.infer<
  ReturnType<typeof createRegisterFormSchema>
>;
