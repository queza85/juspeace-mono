import { cn } from '@/lib/utils';
import type { OrderStatusTone } from '@/lib/dashboard/mock-data';

const toneStyles: Record<OrderStatusTone, string> = {
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-red-50 text-red-600',
  info: 'bg-blue-50 text-blue-700',
  neutral: 'bg-muted text-muted-foreground',
  accent: 'bg-violet-50 text-violet-700',
};

export function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: OrderStatusTone;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium',
        toneStyles[tone],
      )}
    >
      {label}
    </span>
  );
}
