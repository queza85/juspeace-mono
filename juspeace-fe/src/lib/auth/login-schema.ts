import { z } from 'zod';
import { t } from '@/lib/i18n';

export const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, t('auth.validation.emailRequired'))
    .email(t('auth.validation.emailInvalid')),
  password: z
    .string()
    .min(8, t('auth.validation.passwordMin')),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
