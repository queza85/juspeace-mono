import Image from 'next/image';

import { BracketLabel } from '@/components/landing/bracket-label';
import { SectionHeading } from '@/components/landing/section-heading';
import { SectionLabel } from '@/components/landing/section-label';
import { SectionShell } from '@/components/landing/section-shell';
import { getTranslator } from '@/lib/i18n/server';
import { cn } from '@/lib/utils';

const COLLECTION_LOGO = '/header/juspeace_header.png';
const PAPER_CLIP = '/brand/paper-clip.png';

const CATEGORIES = [
  'productOnly',
  'lifestyle',
  'closeUp',
  'packaging',
  'mobileSwipe',
  'desktopThumbnails',
] as const;

const GALLERY_STACKS = {
  productOnly: [
    '/product-gallery/first/second.png',
    '/product-gallery/first/three.png',
    '/product-gallery/first/first.png',
  ],
  lifestyle: [
    '/product-gallery/second/second.png',
    '/product-gallery/second/third.png',
    '/product-gallery/second/first.png',
  ],
  closeUp: [
    '/product-gallery/third/second.png',
    '/product-gallery/third/third.png',
    '/product-gallery/third/first.png',
  ],
  packaging: [
    '/product-gallery/fourth/second.png',
    '/product-gallery/fourth/three.png',
    '/product-gallery/fourth/first.png',
  ],
  mobileSwipe: [
    '/product-gallery/fifth/second.png',
    '/product-gallery/fifth/third.png',
    '/product-gallery/fifth/first.png',
  ],
  desktopThumbnails: [
    '/product-gallery/sixth/second.png',
    '/product-gallery/sixth/third.png',
    '/product-gallery/sixth/first.png',
  ],
} as const satisfies Record<(typeof CATEGORIES)[number], readonly [string, string, string]>;

function GalleryPaperClip() {
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-0 z-30 -translate-x-1/2 -translate-y-[48%]"
      aria-hidden
    >
      <Image
        src={PAPER_CLIP}
        alt=""
        width={804}
        height={1134}
        className="h-[64px] w-auto origin-bottom rotate-[14deg] object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.12)] sm:h-[72px]"
      />
    </div>
  );
}

