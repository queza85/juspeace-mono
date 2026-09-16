'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { useForm } from '@tanstack/react-form';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api/client';
import * as authApi from '@/lib/api/auth';
import { createForgotPasswordRequestSchema } from '@/lib/auth/forgot-password-schema';
import { useLocale, useT } from '@/lib/i18n/locale-context';

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

export function ForgotPasswordRequestForm() {
  const router = useRouter();
  const t = useT();
  const { locale } = useLocale();
  const schema = useMemo(
    () => createForgotPasswordRequestSchema(locale),
    [locale],
  );
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      email: '',
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null);
      try {
        await authApi.requestPasswordReset(value.email);
        const params = new URLSearchParams({ email: value.email });
        router.push(`/forgot-password/verify?${params.toString()}`);
      } catch (error) {
        if (error instanceof ApiError) {
          const message = error.body?.message ?? error.message;
          if (message === 'EMAIL_NOT_FOUND') {
            setFormError(t('auth.forgotPasswordFlow.emailNotFound'));
            return;
          }
          if (message === 'ACCOUNT_INACTIVE') {
            setFormError(t('auth.forgotPasswordFlow.accountInactive'));
            return;
          }
          if (message === 'PASSWORD_RESET_UNAVAILABLE') {
            setFormError(t('auth.forgotPasswordFlow.resetUnavailable'));
            return;
          }
        }
        setFormError(t('auth.forgotPasswordFlow.requestFailed'));
      }
    },
  });

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
          {t('auth.forgotPasswordFlow.requestSubtitle')}
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
          <form.Field name="email">
            {(field) => {
              const error = fieldErrorText(
                field.state.meta.errors,
                t('common.error'),
              );
              return (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor={field.name}>
                    <RequiredLabel>{t('auth.email')}</RequiredLabel>
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type="email"
                    autoComplete="email"
                    placeholder={t('auth.emailPlaceholder')}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    className={inputClassName}
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
                  : t('auth.forgotPasswordFlow.sendRequest')}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="text-center text-[13px] text-muted-foreground">
          {t('auth.forgotPasswordFlow.returnTo')}{' '}
          <Link
            href="/login"
            className="font-medium text-primary underline underline-offset-2"
          >
            {t('auth.forgotPasswordFlow.loginLink')}
          </Link>
        </p>
      </div>
    </div>
  );
}
