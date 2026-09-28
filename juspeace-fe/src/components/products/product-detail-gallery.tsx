'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import {
  VARIANT_GALLERY_IMAGES,
  VARIANT_PRODUCT_IMAGES,
  type VariantKey,
} from '@/lib/products/variant-images';
import { cn } from '@/lib/utils';

interface ProductDetailGalleryProps {
  variantKey: VariantKey;
  productName: string;
}

const PDP_MAIN_IMAGE_SIZE = 560;
const PDP_MAIN_IMAGE_HEIGHT = 747;
const PDP_THUMBNAIL_COUNT = 3;

export function ProductDetailGallery({
  variantKey,
  productName,
}: ProductDetailGalleryProps) {
  const t = useT();
  const images = VARIANT_GALLERY_IMAGES[variantKey];
  const mainMeta = VARIANT_PRODUCT_IMAGES[variantKey];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSrc = images[activeIndex] ?? mainMeta.src;
  const thumbnails = images.slice(0, PDP_THUMBNAIL_COUNT);

  return (
    <div className="flex w-full max-w-[520px] flex-col gap-3 2xl:max-w-[760px]">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[10px] border border-solid border-[#E7E9EB] bg-white">
        <Image
          src={activeSrc}
          alt={productName}
          width={PDP_MAIN_IMAGE_SIZE}
          height={PDP_MAIN_IMAGE_HEIGHT}
          className="h-full w-full object-cover"
          sizes="(max-width: 1024px) 100vw, (max-width: 1536px) 520px, 760px"
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
              'relative aspect-square w-[80px] shrink-0 overflow-hidden rounded-[4px] border bg-white sm:w-[88px]',
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
