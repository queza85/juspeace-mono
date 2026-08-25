import { Suspense } from 'react';
import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';
import { t } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Login',
};

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {t('auth.loginTitle')}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('auth.loginSubtitle')}</p>
      </div>
      <Suspense fallback={<p className="text-sm text-muted-foreground">{t('common.loading')}</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
