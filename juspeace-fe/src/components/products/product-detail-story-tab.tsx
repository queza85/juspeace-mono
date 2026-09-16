'use client';

import Image from 'next/image';
import { useT } from '@/lib/i18n/locale-context';

const STORY_LOGO = '/header/juspeace_header.png';
const STORY_FLOWER = '/brand/gd-flower.png';

interface ProductDetailStoryTabProps {
  variantName: string;
}

export function ProductDetailStoryTab({
  variantName,
}: ProductDetailStoryTabProps) {
  const t = useT();

  return (
    <div className="mx-auto flex max-w-[680px] flex-col items-center px-4 pt-8 text-center sm:pt-12 lg:pt-16">
      <Image
        src={STORY_LOGO}
        alt={t('products.detail.story.logoAlt')}
        width={96}
        height={96}
        className="h-16 w-16 object-contain sm:h-20 sm:w-20 lg:h-24 lg:w-24"
      />

      <p className="mt-9 font-serif text-base leading-none text-black sm:mt-11 sm:text-lg">
        {variantName}
      </p>

      <h2 className="mt-5 font-display text-[clamp(2.25rem,5.5vw,3.5rem)] font-normal leading-[1.12] tracking-[-0.02em] text-black">
        <span className="block font-bold">
          {t('products.detail.story.headlineLine1')}
        </span>
        <span className="block font-normal">
          {t('products.detail.story.headlineLine2')}
        </span>
      </h2>

      <p className="mt-10 font-sans text-base font-normal leading-[1.7] text-black sm:mt-12 sm:text-lg">
        <span className="block">{t('products.detail.story.subLine1')}</span>
        <span className="block">{t('products.detail.story.subLine2')}</span>
      </p>

      <p className="mt-8 max-w-[32rem] whitespace-pre-line font-sans text-base font-normal leading-[1.75] text-black sm:mt-9 sm:text-lg">
        {t('products.detail.story.body')}
      </p>

      <Image
        src={STORY_FLOWER}
        alt={t('products.detail.story.flowerAlt')}
        width={160}
        height={160}
        className="mt-10 h-28 w-28 object-contain sm:mt-12 sm:h-32 sm:w-32 lg:h-40 lg:w-40"
      />

      <p className="mt-9 max-w-[26rem] whitespace-pre-line font-sans text-base font-normal leading-[1.7] text-black sm:mt-10 sm:text-lg">
        {t('products.detail.story.closing')}
      </p>
    </div>
  );
}