function GalleryCard({
  src,
  alt,
  aspectRatio,
  contained = false,
  imageClassName,
}: {
  src: string;
  alt: string;
  aspectRatio: string;
  contained?: boolean;
  imageClassName?: string;
}) {
  if (!src) {
    return null;
  }

  return (
    <div
      className="relative overflow-hidden rounded-[21px] border-2 border-jp-light-gray bg-white"
      style={{ aspectRatio }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 202px, 226px"
        className={cn(
          contained ? 'object-contain' : 'origin-center object-cover',
          imageClassName,
        )}
      />
    </div>
  );
}

function GalleryStack({
  label,
  leftSrc,
  rightSrc,
  centerSrc,
}: {
  label: string;
  leftSrc: string;
  rightSrc: string;
  centerSrc: string;
}) {
  return (
    <div className="relative mx-auto h-[206px] w-[300px] xl:h-[240px] xl:w-[346px] 2xl:h-[291px] 2xl:w-[414px]">
      <div className="absolute left-1/2 top-3 w-[142px] -translate-x-[calc(50%+68px)] -rotate-[16.59deg] xl:top-3.5 xl:w-[166px] xl:-translate-x-[calc(50%+80px)] 2xl:top-4 2xl:w-[202px] 2xl:-translate-x-[calc(50%+96px)]">
        <GalleryCard
          src={leftSrc}
          alt={label}
          aspectRatio="202 / 262"
          imageClassName="origin-center -rotate-[19deg] scale-[1.4]"
        />
      </div>
      <div className="absolute left-1/2 top-3 w-[142px] -translate-x-[calc(50%-68px)] rotate-[16.59deg] xl:top-3.5 xl:w-[166px] xl:-translate-x-[calc(50%-80px)] 2xl:top-4 2xl:w-[202px] 2xl:-translate-x-[calc(50%-96px)]">
        <GalleryCard
          src={rightSrc}
          alt={label}
          aspectRatio="202 / 262"
          imageClassName="origin-center rotate-[21deg] scale-[1.4]"
        />
      </div>
      <div className="absolute left-1/2 top-0 z-10 w-[160px] -translate-x-1/2 xl:w-[186px] 2xl:w-[226px]">
        <GalleryCard src={centerSrc} alt={label} aspectRatio="226 / 291" contained />
        <GalleryPaperClip />
      </div>
    </div>
  );
}

function GalleryCategory({
  label,
  count,
  leftSrc,
  rightSrc,
  centerSrc,
  className,
}: {
  label: string;
  count: string;
  leftSrc: string;
  rightSrc: string;
  centerSrc: string;
  className?: string;
}) {
  return (
    <figure className={cn('flex flex-col items-center gap-4', className)}>
      <GalleryStack
        label={label}
        leftSrc={leftSrc}
        rightSrc={rightSrc}
        centerSrc={centerSrc}
      />
      <div className="flex items-center gap-2">
        <BracketLabel className="text-xs sm:text-sm lg:text-base">
          {label}
        </BracketLabel>
        <span className="inline-flex h-7 min-w-[52px] items-center justify-center rounded-full bg-jp-light-gray px-2.5 font-mono text-sm text-black">
          {count}
        </span>
      </div>
    </figure>
  );
}

export async function GallerySection() {
  const { t } = await getTranslator();
  const count = t('landing.gallery.count');

  return (
    <SectionShell id="gallery" className="bg-white pt-10 pb-16 lg:pt-14 lg:pb-28">
      <div
        data-scroll-reveal
        className="mx-auto mb-16 flex max-w-[1116px] flex-col items-center text-center lg:mb-24"
      >
        <div className="relative mt-4 mb-16 size-16 shrink-0 overflow-hidden rounded-full sm:mt-6 sm:mb-20 sm:size-20 lg:mt-8 lg:mb-24 lg:size-24">
          <Image
            src={COLLECTION_LOGO}
            alt="JUSPEACE"
            width={96}
            height={96}
            className="size-full object-cover"
          />
        </div>
        <SectionLabel className="mt-8 text-base sm:mt-10 sm:text-lg lg:text-xl">
          {t('landing.gallery.label')}
        </SectionLabel>
        <SectionHeading className="mt-1 text-[clamp(2.25rem,6vw,5rem)] leading-[1.05] sm:mt-1.5 lg:mt-2">
          <span className="block">{t('landing.gallery.headingLine1')}</span>
          <span className="mb-10 block sm:mb-14 lg:mb-20">{t('landing.gallery.headingLine2')}</span>
        </SectionHeading>
      </div>

      <div
        data-scroll-stagger
        className="mx-auto hidden max-w-[1100px] gap-x-10 gap-y-24 md:grid md:grid-cols-2 lg:max-w-none lg:grid-cols-3 lg:gap-x-12 lg:gap-y-28 xl:gap-x-16 xl:gap-y-32 2xl:gap-x-20"
      >
        {CATEGORIES.map((key) => {
          const [leftSrc, rightSrc, centerSrc] = GALLERY_STACKS[key];
          const label = t(`landing.gallery.categories.${key}`);

          return (
            <div key={key} data-scroll-stagger-item>
              <GalleryCategory
                label={label}
                count={count}
                leftSrc={leftSrc}
                rightSrc={rightSrc}
                centerSrc={centerSrc}
              />
            </div>
          );
        })}
      </div>

      <div className="flex snap-x snap-mandatory gap-10 overflow-x-auto px-5 pb-4 md:hidden">
        {CATEGORIES.map((key) => {
          const [leftSrc, rightSrc, centerSrc] = GALLERY_STACKS[key];
          const label = t(`landing.gallery.categories.${key}`);

          return (
            <GalleryCategory
              key={key}
              label={label}
              count={count}
              leftSrc={leftSrc}
              rightSrc={rightSrc}
              centerSrc={centerSrc}
              className="w-[300px] shrink-0 snap-center"
            />
          );
        })}
      </div>
    </SectionShell>
  );
}
