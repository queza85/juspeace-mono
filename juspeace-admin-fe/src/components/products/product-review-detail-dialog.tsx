'use client';

import { memo, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { X } from 'lucide-react';
import { ProductStarRating } from '@/components/products/product-star-rating';
import {
  DialogMetaField,
  DialogSectionLabel,
  ReviewDialogSidebar,
} from '@/components/products/product-review-dialog-primitives';
import type { Product } from '@/lib/api/types';
import { useT } from '@/lib/i18n/locale-context';
import {
  formatProductSku,
  getProductImageSrc,
  inferCategoryLabel,
} from '@/lib/products/product-display';
import type { ProductReviewRow } from '@/lib/products/mock-data';

function ProductReviewDetailDialogComponent({
  open,
  review,
  product,
  onClose,
}: {
  open: boolean;
  review: ProductReviewRow | null;
  product: Product;
  onClose: () => void;
}) {
  const t = useT();

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

  if (!open || !review) {
    return null;
  }

  const productImageSrc = getProductImageSrc(product.slug, product.imageUrl);
  const sku = formatProductSku(product.slug);
  const category = inferCategoryLabel(product.slug);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label={t('admin.products.detail.reviews.detailDialog.close')}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-detail-dialog-title"
        className="relative z-10 flex max-h-[90vh] w-full max-w-[860px] flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <h2
            id="review-detail-dialog-title"
            className="text-[15px] font-bold text-[#111827]"
          >
            {t('admin.products.detail.reviews.detailDialog.title')}
          </h2>
          <button
            type="button"
            aria-label={t('admin.products.detail.reviews.detailDialog.close')}
            className="inline-flex size-8 items-center justify-center rounded-md text-[#9ca3af] transition-colors hover:bg-muted hover:text-foreground"
            onClick={onClose}
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[272px_minmax(0,1fr)]">
          <ReviewDialogSidebar review={review} />

          <div className="min-w-0 px-6 py-5">
            <div className="border-b border-border/60 pb-5">
              <DialogSectionLabel>{t('admin.products.detail.reviews.detailDialog.product')}</DialogSectionLabel>
              <div className="mt-3 flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-md border border-border/40 bg-muted">
                    {productImageSrc ? (
                      <Image
                        src={productImageSrc}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-[13px] font-semibold leading-snug text-[#111827]">
                      {product.name}
                    </p>
                    <p className="mt-1 text-[11px] text-[#9ca3af]">
                      {t('admin.products.detail.reviews.detailDialog.productSku', {
                        sku,
                        category,
                      })}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 pt-0.5 text-right">
                  <p className="text-[11px] text-[#9ca3af]">
                    {t('admin.products.detail.reviews.detailDialog.rating')}
                  </p>
                  <ProductStarRating
                    rating={review.rating}
                    className="mt-1 justify-end"
                    starClassName="size-3.5"
                  />
                  <p className="mt-1 text-[11px] text-[#9ca3af]">
                    {t('admin.products.detail.reviews.detailDialog.ratingOutOf', {
                      rating: review.rating,
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5 pt-5">
              <DialogMetaField label={t('admin.products.detail.reviews.detailDialog.reviewTitle')}>
                <p className="text-[13px] font-semibold text-[#111827]">{t(review.titleKey)}</p>
              </DialogMetaField>

              <DialogMetaField
                label={t('admin.products.detail.reviews.detailDialog.reviewContent')}
              >
                <p className="text-[13px] leading-relaxed text-[#6b7280] italic">
                  {t(review.contentKey)}
                </p>
              </DialogMetaField>

              {review.photoSrc ? (
                <DialogMetaField label={t('admin.products.detail.reviews.detailDialog.photo')}>
                  <div className="relative mt-2 size-[72px] overflow-hidden rounded-md border border-border/60 bg-muted">
                    <Image
                      src={review.photoSrc}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="72px"
                    />
                  </div>
                </DialogMetaField>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export const ProductReviewDetailDialog = memo(ProductReviewDetailDialogComponent);
