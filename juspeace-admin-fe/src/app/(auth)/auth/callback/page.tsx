import { Suspense } from 'react';
import type { Metadata } from 'next';
import { OAuthCallbackHandler } from '@/components/auth/oauth-callback-handler';
import { getTranslator } from '@/lib/i18n/server';

export const metadata: Metadata = {
  title: 'OAuth callback',
};

export default async function OAuthCallbackPage() {
  const { t } = await getTranslator();

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">{t('auth.oauthCallbackLoading')}</p>
        }
      >
        <OAuthCallbackHandler />
      </Suspense>
    </div>
  );
}
