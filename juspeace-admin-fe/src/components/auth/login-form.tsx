'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { useForm } from '@tanstack/react-form';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { buildGoogleOAuthUrl } from '@/lib/api/oauth';
import {
  AdminAccessDeniedError,
  useAuth,
} from '@/lib/auth/auth-context';
import { createLoginFormSchema } from '@/lib/auth/login-schema';
import {
  getRememberedEmail,
  setRememberedEmail,
} from '@/lib/auth/remember-email';
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

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 shrink-0">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 shrink-0">
      <path
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
        fill="#1877F2"
      />
    </svg>
  );
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

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useT();
  const { locale } = useLocale();
  const schema = useMemo(() => createLoginFormSchema(locale), [locale]);
  const oauthError = searchParams.get('error') === 'oauth';
  const registrationSuccess = searchParams.get('registered') === '1';
  const resetSuccess = searchParams.get('reset') === '1';
  const registeredEmail = searchParams.get('email')?.trim() ?? '';
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const rememberedEmail = getRememberedEmail();
  const [rememberMe, setRememberMe] = useState(() => rememberedEmail.length > 0);

  const returnUrl = searchParams.get('returnUrl') || '/dashboard';
  const safeReturnUrl = returnUrl.startsWith('/') ? returnUrl : '/dashboard';
  const googleOAuthUrl = buildGoogleOAuthUrl(safeReturnUrl);
  const initialEmail =
    registeredEmail.length > 0 ? registeredEmail : rememberedEmail;

  const form = useForm({
    defaultValues: {
      email: initialEmail,
      password: '',
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null);
      try {
        await login(value.email, value.password, rememberMe);
        if (rememberMe) {
          setRememberedEmail(value.email);
        } else {
          setRememberedEmail(null);
        }
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
          {t('auth.loginTitle')}
        </h1>
        <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
          {t('auth.loginSubtitle')}
        </p>
      </div>

      <div className="flex flex-col gap-3.5">
        {oauthError ? (
          <p className="text-sm text-destructive" role="alert">
            {t('auth.oauthCallbackFailed')}
          </p>
        ) : null}

        {registrationSuccess ? (
          <p className="text-sm text-emerald-700" role="status">
            {t('auth.signUpSuccessMessage')}
          </p>
        ) : null}

        {resetSuccess ? (
          <p className="text-sm text-emerald-700" role="status">
            {t('auth.forgotPasswordFlow.resetSuccessMessage')}
          </p>
        ) : null}

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

          <form.Field name="password">
            {(field) => {
              const error = fieldErrorText(
                field.state.meta.errors,
                t('common.error'),
              );
              return (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor={field.name}>
                    <RequiredLabel>{t('auth.password')}</RequiredLabel>
                  </label>
                  <div className="relative">
                    <input
                      id={field.name}
                      name={field.name}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder={t('auth.passwordPlaceholder')}
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

          <div className="flex items-center justify-between gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-[13px] text-foreground">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="size-4 rounded border-input accent-primary"
              />
              {t('auth.rememberMe')}
            </label>
            <Link
              href="/forgot-password"
              className="text-[13px] font-medium text-primary underline underline-offset-2"
            >
              {t('auth.forgotPassword')}
            </Link>
          </div>

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button
                type="submit"
                disabled={isSubmitting}
                size="default"
                className="h-9 w-full rounded-md text-[13px] font-semibold"
              >
                {isSubmitting ? t('common.loading') : t('auth.login')}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="text-center text-[13px] text-muted-foreground">
          {t('auth.noAccount')}{' '}
          <Link
            href="/register"
            className="font-medium text-primary underline underline-offset-2"
          >
            {t('auth.signUpHere')}
          </Link>
        </p>

        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs font-medium tracking-wide">
            <span className="bg-white px-3 text-muted-foreground uppercase">
              {t('auth.orDivider')}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <a
            href={googleOAuthUrl}
            className={cn(
              buttonVariants({ variant: 'outline', size: 'default' }),
              'h-9 w-full justify-center gap-2 rounded-md border-input bg-white text-[13px] font-medium text-foreground hover:bg-muted/40',
            )}
          >
            <GoogleIcon />
            {t('auth.loginWithGoogle')}
          </a>

          <button
            type="button"
            disabled
            aria-disabled="true"
            title={t('auth.facebookUnavailable')}
            className={cn(
              buttonVariants({ variant: 'outline', size: 'default' }),
              'h-9 w-full justify-center gap-2 rounded-md border-input bg-white text-[13px] font-medium text-foreground opacity-60',
            )}
          >
            <FacebookIcon />
            {t('auth.loginWithFacebook')}
          </button>
        </div>
      </div>
    </div>
  );
}
