'use client';

import { memo } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

function ProductStarRatingComponent({
  rating,
  className,
  starClassName,
}: {
  rating: number;
  className?: string;
  starClassName?: string;
}) {
  return (
    <div className={cn('inline-flex items-center gap-0.5', className)}>
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = rating >= index + 1;
        const partial = !filled && rating > index;

        return (
          <Star
            key={index}
            className={cn(
              'size-3.5',
              filled || partial
                ? 'fill-amber-400 text-amber-400'
                : 'fill-muted/40 text-muted-foreground/30',
              starClassName,
            )}
            aria-hidden
          />
        );
      })}
    </div>
  );
}

export const ProductStarRating = memo(ProductStarRatingComponent);
