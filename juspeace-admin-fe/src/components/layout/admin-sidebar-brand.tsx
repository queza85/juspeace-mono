'use client';

import Image from 'next/image';
import {
  SIDEBAR_WIDTH_CLASS,
  sidebarAnimateClass,
  sidebarContentAnimateClass,
} from '@/components/layout/admin-layout.constants';
import { useT } from '@/lib/i18n/locale-context';
import { cn } from '@/lib/utils';

type AdminSidebarBrandProps = {
  open?: boolean;
  className?: string;
};

export function AdminSidebarBrand({
  open = true,
  className,
}: AdminSidebarBrandProps) {
  const t = useT();

  return (
    <div
      className={cn(
        'flex h-14 shrink-0 items-center overflow-hidden border-r border-white/10 bg-admin-header text-admin-header-foreground',
        sidebarAnimateClass,
        open ? cn(SIDEBAR_WIDTH_CLASS, 'px-4') : 'w-0 border-r-0 px-0',
        className,
      )}
    >
      <div
        className={cn(
          'flex min-w-[13rem] items-center gap-3',
          sidebarContentAnimateClass,
        )}
        data-open={open ? 'true' : 'false'}
      >
        <Image
          src="/logo.png"
          alt=""
          width={32}
          height={32}
          className="size-8 shrink-0 rounded-full bg-white object-contain p-0.5"
        />
        <p className="truncate text-sm font-semibold">{t('admin.shell.title')}</p>
      </div>
    </div>
  );
}
