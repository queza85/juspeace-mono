import { cn } from '@/lib/utils';

export const qaInputClassName =
  'h-9 w-full rounded-none border bg-white px-2.5 font-mono text-[11px] text-black outline-none placeholder:text-jp-muted sm:text-xs';

export function qaFieldClassName(hasError: boolean) {
  return cn(
    qaInputClassName,
    hasError
      ? 'border-jp-accent-red focus:border-jp-accent-red'
      : 'border-black/15 focus:border-black/40',
  );
}

export function fieldErrorText(errors: unknown[], fallback: string): string | null {
  if (!errors.length) {
    return null;
  }

  const first = errors[0];
  if (typeof first === 'string') {
    return first;
  }
  if (
    first &&
    typeof first === 'object' &&
    'message' in first &&
    typeof (first as { message: unknown }).message === 'string'
  ) {
    return (first as { message: string }).message;
  }
  return fallback;
}
