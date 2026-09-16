'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type HeaderIconButtonProps = {
  label: string;
  onClick?: () => void;
  badge?: number;
  badgeClassName?: string;
  children: ReactNode;
  className?: string;
};

export function HeaderIconButton({
  label,
  onClick,
  badge,
  badgeClassName,
  children,
  className,
}: HeaderIconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative rounded-md p-2 text-admin-header-foreground hover:bg-white/10',
        className,
      )}
      aria-label={label}
    >
      {children}
      {badge != null && badge > 0 ? (
        <span
          className={cn(
            'absolute top-1 right-1 flex min-w-4 items-center justify-center rounded-full px-0.5 text-[10px] leading-4 font-bold text-white',
            badgeClassName ?? 'bg-emerald-500',
          )}
        >
          {badge > 99 ? '99+' : badge}
        </span>
      ) : null}
    </button>
  );
}
