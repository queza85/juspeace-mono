'use client';

import { memo, useMemo } from 'react';
import Image from 'next/image';
import { CircleCheck, Eye, Pencil, Star, Trash2 } from 'lucide-react';
import { ProductStarRating } from '@/components/products/product-star-rating';
import type { Product } from '@/lib/api/types';
import { useT } from '@/lib/i18n/locale-context';
import {
  getProductReviewSummary,
  getProductReviews,
  type ProductReviewStatus,
} from '@/lib/products/mock-data';
import { cn } from '@/lib/utils';

function ReviewStatusBadge({ status }: { status: ProductReviewStatus }) {
  const t = useT();

  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-medium',
        status === 'published'
          ? 'bg-[#ede9fe] text-[#6d28d9]'
          : 'bg-orange-50 text-orange-600',
      )}
    >
      {t(`admin.products.detail.reviews.status.${status}`)}
    </span>
  );
}

function ReviewActionButton({
  label,
  children,
  destructive = false,
}: {
  label: string;
  children: React.ReactNode;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        'inline-flex size-6 items-center justify-center rounded-full border border-border/70 bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
        destructive && 'hover:border-destructive/30 hover:text-destructive',
      )}
    >
      {children}
    </button>
  );
}

function ProductDetailReviewsComponent({ product }: { product: Product }) {
  const t = useT();
  const summary = useMemo(
    () => getProductReviewSummary(product.slug),
    [product.slug],
  );
  const reviews = useMemo(() => getProductReviews(product.slug), [product.slug]);
  const maxDistribution = Math.max(...summary.distribution.map((item) => item.count), 1);
  const summaryText = t('admin.products.detail.reviews.summaryDescription');

  return (
    <section className="overflow-hidden rounded-lg border border-border/60 bg-card">
      <h2 className="border-b border-border/60 px-4 py-3 text-sm font-semibold text-[#111827]">
        {t('admin.products.detail.reviews.title')}
      </h2>

      <div className="grid gap-4 border-b border-dashed border-border/60 px-4 py-4 lg:grid-cols-[88px_minmax(0,1fr)_200px] lg:items-start">
        <div className="flex flex-col items-center gap-2 pt-1">
          <div className="flex size-12 items-center justify-center rounded-full border border-sky-100 bg-orange-50 text-orange-500 shadow-[0_0_0_1px_rgba(125,211,252,0.35)]">
            <CircleCheck className="size-5" aria-hidden />
          </div>
          <ProductStarRating
            rating={0}
            starClassName="size-3 fill-transparent text-[#d1d5db]"
          />
        </div>

        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[1.65rem] font-bold leading-none text-[#111827]">
              {summary.averageRating.toFixed(2)}
            </span>
            <Star className="size-4 fill-[#5d3e9e] text-[#5d3e9e]" aria-hidden />
          </div>
          <p className="text-[12px] leading-relaxed text-[#374151]">{summaryText}</p>
          <p className="text-[11px] leading-relaxed text-[#9ca3af]">{summaryText}</p>
          <span className="inline-flex rounded-full bg-[#ede9fe] px-2.5 py-0.5 text-[10px] font-semibold text-[#6d28d9]">
            {t('admin.products.detail.reviews.newThisWeek', {
              count: summary.newThisWeek,
            })}
          </span>
        </div>

        <div className="space-y-2 lg:pt-1">
          {summary.distribution.map((item) => (
            <div
              key={item.stars}
              className="grid grid-cols-[3.25rem_1fr_1.75rem] items-center gap-2"
            >
              <span className="text-[10px] text-[#9ca3af]">
                {t('admin.products.detail.reviews.starLabel', { count: item.stars })}
              </span>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#dbeafe]/60">
                <div
                  className="h-full rounded-full bg-orange-400"
                  style={{ width: `${(item.count / maxDistribution) * 100}%` }}
                />
              </div>
              <span className="text-right text-[10px] font-medium text-[#374151]">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-xs">
          <thead>
            <tr className="border-b border-border/60 text-left text-[10px] font-medium tracking-wide text-[#9ca3af] uppercase">
              <th className="px-4 py-3">{t('admin.products.detail.reviews.columns.reviewer')}</th>
              <th className="px-4 py-3">{t('admin.products.detail.reviews.columns.review')}</th>
              <th className="px-4 py-3">{t('admin.products.detail.reviews.columns.date')}</th>
              <th className="px-4 py-3">{t('admin.products.detail.reviews.columns.status')}</th>
              <th className="px-4 py-3">{t('admin.products.detail.reviews.columns.action')}</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr
                key={review.id}
                className="border-b border-border/40 last:border-0 hover:bg-muted/10"
              >
                <td className="px-4 py-3 align-top">
                  <div className="flex items-center gap-2.5">
                    <div className="relative size-8 shrink-0 overflow-hidden rounded-full bg-muted">
                      {review.avatarSrc ? (
                        <Image
                          src={review.avatarSrc}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="32px"
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
                      <p className="truncate text-[11px] text-[#9ca3af]">
                        {review.reviewerEmail}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="space-y-1">
                    <ProductStarRating rating={review.rating} starClassName="size-3" />
                    <p className="text-[13px] font-semibold text-[#111827]">
                      {t(review.titleKey)}
                    </p>
                    <p className="line-clamp-2 text-[11px] leading-relaxed text-[#9ca3af] italic">
                      {t(review.excerptKey)}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 align-top whitespace-nowrap text-[11px] text-[#9ca3af]">
                  {review.date} {review.time}
                </td>
                <td className="px-4 py-3 align-top">
                  <ReviewStatusBadge status={review.status} />
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="flex items-center gap-1">
                    <ReviewActionButton label={t('admin.products.detail.reviews.actions.view')}>
                      <Eye className="size-3" />
                    </ReviewActionButton>
                    <ReviewActionButton label={t('admin.products.detail.reviews.actions.edit')}>
                      <Pencil className="size-3" />
                    </ReviewActionButton>
                    <ReviewActionButton
                      label={t('admin.products.detail.reviews.actions.delete')}
                      destructive
                    >
                      <Trash2 className="size-3" />
                    </ReviewActionButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export const ProductDetailReviews = memo(ProductDetailReviewsComponent);
