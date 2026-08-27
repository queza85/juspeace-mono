'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  ClipboardList,
  FileText,
  LayoutDashboard,
  LayoutGrid,
  MapPin,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  UserCircle,
  Wallet,
} from 'lucide-react';
import { AdminSidebarBrand } from '@/components/layout/admin-sidebar-brand';
import {
  SIDEBAR_WIDTH_CLASS,
  sidebarAnimateClass,
  sidebarContentAnimateClass,
} from '@/components/layout/admin-layout.constants';
import { useT } from '@/lib/i18n/locale-context';
import { cn } from '@/lib/utils';

type NavItem = {
  href?: string;
  labelKey: string;
  icon: LucideIcon;
  disabled?: boolean;
};

type NavSection = {
  sectionKey: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    sectionKey: 'admin.nav.sections.menu',
    items: [
      { href: '/dashboard', labelKey: 'admin.nav.dashboard', icon: LayoutDashboard },
    ],
  },
  {
    sectionKey: 'admin.nav.sections.apps',
    items: [
      { labelKey: 'admin.nav.orders', icon: ShoppingCart, disabled: true },
      { labelKey: 'admin.nav.inventory', icon: ClipboardList, disabled: true },
      { href: '/products', labelKey: 'admin.nav.products', icon: ShoppingBag },
      { labelKey: 'admin.nav.customers', icon: UserCircle, disabled: true },
      { labelKey: 'admin.nav.shipping', icon: MapPin, disabled: true },
      { labelKey: 'admin.nav.payments', icon: Wallet, disabled: true },
    ],
  },
  {
    sectionKey: 'admin.nav.sections.others',
    items: [
      { labelKey: 'admin.nav.reports', icon: FileText, disabled: true },
      { labelKey: 'admin.nav.content', icon: LayoutGrid, disabled: true },
      { labelKey: 'admin.nav.adminManagement', icon: UserCircle, disabled: true },
      { labelKey: 'admin.nav.settings', icon: SlidersHorizontal, disabled: true },
    ],
  },
];

function NavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const t = useT();
  const Icon = item.icon;
  const active =
    item.href != null &&
    (pathname === item.href || pathname.startsWith(`${item.href}/`));

  const className = cn(
    'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
    active
      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
      : item.disabled
        ? 'cursor-not-allowed text-sidebar-foreground/50'
        : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
  );

  if (item.disabled || !item.href) {
    return (
      <span className={className} aria-disabled="true">
        <Icon className="size-4 shrink-0" aria-hidden />
        {t(item.labelKey)}
      </span>
    );
  }

  return (
    <Link href={item.href} className={className} onClick={onNavigate}>
      <Icon className="size-4 shrink-0" aria-hidden />
      {t(item.labelKey)}
    </Link>
  );
}

function AdminSidebarNav({
  onNavigate,
  className,
  open = true,
}: {
  onNavigate?: () => void;
  className?: string;
  open?: boolean;
}) {
  const pathname = usePathname();
  const t = useT();

  return (
    <nav
      className={cn(
        'flex flex-1 flex-col overflow-y-auto border-r border-sidebar-border bg-sidebar text-sidebar-foreground',
        className,
      )}
    >
      <div
        className={cn(
          'flex min-w-[15rem] flex-col gap-6 p-4',
          sidebarContentAnimateClass,
        )}
        data-open={open ? 'true' : 'false'}
      >
        {navSections.map((section) => (
          <div key={section.sectionKey}>
            <p className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              {t(section.sectionKey)}
            </p>
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.labelKey}
                  item={item}
                  pathname={pathname}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}

type AdminSidebarProps = {
  collapsed?: boolean;
  onNavigate?: () => void;
  /** Full sidebar for mobile overlay (includes brand + nav). */
  variant?: 'nav' | 'full';
};

export function AdminSidebar({
  collapsed,
  onNavigate,
  variant = 'nav',
}: AdminSidebarProps) {
  if (variant === 'full') {
    return (
      <aside className="flex h-full w-60 flex-col bg-sidebar">
        <AdminSidebarBrand />
        <AdminSidebarNav onNavigate={onNavigate} className="border-r-0" />
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        'flex shrink-0 flex-col overflow-hidden',
        sidebarAnimateClass,
        collapsed ? 'w-0' : SIDEBAR_WIDTH_CLASS,
      )}
    >
      <AdminSidebarNav onNavigate={onNavigate} open={!collapsed} />
    </aside>
  );
}
