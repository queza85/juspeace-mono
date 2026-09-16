'use client';

import { memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useT } from '@/lib/i18n/locale-context';
import { cn } from '@/lib/utils';

export interface TablePaginationProps {
  showingFrom: number;
  showingTo: number;
  total: number;
  currentPage: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
  /** Domain noun shown in the summary, e.g. "products" or "orders". */
  itemLabel: string;
  className?: string;
}

function TablePaginationComponent({
  showingFrom,
  showingTo,
  total,
  currentPage,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  onPageChange,
  itemLabel,
  className,
}: TablePaginationProps) {
  const t = useT();

  return (
    <div
      className={cn(
        'flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <p className="text-[11px] text-muted-foreground">
        {t('common.pagination.showing', {
          from: showingFrom,
          to: showingTo,
          total,
          itemLabel,
        })}
      </p>

      <nav
        className="flex items-center gap-1"
        aria-label={t('common.pagination.navigation')}
      >
        <button
          type="button"
          disabled={!hasPreviousPage}
          onClick={() => onPageChange(currentPage - 1)}
          className="inline-flex size-7 items-center justify-center rounded-md border border-border/70 bg-background text-muted-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={t('common.pagination.previous')}
        >
          <ChevronLeft className="size-3.5" aria-hidden />
        </button>

        <span
          className="inline-flex size-7 items-center justify-center rounded-md bg-primary text-[11px] font-semibold text-primary-foreground"
          aria-current="page"
          aria-label={t('common.pagination.currentPage', {
            page: currentPage,
            totalPages,
          })}
        >
          {currentPage}
        </span>

        <button
          type="button"
          disabled={!hasNextPage}
          onClick={() => onPageChange(currentPage + 1)}
          className="inline-flex size-7 items-center justify-center rounded-md border border-border/70 bg-background text-muted-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={t('common.pagination.next')}
        >
          <ChevronRight className="size-3.5" aria-hidden />
        </button>
      </nav>
    </div>
  );
}

export const TablePagination = memo(TablePaginationComponent);
