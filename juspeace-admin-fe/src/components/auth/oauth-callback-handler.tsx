'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import * as authApi from '@/lib/api/auth';
import { isAdminUser } from '@/lib/auth/admin-access';
import { setSessionHint } from '@/lib/auth/session-hint';
import { useT } from '@/lib/i18n/locale-context';
import { authKeys } from '@/lib/query/keys';

export function OAuthCallbackHandler() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [error, setError] = useState<'oauth' | 'accessDenied' | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) {
      return;
    }
    started.current = true;

    async function complete() {
      try {
        setSessionHint(true, true);
        const { accessToken } = await authApi.refreshSession();
        const user = await authApi.getMe(accessToken);

        if (!isAdminUser(user.role)) {
          try {
            await authApi.logout(accessToken);
          } catch {
            // Best-effort cleanup.
          }
          setSessionHint(false);
          queryClient.setQueryData(authKeys.session(), null);
          setError('accessDenied');
          return;
        }

        queryClient.setQueryData(authKeys.session(), { accessToken, user });

        const returnUrl = searchParams.get('returnUrl') || '/dashboard';
        router.replace(returnUrl.startsWith('/') ? returnUrl : '/dashboard');
      } catch {
        setSessionHint(false);
        setError('oauth');
      }
    }

    void complete();
  }, [queryClient, router, searchParams]);

  if (error === 'accessDenied') {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-sm text-destructive" role="alert">
          {t('admin.accessDenied')}
        </p>
        <Link
          href="/login"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {t('auth.login')}
        </Link>
      </div>
    );
  }

  if (error === 'oauth') {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-sm text-destructive" role="alert">
          {t('auth.oauthCallbackFailed')}
        </p>
        <Link
          href="/login"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {t('auth.login')}
        </Link>
      </div>
    );
  }

  return (
    <p className="text-sm text-muted-foreground">{t('auth.oauthCallbackLoading')}</p>
  );
}
