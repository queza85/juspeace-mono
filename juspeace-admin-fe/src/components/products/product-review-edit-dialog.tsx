'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { ChevronDown, Plus, X } from 'lucide-react';
import { ProductStarRating } from '@/components/products/product-star-rating';
import {
  DialogMetaField,
  DialogSectionLabel,
  ReviewDialogSidebar,
} from '@/components/products/product-review-dialog-primitives';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import type { Product } from '@/lib/api/types';
import { useT } from '@/lib/i18n/locale-context';
import type { ProductReviewRow } from '@/lib/products/mock-data';
import { cn } from '@/lib/utils';

const TITLE_MAX_LENGTH = 100;
const CONTENT_MAX_LENGTH = 1000;
const PHOTO_MAX_COUNT = 5;

type ReviewPhoto = {
  id: string;
  src: string;
  isObjectUrl?: boolean;
};

function createInitialPhotos(review: ProductReviewRow): ReviewPhoto[] {
  return review.photoSrc
    ? [{ id: `${review.id}-photo-0`, src: review.photoSrc }]
    : [];
}

const reviewEditInputClassName =
  'h-8 w-full rounded-md border border-input bg-white px-2.5 text-[12px] text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20';

function ProductReviewEditForm({
  review,
  onClose,
}: {
  review: ProductReviewRow;
  onClose: () => void;
}) {
  const t = useT();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<string[]>([]);
  const [rating, setRating] = useState(review.rating);
  const [title, setTitle] = useState(() => t(review.titleKey));
  const [content, setContent] = useState(() => t(review.contentKey));
  const [photos, setPhotos] = useState<ReviewPhoto[]>(() => createInitialPhotos(review));

  const removePhoto = useCallback((photoId: string) => {
    setPhotos((current) => {
      const target = current.find((photo) => photo.id === photoId);
      if (target?.isObjectUrl) {
        URL.revokeObjectURL(target.src);
        objectUrlsRef.current = objectUrlsRef.current.filter((src) => src !== target.src);
      }
      return current.filter((photo) => photo.id !== photoId);
    });
  }, []);

  const addPhotos = useCallback((files: FileList | File[]) => {
    setPhotos((current) => {
      const remaining = PHOTO_MAX_COUNT - current.length;
      if (remaining <= 0) {
        return current;
      }

      const next = [...current];
      for (const file of Array.from(files).slice(0, remaining)) {
        if (!file.type.startsWith('image/')) {
          continue;
        }
        next.push({
          id: `${file.name}-${file.lastModified}-${Math.random()}`,
          src: URL.createObjectURL(file),
          isObjectUrl: true,
        });
        objectUrlsRef.current.push(next[next.length - 1].src);
      }
      return next;
    });
  }, []);

  const handleSave = useCallback(() => {
    toast(t('admin.products.detail.reviews.editDialog.savePreview'), 'success');
    onClose();
  }, [onClose, t]);

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((src) => URL.revokeObjectURL(src));
      objectUrlsRef.current = [];
    };
  }, []);

  return (
    <div className="flex min-h-0 min-w-0 flex-col">
      <div className="min-w-0 flex-1 space-y-3 px-4 py-3">
        <div className="border-b border-border/60 pb-3">
          <DialogSectionLabel>
            {t('admin.products.detail.reviews.detailDialog.product')}
          </DialogSectionLabel>
          <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[12px] font-semibold text-[#111827]">
                {t('admin.products.detail.reviews.detailDialog.rating')}
              </p>
              <ProductStarRating rating={rating} className="mt-1" starClassName="size-3.5" />
              <p className="mt-0.5 text-[10px] text-[#9ca3af]">
                {t('admin.products.detail.reviews.detailDialog.ratingOutOf', {
                  rating,
                })}
              </p>
            </div>
            <div className="relative min-w-[140px]">
              <select
                aria-label={t('admin.products.detail.reviews.editDialog.ratingSelect')}
                value={String(rating)}
                onChange={(event) => setRating(Number(event.target.value))}
                className={cn(reviewEditInputClassName, 'appearance-none pr-8')}
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value}>
                    {t(`admin.products.detail.reviews.editDialog.ratingOptions.${value}`)}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
            </div>
          </div>
        </div>

        <DialogMetaField
          label={t('admin.products.detail.reviews.detailDialog.reviewTitle')}
          compact
        >
          <div className="relative">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value.slice(0, TITLE_MAX_LENGTH))}
              className={cn(reviewEditInputClassName, 'pr-14')}
            />
            <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[10px] text-[#9ca3af]">
              {t('admin.products.detail.reviews.editDialog.characterCount', {
                current: title.length,
                max: TITLE_MAX_LENGTH,
              })}
            </span>
          </div>
        </DialogMetaField>

        <DialogMetaField
          label={t('admin.products.detail.reviews.detailDialog.reviewContent')}
          compact
        >
          <div className="relative">
            <textarea
              value={content}
              onChange={(event) =>
                setContent(event.target.value.slice(0, CONTENT_MAX_LENGTH))
              }
              rows={3}
              className={cn(reviewEditInputClassName, 'min-h-[72px] resize-y py-2 pb-6')}
            />
            <span className="pointer-events-none absolute right-2.5 bottom-1.5 text-[10px] text-[#9ca3af]">
              {t('admin.products.detail.reviews.editDialog.characterCount', {
                current: content.length,
                max: CONTENT_MAX_LENGTH,
              })}
            </span>
          </div>
        </DialogMetaField>

        <DialogMetaField label={t('admin.products.detail.reviews.detailDialog.photo')} compact>
          <div className="flex flex-wrap gap-2">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative size-14 overflow-hidden rounded-md border border-border/60 bg-muted"
              >
                <Image
                  src={photo.src}
                  alt=""
                  fill
                  unoptimized={photo.isObjectUrl}
                  className="object-cover"
                  sizes="56px"
                />
                <button
                  type="button"
                  aria-label={t('admin.products.detail.reviews.editDialog.removePhoto')}
                  className="absolute top-0.5 right-0.5 inline-flex size-4 items-center justify-center rounded-full bg-black/55 text-white"
                  onClick={() => removePhoto(photo.id)}
                >
                  <X className="size-2.5" aria-hidden />
                </button>
              </div>
            ))}
            {photos.length < PHOTO_MAX_COUNT ? (
              <button
                type="button"
                aria-label={t('admin.products.detail.reviews.editDialog.addPhoto')}
                className="inline-flex size-14 items-center justify-center rounded-md border border-dashed border-border/80 bg-muted/20 text-[#9ca3af] transition-colors hover:border-primary/40 hover:text-primary"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus className="size-4" aria-hidden />
              </button>
            ) : null}
          </div>
          <p className="mt-1.5 text-[10px] text-[#9ca3af]">
            {t('admin.products.detail.reviews.editDialog.photoHint')}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(event) => {
              if (event.target.files?.length) {
                addPhotos(event.target.files);
                event.target.value = '';
              }
            }}
          />
        </DialogMetaField>
      </div>

      <div className="flex justify-end gap-2 border-t border-border/60 px-4 py-3">
        <Button type="button" variant="outline" size="sm" className="h-8 px-3" onClick={onClose}>
          {t('admin.products.detail.reviews.editDialog.cancel')}
        </Button>
        <Button type="button" size="sm" className="h-8 px-3" onClick={handleSave}>
          {t('admin.products.detail.reviews.editDialog.saveChanges')}
        </Button>
      </div>
    </div>
  );
}

function ProductReviewEditDialogComponent({
  open,
  review,
  product: _product,
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

  void _product;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label={t('admin.products.detail.reviews.editDialog.close')}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-edit-dialog-title"
        className="relative z-10 flex max-h-[85vh] w-full max-w-[680px] flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <h2
            id="review-edit-dialog-title"
            className="text-sm font-bold text-[#111827]"
          >
            {t('admin.products.detail.reviews.editDialog.title')}
          </h2>
          <button
            type="button"
            aria-label={t('admin.products.detail.reviews.editDialog.close')}
            className="inline-flex size-8 items-center justify-center rounded-md text-[#9ca3af] transition-colors hover:bg-muted hover:text-foreground"
            onClick={onClose}
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[210px_minmax(0,1fr)]">
          <ReviewDialogSidebar review={review} compact />
          <ProductReviewEditForm key={review.id} review={review} onClose={onClose} />
        </div>
      </div>
    </div>,
    document.body,
  );
}

export const ProductReviewEditDialog = memo(ProductReviewEditDialogComponent);
