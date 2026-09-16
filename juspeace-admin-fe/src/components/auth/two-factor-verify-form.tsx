'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api/client';
import * as authApi from '@/lib/api/auth';
import type { AuthTokensResponse } from '@/lib/api/types';
import {
  AdminAccessDeniedError,
  isAdminUser,
} from '@/lib/auth/admin-access';
import { setSessionHint } from '@/lib/auth/session-hint';
import {
  clearTwoFactorChallengeToken,
  getTwoFactorChallengeToken,
  setTwoFactorChallengeToken,
} from '@/lib/auth/two-factor-challenge-token';
import { createTwoFactorVerifySchema } from '@/lib/auth/two-factor-schema';
import { useLocale, useT } from '@/lib/i18n/locale-context';
import { authKeys } from '@/lib/query/keys';
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

export function TwoFactorVerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const t = useT();
  const { locale } = useLocale();
  const schema = useMemo(
    () => createTwoFactorVerifySchema(locale),
    [locale],
  );

  const challengeTokenFromQuery = searchParams.get('challengeToken')?.trim() ?? '';
  const challengeToken = useMemo(() => {
    if (challengeTokenFromQuery.length > 0) {
      return challengeTokenFromQuery;
    }
    return getTwoFactorChallengeToken() ?? '';
  }, [challengeTokenFromQuery]);

  const returnUrl = searchParams.get('returnUrl') || '/dashboard';
  const safeReturnUrl = returnUrl.startsWith('/') ? returnUrl : '/dashboard';

  const [formError, setFormError] = useState<string | null>(null);
  const [codeExpired, setCodeExpired] = useState(false);
  const [resendPending, setResendPending] = useState(false);

  useEffect(() => {
    if (challengeTokenFromQuery.length > 0) {
      setTwoFactorChallengeToken(challengeTokenFromQuery);
      return;
    }

    if (!challengeToken) {
      router.replace('/login');
    }
  }, [challengeToken, challengeTokenFromQuery, router]);

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

      if (!challengeToken) {
        setFormError(t('auth.twoFactorFlow.missingToken'));
        return;
      }

      try {
        const data = await authApi.verifyTwoFactorCode(
          challengeToken,
          value.code.replace(/\s/g, ''),
        );

        if (!isAdminUser(data.user.role)) {
          setSessionHint(false);
          queryClient.setQueryData(authKeys.session(), null);
          clearTwoFactorChallengeToken();
          throw new AdminAccessDeniedError();
        }

        persistSession(data);
        clearTwoFactorChallengeToken();
        router.replace(safeReturnUrl);
      } catch (error) {
        if (error instanceof AdminAccessDeniedError) {
          setFormError(t('admin.accessDenied'));
          return;
        }
        if (error instanceof ApiError) {
          const message = error.body?.message ?? error.message;
          if (
            message === 'TWO_FACTOR_CODE_EXPIRED' ||
            message === 'INVALID_TWO_FACTOR_CODE'
          ) {
            setCodeExpired(message === 'TWO_FACTOR_CODE_EXPIRED');
            setFormError(
              message === 'TWO_FACTOR_CODE_EXPIRED'
                ? t('auth.twoFactorFlow.codeExpiredHint')
                : t('auth.twoFactorFlow.invalidCode'),
            );
            return;
          }
          if (message === 'INVALID_TWO_FACTOR_CHALLENGE') {
            clearTwoFactorChallengeToken();
            setFormError(t('auth.twoFactorFlow.missingToken'));
            return;
          }
        }
        setFormError(t('auth.twoFactorFlow.verifyFailed'));
      }
    },
  });

  function persistSession(data: AuthTokensResponse) {
    setSessionHint(true);
    queryClient.setQueryData(authKeys.session(), {
      accessToken: data.accessToken,
      user: data.user,
    });
  }

  async function handleResend() {
    if (!challengeToken || resendPending) {
      return;
    }
    setResendPending(true);
    setFormError(null);
    try {
      await authApi.resendTwoFactorCode(challengeToken);
      setCodeExpired(false);
    } catch (error) {
      if (error instanceof ApiError) {
        const message = error.body?.message ?? error.message;
        if (message === 'INVALID_TWO_FACTOR_CHALLENGE') {
          clearTwoFactorChallengeToken();
          setFormError(t('auth.twoFactorFlow.missingToken'));
          return;
        }
      }
      setFormError(t('auth.twoFactorFlow.resendFailed'));
    } finally {
      setResendPending(false);
    }
  }

  if (!challengeToken) {
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
          {codeExpired
            ? t('auth.twoFactorFlow.codeExpiredTitle')
            : t('auth.twoFactorFlow.title')}
        </h1>
        <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
          {codeExpired
            ? t('auth.twoFactorFlow.codeExpiredSubtitle')
            : t('auth.twoFactorFlow.subtitle')}
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
                      {t('auth.twoFactorFlow.verificationCode')}
                    </RequiredLabel>
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder={t(
                      'auth.twoFactorFlow.verificationCodePlaceholder',
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
                  : t('auth.twoFactorFlow.submitCode')}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <button
          type="button"
          onClick={() => void handleResend()}
          disabled={resendPending || !challengeToken}
          className="text-center text-[13px] font-medium text-primary underline underline-offset-2 disabled:opacity-60"
        >
          {resendPending
            ? t('common.loading')
            : t('auth.twoFactorFlow.resendCode')}
        </button>
      </div>
    </div>
  );
}
