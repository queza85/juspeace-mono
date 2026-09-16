import { cn } from '@/lib/utils';

export function DashboardEmptyState({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex min-h-32 items-center justify-center rounded-none border border-dashed border-border/80 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground',
        className,
      )}
    >
      {message}
    </div>
  );
}
