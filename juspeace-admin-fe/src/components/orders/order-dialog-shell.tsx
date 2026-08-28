'use client';

import { useCallback, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function useOrderDialog(open: boolean, onClose: () => void) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [handleKeyDown, open]);
}

export function OrderDialogFrame({
  open,
  onClose,
  closeLabel,
  title,
  description,
  titleId,
  descriptionId,
  icon: Icon,
  iconClassName,
  iconWrapClassName,
  iconPresentation = 'circle',
  children,
  footer,
  role = 'dialog',
}: {
  open: boolean;
  onClose: () => void;
  closeLabel: string;
  title: string;
  description: string;
  titleId: string;
  descriptionId: string;
  icon: LucideIcon;
  iconClassName?: string;
  iconWrapClassName?: string;
  iconPresentation?: 'circle' | 'plain';
  children?: ReactNode;
  footer: ReactNode;
  role?: 'dialog' | 'alertdialog';
}) {
  useOrderDialog(open, onClose);

  if (!open) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label={closeLabel}
        onClick={onClose}
      />
      <div
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative z-10 w-full max-w-[400px] rounded-2xl border border-border/60 bg-card px-6 py-6 shadow-xl"
      >
        <div className="text-center">
          {iconPresentation === 'plain' ? (
            <Icon
              className={cn('mx-auto size-8', iconClassName ?? 'text-[#374151]')}
              aria-hidden
            />
          ) : (
            <div
              className={cn(
                'mx-auto flex size-12 items-center justify-center rounded-full',
                iconWrapClassName ?? 'bg-violet-100',
              )}
            >
              <Icon className={cn('size-5', iconClassName ?? 'text-violet-600')} aria-hidden />
            </div>
          )}

          <h2 id={titleId} className="mt-4 text-base font-bold text-foreground">
            {title}
          </h2>

          <p id={descriptionId} className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>

        {children ? <div className="mt-5">{children}</div> : null}

        <div className={cn('flex gap-3', children ? 'mt-6' : 'mt-6')}>{footer}</div>
      </div>
    </div>,
    document.body,
  );
}

export function OrderDialogActions({
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
  confirmClassName,
}: {
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmClassName?: string;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-border/70 bg-background text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        {cancelLabel}
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className={cn(
          'inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90',
          confirmClassName,
        )}
      >
        {confirmLabel}
      </button>
    </>
  );
}

export const orderSelectClassName = cn(
  'h-10 w-full appearance-none rounded-lg border border-border/70 bg-background',
  'px-3 pr-9 text-sm text-foreground outline-none',
  'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30',
);

export const orderInputClassName = cn(
  'h-10 w-full rounded-lg border border-border/70 bg-background px-3 text-sm text-foreground outline-none',
  'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30',
);

export const orderTextareaClassName = cn(
  'w-full resize-none rounded-lg border border-border/70 bg-background px-3 py-2.5 text-sm text-foreground outline-none',
  'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30',
);
