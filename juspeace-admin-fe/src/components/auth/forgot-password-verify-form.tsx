'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { useForm } from '@tanstack/react-form';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api/client';
import * as authApi from '@/lib/api/auth';
import { createForgotPasswordVerifySchema } from '@/lib/auth/forgot-password-schema';
import { setPasswordResetToken } from '@/lib/auth/password-reset-token';
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

export function ForgotPasswordVerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useT();
  const { locale } = useLocale();
  const schema = useMemo(
    () => createForgotPasswordVerifySchema(locale),
    [locale],
  );
  const email = searchParams.get('email')?.trim() ?? '';
  const [formError, setFormError] = useState<string | null>(null);
  const [codeExpired, setCodeExpired] = useState(false);
  const [resendPending, setResendPending] = useState(false);

  const form = useForm({
    defaultValues: {
      code: '',
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null);
      setCodeExpired(false);

      if (!email) {
        setFormError(t('auth.forgotPasswordFlow.missingEmail'));
        return;
      }

      try {
        const data = await authApi.verifyPasswordResetCode(
          email,
          value.code.replace(/\s/g, ''),
        );
        setPasswordResetToken(data.resetToken);
        router.push('/forgot-password/reset');
      } catch (error) {
        if (error instanceof ApiError) {
          const message = error.body?.message ?? error.message;
          if (
            message === 'RESET_CODE_EXPIRED' ||
            message === 'INVALID_RESET_CODE'
          ) {
            setCodeExpired(message === 'RESET_CODE_EXPIRED');
            setFormError(
              message === 'RESET_CODE_EXPIRED'
                ? t('auth.forgotPasswordFlow.codeExpiredHint')
                : t('auth.forgotPasswordFlow.invalidCode'),
            );
            return;
          }
        }
        setFormError(t('auth.forgotPasswordFlow.verifyFailed'));
      }
    },
  });

  async function handleResend() {
    if (!email || resendPending) {
      return;
    }
    setResendPending(true);
    setFormError(null);
    try {
      await authApi.resendPasswordResetCode(email);
      setCodeExpired(false);
    } catch (error) {
      if (error instanceof ApiError) {
        const message = error.body?.message ?? error.message;
        if (message === 'EMAIL_NOT_FOUND') {
          setFormError(t('auth.forgotPasswordFlow.emailNotFound'));
          return;
        }
      }
      setFormError(t('auth.forgotPasswordFlow.resendFailed'));
    } finally {
      setResendPending(false);
    }
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
          {codeExpired
            ? t('auth.forgotPasswordFlow.codeExpiredTitle')
            : t('auth.forgotPasswordFlow.title')}
        </h1>
        <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
          {codeExpired
            ? t('auth.forgotPasswordFlow.codeExpiredSubtitle')
            : t('auth.forgotPasswordFlow.verifySubtitle')}
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
          <form.Field name="code">
            {(field) => {
              const error = fieldErrorText(
                field.state.meta.errors,
                t('common.error'),
              );
              return (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor={field.name}>
                    <RequiredLabel>
                      {t('auth.forgotPasswordFlow.verificationCode')}
                    </RequiredLabel>
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder={t(
                      'auth.forgotPasswordFlow.verificationCodePlaceholder',
                    )}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    className={cn(
                      inputClassName,
                      codeExpired &&
                        'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20',
                    )}
                  />
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
                  : t('auth.forgotPasswordFlow.submitCode')}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <button
          type="button"
          onClick={() => void handleResend()}
          disabled={resendPending || !email}
          className="text-center text-[13px] font-medium text-primary underline underline-offset-2 disabled:opacity-60"
        >
          {resendPending
            ? t('common.loading')
            : t('auth.forgotPasswordFlow.resendCode')}
        </button>
      </div>
    </div>
  );
}
