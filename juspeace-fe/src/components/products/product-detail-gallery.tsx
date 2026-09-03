'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import {
  VARIANT_GALLERY_IMAGES,
  VARIANT_MAIN_IMAGES,
  type VariantKey,
} from '@/lib/products/variant-images';
import { cn } from '@/lib/utils';

interface ProductDetailGalleryProps {
  variantKey: VariantKey;
  productName: string;
}

const PDP_MAIN_IMAGE_SIZE = 480;
const PDP_THUMBNAIL_COUNT = 3;

export function ProductDetailGallery({
  variantKey,
  productName,
}: ProductDetailGalleryProps) {
  const t = useT();
  const images = VARIANT_GALLERY_IMAGES[variantKey];
  const mainMeta = VARIANT_MAIN_IMAGES[variantKey];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSrc = images[activeIndex] ?? mainMeta.src;
  const thumbnails = images.slice(0, PDP_THUMBNAIL_COUNT);

  return (
    <div className="flex w-full max-w-[480px] flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-[10px] border border-dashed border-black/25 bg-white">
        <Image
          src={activeSrc}
          alt={productName}
          width={PDP_MAIN_IMAGE_SIZE}
          height={PDP_MAIN_IMAGE_SIZE}
          className="h-full w-full object-cover"
          sizes="(max-width: 1024px) 100vw, 480px"
          priority
        />
      </div>

      <div className="flex gap-2">
        {thumbnails.map((src, index) => (
          <button
            key={src}
            type="button"
            aria-label={t('products.detail.galleryThumbnail', {
              index: index + 1,
            })}
            aria-current={activeIndex === index ? 'true' : undefined}
            onClick={() => setActiveIndex(index)}
            className={cn(
              'relative aspect-square w-[68px] shrink-0 overflow-hidden rounded-[4px] border bg-white sm:w-[72px]',
              activeIndex === index
                ? 'border-black'
                : 'border-black/10 opacity-80 hover:opacity-100',
            )}
          >
            <Image
              src={src}
              alt=""
              fill
              className="object-cover"
              sizes="88px"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
