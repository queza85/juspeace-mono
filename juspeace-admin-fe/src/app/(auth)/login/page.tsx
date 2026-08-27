import { Suspense } from 'react';
import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';
import { getTranslator } from '@/lib/i18n/server';

export const metadata: Metadata = {
  title: 'Login',
};

export default async function LoginPage() {
  const { t } = await getTranslator();

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <div className="flex w-full max-w-md flex-col items-center gap-6">
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {t('admin.shell.title')}
          </p>
        </div>
        <Suspense
          fallback={
            <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
