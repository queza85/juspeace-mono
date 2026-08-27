'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useForm } from '@tanstack/react-form';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api/client';
import * as authApi from '@/lib/api/auth';
import { createForgotPasswordResetSchema } from '@/lib/auth/forgot-password-schema';
import {
  clearPasswordResetToken,
  getPasswordResetToken,
} from '@/lib/auth/password-reset-token';
import { useLocale, useT } from '@/lib/i18n/locale-context';
import { cn } from '@/lib/utils';

function fieldErrorText(
  errors: unknown[],
  fallback: string,
): string | null {
  if (!errors.length) {
    return null;
  }

  const first = errors[0];
  if (typeof first === 'string') {
    return first;
  }
  if (
    first &&
    typeof first === 'object' &&
    'message' in first &&
    typeof (first as { message: unknown }).message === 'string'
  ) {
    return (first as { message: string }).message;
  }
  return fallback;
}

function RequiredLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-[13px] font-semibold text-foreground">
      {children}
      <span className="text-destructive" aria-hidden="true">
        {' '}
        *
      </span>
    </span>
  );
}

const inputClassName =
  'h-9 w-full rounded-md border border-input bg-white px-3 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20';

export function ForgotPasswordResetForm() {
  const router = useRouter();
  const t = useT();
  const { locale } = useLocale();
  const schema = useMemo(
    () => createForgotPasswordResetSchema(locale),
    [locale],
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const resetToken = useMemo(() => getPasswordResetToken(), []);

  useEffect(() => {
    if (!resetToken) {
      router.replace('/forgot-password');
    }
  }, [resetToken, router]);

  const form = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null);
      if (!resetToken) {
        setFormError(t('auth.forgotPasswordFlow.missingToken'));
        return;
      }

      try {
        await authApi.resetPassword(resetToken, value.password);
        clearPasswordResetToken();
        router.replace('/login?reset=1');
      } catch (error) {
        if (
          error instanceof ApiError &&
          error.body?.message === 'PASSWORD_REUSE_NOT_ALLOWED'
        ) {
          setFormError(t('auth.forgotPasswordFlow.passwordReuse'));
          return;
        }
        setFormError(t('auth.forgotPasswordFlow.resetFailed'));
      }
    },
  });

  if (!resetToken) {
    return (
      <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
    );
  }

  return (
    <div className="box-border w-full max-w-[400px] rounded-lg border border-border bg-white px-5 py-6 shadow-sm">
      <div className="mb-5 flex flex-col items-center text-center">
        <Image
          src="/logo.png"
          alt=""
          width={48}
          height={48}
          className="mb-3 size-12"
          priority
        />
        <h1 className="text-base font-bold tracking-tight text-foreground">
          {t('auth.forgotPasswordFlow.title')}
        </h1>
        <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
          {t('auth.forgotPasswordFlow.resetSubtitle')}
        </p>
      </div>

      <div className="flex flex-col gap-3.5">
        {formError ? (
          <p className="text-sm text-destructive" role="alert">
            {formError}
          </p>
        ) : null}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
          className="flex flex-col gap-3.5"
        >
          <form.Field name="password">
            {(field) => {
              const error = fieldErrorText(
                field.state.meta.errors,
                t('common.error'),
              );
              return (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor={field.name}>
                    <RequiredLabel>
                      {t('auth.forgotPasswordFlow.newPassword')}
                    </RequiredLabel>
                  </label>
                  <div className="relative">
                    <input
                      id={field.name}
                      name={field.name}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder={t(
                        'auth.forgotPasswordFlow.newPasswordPlaceholder',
                      )}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      className={cn(inputClassName, 'pr-10')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={
                        showPassword
                          ? t('auth.hidePassword')
                          : t('auth.showPassword')
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  {field.state.meta.isTouched && error ? (
                    <p className="text-sm text-destructive" role="alert">
                      {error}
                    </p>
                  ) : null}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="confirmPassword">
            {(field) => {
              const error = fieldErrorText(
                field.state.meta.errors,
                t('common.error'),
              );
              return (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor={field.name}>
                    <RequiredLabel>
                      {t('auth.forgotPasswordFlow.confirmNewPassword')}
                    </RequiredLabel>
                  </label>
                  <div className="relative">
                    <input
                      id={field.name}
                      name={field.name}
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder={t(
                        'auth.forgotPasswordFlow.confirmNewPasswordPlaceholder',
                      )}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      className={cn(inputClassName, 'pr-10')}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((current) => !current)
                      }
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={
                        showConfirmPassword
                          ? t('auth.hidePassword')
                          : t('auth.showPassword')
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  {field.state.meta.isTouched && error ? (
                    <p className="text-sm text-destructive" role="alert">
                      {error}
                    </p>
                  ) : null}
                </div>
              );
            }}
          </form.Field>

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button
                type="submit"
                disabled={isSubmitting}
                size="default"
                className="h-9 w-full rounded-md text-[13px] font-semibold"
              >
                {isSubmitting
                  ? t('common.loading')
                  : t('auth.forgotPasswordFlow.update')}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </div>
    </div>
  );
}
