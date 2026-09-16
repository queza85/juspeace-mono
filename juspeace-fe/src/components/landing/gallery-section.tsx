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

const GALLERY_IMAGE_POOL = [
  '/marque/juspeace_mar1.png',
  '/marque/juspeace_mar2.png',
  '/marque/juspeace_mr3.png',
  '/marque/juspeace_mar4.png',
  '/marque/juespeace_mar4.png',
  '/marque/juspeace_mar5.jpg',
  '/marque/ju_mar6.png',
  '/marque/mar_7.png',
  '/marque/mar8.png',
  '/story/gd.png',
  '/story/love_together.png',
  '/story/story_love.png',
  '/product-feature/pf1.png',
  '/product-feature/pf2.png',
  '/product-feature/pf3.png',
  '/product-feature/pf5.png',
  '/product-feature/pf6.png',
  '/product-collection/product-collection-one.png',
  '/product-collection/product-collection-two.png',
  '/product-collection/product-collection-three.png',
  '/landing/landing_love.png',
  '/landing/juspeace_just_hand.png',
  '/landing/intro.png',
] as const;

function pickFromPool(index: number): string {
  const poolSize = GALLERY_IMAGE_POOL.length;
  const normalized = ((index % poolSize) + poolSize) % poolSize;

  return GALLERY_IMAGE_POOL[normalized] ?? GALLERY_IMAGE_POOL[0];
}

function getStackImages(stackIndex: number): [string, string, string] {
  const base = stackIndex * 3;

  return [
    pickFromPool(base),
    pickFromPool(base + 7),
    pickFromPool(base + 13),
  ];
}

const GALLERY_STACKS = Object.fromEntries(
  CATEGORIES.map((key, index) => [key, getStackImages(index)]),
) as Record<(typeof CATEGORIES)[number], [string, string, string]>;

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
}: {
  src: string;
  alt: string;
  aspectRatio: string;
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
        sizes="(max-width: 640px) 150px, 168px"
        className="object-cover"
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
    <div className="relative mx-auto h-[192px] w-[245px] sm:h-[217px] sm:w-[263px]">
      <div className="absolute left-1/2 top-4 w-[150px] -translate-x-[calc(50%+51px)] -rotate-[16.59deg]">
        <GalleryCard src={leftSrc} alt={label} aspectRatio="150 / 194" />
      </div>
      <div className="absolute left-1/2 top-4 w-[150px] -translate-x-[calc(50%-51px)] rotate-[16.59deg]">
        <GalleryCard src={rightSrc} alt={label} aspectRatio="150 / 194" />
      </div>
      <div className="absolute left-1/2 top-0 z-10 w-[168px] -translate-x-1/2">
        <GalleryCard src={centerSrc} alt={label} aspectRatio="168 / 217" />
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
        <div className="relative -mt-4 size-16 shrink-0 overflow-hidden rounded-full sm:-mt-5 sm:size-20 lg:-mt-6 lg:size-24">
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
        <SectionHeading className="mt-4 text-[clamp(2rem,5vw,3.5rem)] leading-[1.08]">
          {t('landing.gallery.heading')}
        </SectionHeading>
      </div>

      <div
        data-scroll-stagger
        className="mx-auto hidden max-w-[1200px] gap-x-10 gap-y-16 md:grid md:grid-cols-2 lg:grid-cols-3 lg:gap-x-16 lg:gap-y-20"
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
              className="w-[263px] shrink-0 snap-center"
            />
          );
        })}
      </div>
    </SectionShell>
  );
}
