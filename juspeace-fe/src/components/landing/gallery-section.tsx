import Image from 'next/image';

import { BracketLabel } from '@/components/landing/bracket-label';
import { SectionHeading } from '@/components/landing/section-heading';
import { SectionLabel } from '@/components/landing/section-label';
import { SectionShell } from '@/components/landing/section-shell';
import { getTranslator } from '@/lib/i18n/server';

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
  '/product-collection/juespeace_mar4.png',
  '/product-collection/juspeace_mr3.png',
  '/product-collection/ju_mar6.png',
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
      className="relative overflow-hidden rounded-[21px] border-2 border-jp-light-gray"
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
      </div>
    </div>
  );
}

export async function GallerySection() {
  const { t } = await getTranslator();

  return (
    <SectionShell id="gallery" className="bg-white py-16 lg:py-28">
      <div
        data-scroll-reveal
        className="mx-auto mb-16 flex max-w-[1116px] flex-col items-center text-center lg:mb-24"
      >
        <SectionLabel className="text-sm lg:text-base">
          {t('landing.gallery.label')}
        </SectionLabel>
        <SectionHeading className="mt-3 text-[clamp(1.85rem,3.5vw,3rem)] leading-[1.08]">
          <span className="block">{t('landing.gallery.headingLine1')}</span>
          <span className="block">{t('landing.gallery.headingLine2')}</span>
        </SectionHeading>
      </div>

      <div
        data-scroll-stagger
        className="hidden gap-x-12 gap-y-16 md:grid md:grid-cols-2 lg:grid-cols-3 lg:gap-x-20 lg:gap-y-20"
      >
        {CATEGORIES.map((key) => {
          const [leftSrc, rightSrc, centerSrc] = GALLERY_STACKS[key];
          const label = t(`landing.gallery.categories.${key}`);

          return (
          <figure
            key={key}
            data-scroll-stagger-item
            className="flex flex-col items-center gap-4"
          >
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
              <span className="inline-flex h-7 min-w-[52px] items-center justify-center rounded-full bg-jp-light-gray px-2.5 font-mono text-sm">
                {t('landing.gallery.count')}
              </span>
            </div>
          </figure>
          );
        })}
      </div>

      <div className="flex snap-x snap-mandatory gap-10 overflow-x-auto pb-4 md:hidden">
        {CATEGORIES.map((key) => {
          const [leftSrc, rightSrc, centerSrc] = GALLERY_STACKS[key];
          const label = t(`landing.gallery.categories.${key}`);

          return (
          <figure
            key={key}
            className="flex w-[263px] shrink-0 snap-center flex-col items-center gap-4"
          >
            <GalleryStack
              label={label}
              leftSrc={leftSrc}
              rightSrc={rightSrc}
              centerSrc={centerSrc}
            />
            <div className="flex items-center gap-2">
              <BracketLabel className="text-xs sm:text-sm">
                {label}
              </BracketLabel>
              <span className="inline-flex h-7 min-w-[44px] items-center justify-center rounded-full bg-jp-light-gray px-2 font-mono text-xs">
                {t('landing.gallery.count')}
              </span>
            </div>
          </figure>
          );
        })}
      </div>
    </SectionShell>
  );
}
