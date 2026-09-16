'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import * as authApi from '@/lib/api/auth';
import { setSessionHint } from '@/lib/auth/session-hint';
import { useT } from '@/lib/i18n/locale-context';
import { authKeys } from '@/lib/query/keys';

export function OAuthCallbackHandler() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [error, setError] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) {
      return;
    }
    started.current = true;

    async function complete() {
      try {
        setSessionHint(true);
        const { accessToken } = await authApi.refreshSession();
        const user = await authApi.getMe(accessToken);
        queryClient.setQueryData(authKeys.session(), { accessToken, user });

        const returnUrl = searchParams.get('returnUrl') || '/account';
        router.replace(returnUrl.startsWith('/') ? returnUrl : '/account');
      } catch {
        setSessionHint(false);
        setError(true);
      }
    }

    void complete();
  }, [queryClient, router, searchParams]);

  if (error) {
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
