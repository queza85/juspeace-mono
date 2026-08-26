import Image from 'next/image';

import { BracketLabel } from '@/components/landing/bracket-label';
import { SectionHeading } from '@/components/landing/section-heading';
import { SectionLabel } from '@/components/landing/section-label';
import { SectionShell } from '@/components/landing/section-shell';
import { getTranslator } from '@/lib/i18n/server';
import { cn } from '@/lib/utils';

const BRAND_STORY_IMAGES = {
  left: '/story/love_together.png',
  center: '/story/gd.png',
  right: '/story/story_love.png',
} as const;

function BrandStorySideImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={1240}
      height={1544}
      sizes="(max-width: 1024px) 100vw, 33vw"
      className="h-auto w-full"
    />
  );
}

function BrandStoryCenterImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={720}
      height={994}
      sizes="(max-width: 1024px) 280px, 28vw"
      className="h-auto w-full max-w-[280px] sm:max-w-[320px] lg:max-w-none lg:w-[82%]"
    />
  );
}

function BrandStoryCaption({
  caption,
  body,
  className,
}: {
  caption: string;
  body: string;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <BracketLabel className="text-[13px] text-jp-muted sm:text-[14px] lg:text-[16px]">
        {caption}
      </BracketLabel>
      <p className="font-mono text-[15px] leading-[1.55] text-black sm:text-[16px] lg:text-[18px] lg:leading-8">
        {body}
      </p>
    </div>
  );
}

export async function BrandStorySection() {
  const { t } = await getTranslator();

  return (
    <SectionShell id="story" className="bg-white py-20 lg:py-28">
      <div
        data-scroll-reveal
        className="mx-auto flex max-w-[1116px] flex-col items-center text-center"
      >
        <SectionLabel className="text-[20px] sm:text-[24px] lg:text-[32px]">
          {t('landing.brandStory.label')}
        </SectionLabel>
        <SectionHeading className="mt-6 max-w-[534px] text-[clamp(1.75rem,4.2vw,3.625rem)] leading-[1.12] tracking-[-0.02em]">
          {t('landing.brandStory.quote')}
        </SectionHeading>
        <p className="mt-6 max-w-[447px] font-mono text-[16px] leading-7 text-black sm:text-[18px] sm:leading-8 lg:text-[22px]">
          {t('landing.brandStory.subtext')}
        </p>
      </div>

      <div
        data-scroll-stagger
        className="mt-16 grid grid-cols-1 gap-10 lg:mt-24 lg:grid-cols-3 lg:items-start lg:gap-8"
      >
        <article
          data-scroll-stagger-item
          className="flex flex-col gap-5 lg:gap-6"
        >
          <BrandStorySideImage
            src={BRAND_STORY_IMAGES.left}
            alt={t('landing.brandStory.leftImage')}
          />
          <BrandStoryCaption
            caption={t('landing.brandStory.leftCaption')}
            body={t('landing.brandStory.leftBody')}
          />
        </article>

        <div
          data-scroll-stagger-item
          className="flex items-center justify-center lg:self-stretch"
        >
          <BrandStoryCenterImage
            src={BRAND_STORY_IMAGES.center}
            alt={t('landing.brandStory.centerImage')}
          />
        </div>

        <article
          data-scroll-stagger-item
          className="flex flex-col gap-5 lg:gap-6"
        >
          <BrandStorySideImage
            src={BRAND_STORY_IMAGES.right}
            alt={t('landing.brandStory.rightImage')}
          />
          <BrandStoryCaption
            caption={t('landing.brandStory.rightCaption')}
            body={t('landing.brandStory.rightBody')}
          />
        </article>
      </div>
    </SectionShell>
  );
}
