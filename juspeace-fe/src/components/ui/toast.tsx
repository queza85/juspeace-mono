'use client';

import { create } from 'zustand';
import { cn } from '@/lib/utils';

export type ToastVariant = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastState {
  toasts: ToastItem[];
  push: (message: string, variant?: ToastVariant) => void;
  dismiss: (id: string) => void;
}

const TOAST_DURATION_MS = 3000;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (message, variant = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    set((state) => ({
      toasts: [...state.toasts, { id, message, variant }],
    }));
    window.setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== id),
      }));
    }, TOAST_DURATION_MS);
  },
  dismiss: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}));

export function toast(message: string, variant: ToastVariant = 'success') {
  useToastStore.getState().push(message, variant);
}

export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed top-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2"
      aria-live="polite"
    >
      {toasts.map((item) => (
        <div
          key={item.id}
          role="status"
          className={cn(
            'pointer-events-auto rounded-lg border px-4 py-3 text-sm shadow-md backdrop-blur',
            item.variant === 'success' &&
              'border-emerald-200 bg-emerald-50 text-emerald-950',
            item.variant === 'error' &&
              'border-destructive/30 bg-destructive/10 text-destructive',
            item.variant === 'info' &&
              'border-border bg-background text-foreground',
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="leading-snug">{item.message}</p>
            <button
              type="button"
              className="shrink-0 text-xs opacity-60 hover:opacity-100"
              onClick={() => dismiss(item.id)}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
