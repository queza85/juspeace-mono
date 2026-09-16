import { Suspense } from 'react';
import type { Metadata } from 'next';
import { TwoFactorVerifyForm } from '@/components/auth/two-factor-verify-form';
import { getTranslator } from '@/lib/i18n/server';

export const metadata: Metadata = {
  title: 'Two-factor authentication',
};

export default async function TwoFactorPage() {
  const { t } = await getTranslator();

  return (
    <div className="flex min-h-screen items-center justify-center bg-login-background px-4 py-8">
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        }
      >
        <TwoFactorVerifyForm />
      </Suspense>
    </div>
  );
}
