import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ForgotPasswordRequestForm } from '@/components/auth/forgot-password-request-form';
import { getTranslator } from '@/lib/i18n/server';

export const metadata: Metadata = {
  title: 'Forgot password',
};

export default async function ForgotPasswordPage() {
  const { t } = await getTranslator();

  return (
    <div className="flex min-h-screen items-center justify-center bg-login-background px-4 py-8">
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        }
      >
        <ForgotPasswordRequestForm />
      </Suspense>
    </div>
  );
}
