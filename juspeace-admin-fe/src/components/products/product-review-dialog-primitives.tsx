'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import type { ProductReviewRow } from '@/lib/products/mock-data';
import { useT } from '@/lib/i18n/locale-context';
import { cn } from '@/lib/utils';

export function DialogSectionLabel({
  children,
  variant = 'content',
}: {
  children: ReactNode;
  variant?: 'sidebar' | 'content';
}) {
  return (
    <p
      className={cn(
        'text-[#9ca3af]',
        variant === 'sidebar'
          ? 'text-[11px] font-normal'
          : 'text-[10px] font-medium tracking-wide uppercase',
      )}
    >
      {children}
    </p>
  );
}

export function DialogMetaField({
  label,
  children,
  variant = 'content',
  compact = false,
}: {
  label: string;
  children: ReactNode;
  variant?: 'sidebar' | 'content';
  compact?: boolean;
}) {
  return (
    <div className={cn(compact ? 'space-y-1' : 'space-y-1.5')}>
      <DialogSectionLabel variant={variant}>{label}</DialogSectionLabel>
      <div>{children}</div>
    </div>
  );
}

export function ReviewStatusBadge({ status }: { status: ProductReviewRow['status'] }) {
  const t = useT();

  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium',
        status === 'published'
          ? 'bg-[#ede9fe] text-[#6d28d9]'
          : 'bg-orange-50 text-orange-600',
      )}
    >
      {t(`admin.products.detail.reviews.status.${status}`)}
    </span>
  );
}

export function ReviewDialogSidebar({
  review,
  compact = false,
}: {
  review: ProductReviewRow;
  compact?: boolean;
}) {
  const t = useT();
  const reviewDateLabel = `${review.date}, ${review.time}`;

  return (
    <aside
      className={cn(
        'border-b border-border/60 bg-[#fafafa] lg:border-r lg:border-b-0',
        compact ? 'px-4 py-3' : 'px-6 py-5',
      )}
    >
      <div
        className={cn(
          'flex items-center gap-2.5 border-b border-border/60',
          compact ? 'pb-3' : 'pb-5',
        )}
      >
        <div
          className={cn(
            'relative shrink-0 overflow-hidden rounded-full bg-muted',
            compact ? 'size-8' : 'size-9',
          )}
        >
          {review.avatarSrc ? (
            <Image
              src={review.avatarSrc}
              alt=""
              fill
              className="object-cover"
              sizes="36px"
            />
          ) : (
            <span className="flex size-full items-center justify-center text-[10px] font-semibold text-muted-foreground">
              {review.reviewerName.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-[#111827]">
            {review.reviewerName}
          </p>
          <p className="truncate text-[11px] text-[#9ca3af]">{review.reviewerEmail}</p>
        </div>
      </div>

      <div className={cn(compact ? 'space-y-3 pt-3' : 'space-y-4 pt-5')}>
        <DialogMetaField
          label={t('admin.products.detail.reviews.detailDialog.orderId')}
          variant="sidebar"
          compact={compact}
        >
          <p className={cn('font-normal text-[#374151]', compact ? 'text-xs' : 'text-[13px]')}>
            {review.orderId}
          </p>
        </DialogMetaField>

        <DialogMetaField
          label={t('admin.products.detail.reviews.detailDialog.reviewDate')}
          variant="sidebar"
          compact={compact}
        >
          <p className={cn('font-normal text-[#374151]', compact ? 'text-xs' : 'text-[13px]')}>
            {reviewDateLabel}
          </p>
        </DialogMetaField>

        <DialogMetaField
          label={t('admin.products.detail.reviews.detailDialog.reviewStatus')}
          variant="sidebar"
          compact={compact}
        >
          <ReviewStatusBadge status={review.status} />
        </DialogMetaField>
      </div>
    </aside>
  );
}
