'use client';

import { memo, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  TABLE_PAGE_SIZE_OPTIONS,
  type TablePageSize,
} from '@/lib/table/pagination';
import { cn } from '@/lib/utils';

const selectClassName =
  'h-7 w-12 appearance-none rounded-md border border-border/70 bg-background py-0 pr-6 pl-2.5 text-[11px] text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30';

export interface TablePageSizeSelectProps {
  value: TablePageSize;
  onChange: (pageSize: TablePageSize) => void;
  ariaLabel: string;
  className?: string;
  options?: readonly TablePageSize[];
}

function TablePageSizeSelectComponent({
  value,
  onChange,
  ariaLabel,
  className,
  options = TABLE_PAGE_SIZE_OPTIONS,
}: TablePageSizeSelectProps) {
  return (
    <div className={cn('relative shrink-0', className)}>
      <select
        aria-label={ariaLabel}
        value={String(value)}
        onChange={(event) => onChange(Number(event.target.value) as TablePageSize)}
        className={selectClassName}
      >
        {options.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-1.5 size-3 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
    </div>
  );
}

export const TablePageSizeSelect = memo(TablePageSizeSelectComponent);

export function TableFilterSelect({
  icon,
  ariaLabel,
  value,
  onChange,
  children,
  className,
}: {
  icon?: ReactNode;
  ariaLabel: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}) {
  const filterSelectClassName =
    'h-7 w-[7.25rem] appearance-none rounded-md border border-border/70 bg-background py-0 pr-6 pl-7 text-[11px] text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30';

  return (
    <div className={cn('relative shrink-0', className)}>
      {icon ? (
        <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
      ) : null}
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(filterSelectClassName, icon ? 'pl-7' : 'pl-2.5')}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-1.5 size-3 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
    </div>
  );
}
