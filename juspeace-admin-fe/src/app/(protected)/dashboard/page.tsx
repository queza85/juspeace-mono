'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { useT } from '@/lib/i18n/locale-context';
import { ApiStatusCard } from '@/components/system/api-status-card';

export default function DashboardPage() {
  const t = useT();
  const { user } = useAuth();

  const welcome = user?.name
    ? t('admin.dashboard.welcome', { name: user.name })
    : t('admin.dashboard.welcomeFallback');

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t('admin.dashboard.title')}
        </h1>
        <p className="mt-2 text-muted-foreground">{welcome}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('admin.dashboard.description')}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">{t('auth.email')}</dt>
              <dd className="font-medium">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t('auth.name')}</dt>
              <dd className="font-medium">{user?.name ?? t('auth.noName')}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t('auth.role')}</dt>
              <dd className="font-medium">{user?.role}</dd>
            </div>
          </dl>
        </div>
        <ApiStatusCard />
      </div>
    </div>
  );
}
