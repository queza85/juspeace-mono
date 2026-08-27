import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ForgotPasswordResetForm } from '@/components/auth/forgot-password-reset-form';
import { getTranslator } from '@/lib/i18n/server';

export const metadata: Metadata = {
  title: 'Reset password',
};

export default async function ForgotPasswordResetPage() {
  const { t } = await getTranslator();

  return (
    <div className="flex min-h-screen items-center justify-center bg-login-background px-4 py-8">
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        }
      >
        <ForgotPasswordResetForm />
      </Suspense>
    </div>
  );
}
