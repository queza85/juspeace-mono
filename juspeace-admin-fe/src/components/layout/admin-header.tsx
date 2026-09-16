'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Search } from 'lucide-react';
import {
  ChevronDownIcon,
  MessageIcon,
  MoonIcon,
  NotificationIcon,
  SettingsIcon,
  SunIcon,
} from '@/components/icons';
import { Button } from '@/components/ui/button';
import { HeaderIconButton } from '@/components/layout/header-icon-button';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { useAuth } from '@/lib/auth/auth-context';
import { useT } from '@/lib/i18n/locale-context';
import { cn } from '@/lib/utils';

type AdminHeaderProps = {
  onToggleSidebar?: () => void;
  className?: string;
};

export function AdminHeader({ onToggleSidebar, className }: AdminHeaderProps) {
  const t = useT();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeDark, setThemeDark] = useState(false);

  const displayName = user?.name ?? t('admin.header.defaultUser');

  const toggleTheme = () => {
    setThemeDark((current) => {
      const nextDark = !current;
      document.documentElement.classList.toggle('dark', nextDark);
      return nextDark;
    });
  };

  return (
    <header
      className={cn(
        'flex h-14 shrink-0 items-center gap-3 bg-admin-header px-4 text-admin-header-foreground md:gap-4 md:px-6',
        className,
      )}
    >
      <button
        type="button"
        onClick={onToggleSidebar}
        className="rounded-md p-2 hover:bg-white/10"
        aria-label={t('admin.header.toggleSidebar')}
      >
        <Menu className="size-5" />
      </button>

      <div className="relative hidden min-w-0 flex-1 md:block md:max-w-sm lg:max-w-md">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/60"
          aria-hidden
        />
        <input
          type="search"
          placeholder={t('admin.header.searchPlaceholder')}
          className="h-9 w-full rounded-lg border border-white/20 bg-white/10 pr-3 pl-9 text-sm text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none"
        />
      </div>

      <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
        <LanguageSwitcher variant="header" />

        <HeaderIconButton
          label={t('admin.header.messages')}
          badge={7}
          badgeClassName="bg-emerald-500"
        >
          <MessageIcon size={20} />
        </HeaderIconButton>

        <HeaderIconButton
          label={t('admin.header.notifications')}
          badge={14}
          badgeClassName="bg-amber-400 text-amber-950"
        >
          <NotificationIcon size={20} />
        </HeaderIconButton>

        <HeaderIconButton label={t('admin.header.settings')}>
          <SettingsIcon size={20} />
        </HeaderIconButton>

        <HeaderIconButton
          label={
            themeDark ? t('admin.header.lightMode') : t('admin.header.darkMode')
          }
          onClick={toggleTheme}
        >
          {themeDark ? <SunIcon size={20} /> : <MoonIcon size={20} />}
        </HeaderIconButton>

        <span
          className="mx-2 hidden h-7 w-px shrink-0 bg-white/70 sm:block"
          aria-hidden
        />

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 hover:bg-white/10"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <span className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-white/20 text-xs font-semibold uppercase">
              {displayName.slice(0, 2)}
            </span>
            <span className="hidden max-w-24 truncate text-sm font-semibold sm:block">
              {displayName}
            </span>
            <ChevronDownIcon size={14} className="hidden sm:block" />
          </button>
          {menuOpen ? (
            <div
              role="menu"
              className="absolute top-full right-0 z-50 mt-2 w-48 rounded-lg border border-border bg-card py-1 text-card-foreground shadow-lg"
            >
              {user?.email ? (
                <p className="truncate px-3 py-2 text-xs text-muted-foreground">
                  {user.email}
                </p>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-start rounded-none"
                onClick={async () => {
                  setMenuOpen(false);
                  await logout();
                  router.replace('/login');
                }}
              >
                {t('auth.logout')}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
