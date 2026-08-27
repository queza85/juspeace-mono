'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { useAuth } from '@/lib/auth/auth-context';
import { useT } from '@/lib/i18n/locale-context';

export function AdminHeader() {
  const t = useT();
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <div className="min-w-0">
        {user ? (
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={async () => {
            await logout();
            router.replace('/login');
          }}
        >
          {t('auth.logout')}
        </Button>
      </div>
    </header>
  );
}
