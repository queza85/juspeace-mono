'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type HeaderIconButtonProps = {
  label: string;
  href?: string;
  current?: boolean;
  onClick?: () => void;
  badge?: number;
  badgeClassName?: string;
  children: ReactNode;
  className?: string;
};

export function HeaderIconButton({
  label,
  href,
  current = false,
  onClick,
  badge,
  badgeClassName,
  children,
  className,
}: HeaderIconButtonProps) {
  const classes = cn(
    'relative cursor-pointer rounded-md p-2 text-admin-header-foreground hover:bg-white/10',
    className,
  );
  const content = (
    <>
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
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={classes}
        aria-label={label}
        aria-current={current ? 'page' : undefined}
      >
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes} aria-label={label}>
      {content}
    </button>
  );
}
