'use client';

import { memo, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n/locale-context';
import type { ProductReviewRow } from '@/lib/products/mock-data';

function ProductReviewDeleteDialogComponent({
  open,
  review,
  onClose,
  onConfirm,
}: {
  open: boolean;
  review: ProductReviewRow | null;
  onClose: () => void;
  onConfirm: () => void;
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

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label={t('admin.products.detail.reviews.deleteDialog.close')}
        onClick={onClose}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="review-delete-dialog-title"
        aria-describedby="review-delete-dialog-description"
        className="relative z-10 w-full max-w-[400px] rounded-2xl border border-border/60 bg-card px-6 py-6 text-center shadow-xl"
      >
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#fee2e2]">
          <Trash2 className="size-5 text-[#ef4444]" aria-hidden />
        </div>

        <h2
          id="review-delete-dialog-title"
          className="mt-4 text-base font-bold text-[#111827]"
        >
          {t('admin.products.detail.reviews.deleteDialog.title')}
        </h2>

        <p
          id="review-delete-dialog-description"
          className="mt-2 text-[13px] leading-relaxed text-[#6b7280]"
        >
          {t('admin.products.detail.reviews.deleteDialog.description')}
        </p>

        <div className="mt-6 flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-9 flex-1 rounded-lg"
            onClick={onClose}
          >
            {t('admin.products.detail.reviews.deleteDialog.cancel')}
          </Button>
          <Button
            type="button"
            className="h-9 flex-1 rounded-lg bg-[#ef4444] text-white hover:bg-[#dc2626]"
            onClick={onConfirm}
          >
            {t('admin.products.detail.reviews.deleteDialog.delete')}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export const ProductReviewDeleteDialog = memo(ProductReviewDeleteDialogComponent);
