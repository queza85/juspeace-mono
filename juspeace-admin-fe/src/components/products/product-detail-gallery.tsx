'use client';

import { memo, useMemo, useState } from 'react';
import Image from 'next/image';
import { Pencil } from 'lucide-react';
import type { Product } from '@/lib/api/types';
import { useT } from '@/lib/i18n/locale-context';
import { getProductGalleryImages } from '@/lib/products/mock-data';
import { cn } from '@/lib/utils';

function ProductDetailGalleryComponent({ product }: { product: Product }) {
  const t = useT();
  const images = useMemo(
    () => getProductGalleryImages(product.slug, product.imageUrl),
    [product.imageUrl, product.slug],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? images[0];

  return (
    <div className="flex flex-col items-center gap-3 lg:items-start">
      <div className="relative aspect-square w-full max-w-[280px] overflow-hidden rounded-xl">
        {activeImage ? (
          <Image
            src={activeImage}
            alt={product.name}
            fill
            className="object-cover"
            sizes="280px"
            priority
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-muted/20 text-sm font-semibold text-muted-foreground">
            {product.name.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 lg:justify-start">
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={t('admin.products.detail.selectImage', { index: index + 1 })}
            className={cn(
              'relative size-12 overflow-hidden rounded-md border transition-colors',
              activeIndex === index
                ? 'border-primary/50 ring-1 ring-primary/20'
                : 'border-border/60 hover:border-border',
            )}
          >
            <Image
              src={image}
              alt=""
              fill
              className="object-cover"
              sizes="48px"
            />
          </button>
        ))}
      </div>

      <button
        type="button"
        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-sky-200 bg-sky-50 px-4 text-xs font-medium text-sky-700 transition-colors hover:bg-sky-100"
      >
        <Pencil className="size-3.5" aria-hidden />
        {t('admin.products.actions.edit')}
      </button>
    </div>
  );
}

export const ProductDetailGallery = memo(ProductDetailGalleryComponent);
