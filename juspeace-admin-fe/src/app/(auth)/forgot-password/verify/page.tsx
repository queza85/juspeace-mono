import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ForgotPasswordVerifyForm } from '@/components/auth/forgot-password-verify-form';
import { getTranslator } from '@/lib/i18n/server';

export const metadata: Metadata = {
  title: 'Verify reset code',
};

export default async function ForgotPasswordVerifyPage() {
  const { t } = await getTranslator();

  return (
    <div className="flex min-h-screen items-center justify-center bg-login-background px-4 py-8">
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        }
      >
        <ForgotPasswordVerifyForm />
      </Suspense>
    </div>
  );
}
