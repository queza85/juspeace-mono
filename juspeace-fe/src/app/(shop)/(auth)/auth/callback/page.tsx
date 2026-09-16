import { Suspense } from 'react';
import type { Metadata } from 'next';
import { OAuthCallbackHandler } from '@/components/auth/oauth-callback-handler';
import { getTranslator } from '@/lib/i18n/server';

export const metadata: Metadata = {
  title: 'Signing in',
};

export default async function OAuthCallbackPage() {
  const { t } = await getTranslator();

  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 sm:px-6">
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">
            {t('auth.oauthCallbackLoading')}
          </p>
        }
      >
        <OAuthCallbackHandler />
      </Suspense>
    </div>
  );
}
