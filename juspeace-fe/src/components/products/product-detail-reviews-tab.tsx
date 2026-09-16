'use client';

import Image from 'next/image';
import { Paperclip, Star } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/components/ui/toast';
import { useT } from '@/lib/i18n/locale-context';
import { PRODUCT_REVIEW_SAMPLES } from '@/lib/products/review-samples';
import { cn } from '@/lib/utils';

const AVATAR_TONE_CLASS = {
  slate: 'bg-[#e8e8e8] text-[#555]',
  rose: 'bg-[#f3e8e8] text-[#7a5555]',
} as const;

function ReviewStars({
  rating,
  max = 5,
  interactive = false,
  onChange,
  starClassName,
}: {
  rating: number;
  max?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  starClassName?: string;
}) {
  const t = useT();

  return (
    <div
      className="flex items-center gap-0.5"
      role={interactive ? 'radiogroup' : undefined}
      aria-label={t('products.detail.ratingLabel', { count: rating })}
    >
      {Array.from({ length: max }).map((_, index) => {
        const value = index + 1;
        const filled = value <= rating;

        if (interactive) {
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={filled}
              aria-label={t('products.detail.reviews.form.starLabel', {
                count: value,
              })}
              className="inline-flex items-center justify-center p-0.5"
              onClick={() => onChange?.(value)}
            >
              <Star
                className={cn(
                  'size-3.5 transition-colors',
                  filled
                    ? 'fill-[#f5a623] text-[#f5a623]'
                    : 'fill-transparent text-[#d1d5db]',
                  starClassName,
                )}
                aria-hidden
              />
            </button>
          );
        }

        return (
          <Star
            key={value}
            className={cn(
              'size-3 fill-[#f5a623] text-[#f5a623]',
              starClassName,
            )}
            aria-hidden
          />
        );
      })}
    </div>
  );
}

function ReviewAvatar({
  initials,
  tone,
}: {
  initials: string;
  tone: keyof typeof AVATAR_TONE_CLASS;
}) {
  return (
    <div
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold sm:size-9',
        AVATAR_TONE_CLASS[tone],
      )}
      aria-hidden
    >
      {initials}
    </div>
  );
}

function ReviewCard({
  review,
}: {
  review: (typeof PRODUCT_REVIEW_SAMPLES)[number];
}) {
  const t = useT();

  return (
    <article className="border-b border-black/15 py-4 last:border-b-0 lg:py-5">
      <div className="flex gap-2.5 sm:gap-3">
        <ReviewAvatar initials={review.avatarInitials} tone={review.avatarTone} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-display text-xs font-semibold text-black sm:text-[13px]">
                {t(review.reviewerNameKey)}
              </p>
              <p className="mt-0.5 font-mono text-[10px] text-jp-muted">
                {t(review.reviewerEmailKey)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <ReviewStars rating={review.rating} />
              <p className="font-mono text-[10px] text-jp-muted">
                {t(review.postedAtKey)}
              </p>
            </div>
          </div>

          <div className="mt-3 space-y-2 font-mono text-[11px] leading-[1.8] text-black/80 sm:text-xs sm:leading-[1.85]">
            {review.titleKey ? (
              <p className="text-black">{t(review.titleKey)}</p>
            ) : null}
            <p>{t(review.bodyKey)}</p>
            {review.photoSrc ? (
              <div className="relative mt-1 size-14 overflow-hidden bg-jp-light-gray sm:size-16">
                <Image
                  src={review.photoSrc}
                  alt={t('products.detail.reviews.photoAlt')}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

export function ProductDetailReviewsTab() {
  const t = useT();
  const [draftRating, setDraftRating] = useState(0);
  const [draftReview, setDraftReview] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast(t('products.detail.reviews.form.submitPreview'), 'success');
    setDraftRating(0);
    setDraftReview('');
  };

  return (
    <div>
      <div>
        {PRODUCT_REVIEW_SAMPLES.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      <section className="mt-8 lg:mt-10">
        <h3 className="font-display text-base font-bold text-black sm:text-lg">
          {t('products.detail.reviews.form.heading')}
        </h3>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div>
            <p className="font-mono text-[11px] text-jp-muted sm:text-xs">
              {t('products.detail.reviews.form.ratingLabel')}
            </p>
            <div className="mt-1.5">
              <ReviewStars
                rating={draftRating}
                interactive
                onChange={setDraftRating}
                starClassName="size-4 sm:size-[18px]"
              />
            </div>
          </div>

          <div>
            <p className="font-mono text-[11px] text-jp-muted sm:text-xs">
              {t('products.detail.reviews.form.reviewLabel')}
            </p>
            <div className="relative mt-1.5">
              <textarea
                value={draftReview}
                onChange={(event) => setDraftReview(event.target.value)}
                placeholder={t('products.detail.reviews.form.placeholder')}
                rows={6}
                className="w-full resize-y border border-black/15 bg-white px-3 py-2.5 font-mono text-[11px] leading-relaxed text-black outline-none placeholder:text-jp-muted/70 focus:border-black/30 sm:text-xs"
              />
              <Paperclip
                className="pointer-events-none absolute right-3 top-3 size-3 text-jp-muted/60"
                aria-hidden
              />
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex h-9 items-center justify-center bg-black px-6 font-mono text-[11px] text-white transition-opacity hover:opacity-90 sm:text-xs"
          >
            {t('products.detail.reviews.form.submit')}
          </button>
        </form>
      </section>
    </div>
  );
}
