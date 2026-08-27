'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard } from 'lucide-react';
import { useT } from '@/lib/i18n/locale-context';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', labelKey: 'admin.nav.dashboard', icon: LayoutDashboard },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const t = useT();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="border-b border-sidebar-border px-5 py-5">
        <p className="text-sm font-semibold tracking-tight">
          {t('admin.shell.title')}
        </p>
        <p className="mt-1 text-xs text-sidebar-foreground/70">
          {t('admin.shell.subtitle')}
        </p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map(({ href, labelKey, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground',
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {t(labelKey)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
