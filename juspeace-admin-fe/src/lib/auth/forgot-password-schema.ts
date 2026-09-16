import { z } from 'zod';
import { translate } from '@/lib/i18n/translate';
import type { Locale } from '@/lib/i18n/config';

export function createForgotPasswordRequestSchema(locale: Locale) {
  const t = (key: string) => translate(locale, key);

  return z.object({
    email: z
      .string()
      .trim()
      .min(1, t('auth.validation.emailRequired'))
      .email(t('auth.validation.emailInvalid')),
  });
}

export function createForgotPasswordVerifySchema(locale: Locale) {
  const t = (key: string) => translate(locale, key);

  return z.object({
    code: z
      .string()
      .trim()
      .min(1, t('auth.forgotPasswordFlow.validation.codeRequired'))
      .regex(/^\d{6}$/, t('auth.forgotPasswordFlow.validation.codeInvalid')),
  });
}

export function createForgotPasswordResetSchema(locale: Locale) {
  const t = (key: string) => translate(locale, key);

  return z
    .object({
      password: z.string().min(8, t('auth.validation.passwordMin')),
      confirmPassword: z
        .string()
        .min(1, t('auth.validation.confirmPasswordRequired')),
    })
    .refine((values) => values.password === values.confirmPassword, {
      message: t('auth.validation.passwordMismatch'),
      path: ['confirmPassword'],
    });
}

export type ForgotPasswordRequestValues = z.infer<
  ReturnType<typeof createForgotPasswordRequestSchema>
>;
export type ForgotPasswordVerifyValues = z.infer<
  ReturnType<typeof createForgotPasswordVerifySchema>
>;
export type ForgotPasswordResetValues = z.infer<
  ReturnType<typeof createForgotPasswordResetSchema>
>;
