'use client';

import { useMemo, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { buildGoogleOAuthUrl } from '@/lib/api/oauth';
import {
  AdminAccessDeniedError,
  useAuth,
} from '@/lib/auth/auth-context';
import { createLoginFormSchema } from '@/lib/auth/login-schema';
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

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useT();
  const { locale } = useLocale();
  const schema = useMemo(() => createLoginFormSchema(locale), [locale]);
  const oauthError = searchParams.get('error') === 'oauth';
  const [formError, setFormError] = useState<string | null>(null);

  const returnUrl = searchParams.get('returnUrl') || '/dashboard';
  const safeReturnUrl = returnUrl.startsWith('/') ? returnUrl : '/dashboard';
  const googleOAuthUrl = buildGoogleOAuthUrl(safeReturnUrl);

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null);
      try {
        await login(value.email, value.password);
        router.replace(safeReturnUrl);
      } catch (error) {
        if (error instanceof AdminAccessDeniedError) {
          setFormError(t('admin.accessDenied'));
          return;
        }
        setFormError(t('auth.loginFailed'));
      }
    },
  });

  return (
    <Card className="w-full max-w-md shadow-sm">
      <CardHeader>
        <CardTitle>{t('auth.loginTitle')}</CardTitle>
        <CardDescription>{t('auth.loginSubtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {oauthError ? (
          <p className="text-sm text-destructive" role="alert">
            {t('auth.oauthCallbackFailed')}
          </p>
        ) : null}

        {formError ? (
          <p className="text-sm text-destructive" role="alert">
            {formError}
          </p>
        ) : null}

        <a
          href={googleOAuthUrl}
          className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'w-full')}
        >
          {t('auth.loginWithGoogle')}
        </a>

        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
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
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? t('common.loading') : t('auth.login')}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </CardContent>
    </Card>
  );
}
