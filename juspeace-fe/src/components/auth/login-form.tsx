'use client';

import { useMemo } from 'react';
import { useForm } from '@tanstack/react-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/auth-context';
import { createLoginFormSchema } from '@/lib/auth/login-schema';
import { useLocale, useT } from '@/lib/i18n/locale-context';
import { cn } from '@/lib/utils';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:7777/api/v1';

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

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useT();
  const { locale } = useLocale();
  const schema = useMemo(() => createLoginFormSchema(locale), [locale]);
  const oauthError = searchParams.get('error') === 'oauth';

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      await login(value.email, value.password);
      const returnUrl = searchParams.get('returnUrl') || '/account';
      router.replace(returnUrl.startsWith('/') ? returnUrl : '/account');
    },
  });

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-4">
      {oauthError ? (
        <p className="text-sm text-destructive" role="alert">
          {t('auth.oauthCallbackFailed')}
        </p>
      ) : null}

      <a
        href={`${API_BASE_URL}/auth/google`}
        className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'w-full')}
      >
        {t('auth.loginWithGoogle')}
      </a>

      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {t('auth.orDivider')}
          </span>
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
        className="flex flex-col gap-4"
      >
        <form.Field name="email">
          {(field) => {
            const error = fieldErrorText(
              field.state.meta.errors,
              t('common.error'),
            );
            return (
              <div className="flex flex-col gap-1.5">
                <label htmlFor={field.name} className="text-sm font-medium">
                  {t('auth.email')}
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type="email"
                  autoComplete="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
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

        <form.Field name="password">
          {(field) => {
            const error = fieldErrorText(
              field.state.meta.errors,
              t('common.error'),
            );
            return (
              <div className="flex flex-col gap-1.5">
                <label htmlFor={field.name} className="text-sm font-medium">
                  {t('auth.password')}
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type="password"
                  autoComplete="current-password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('common.loading') : t('auth.login')}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </div>
  );
}
