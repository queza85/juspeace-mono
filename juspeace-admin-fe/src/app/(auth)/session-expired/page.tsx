import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SessionExpiredCard } from '@/components/auth/session-expired-card';
import { getTranslator } from '@/lib/i18n/server';

export const metadata: Metadata = {
  title: 'Session Expired',
};

export default async function SessionExpiredPage() {
  const { t } = await getTranslator();

  return (
    <div className="flex min-h-screen items-center justify-center bg-login-background px-4 py-8">
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        }
      >
        <SessionExpiredCard />
      </Suspense>
    </div>
  );
}
