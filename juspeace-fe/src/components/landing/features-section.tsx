import Image from 'next/image';

import { BracketLabel } from '@/components/landing/bracket-label';
import { SectionHeading } from '@/components/landing/section-heading';
import { SectionLabel } from '@/components/landing/section-label';
import { SectionShell } from '@/components/landing/section-shell';
import { getTranslator } from '@/lib/i18n/server';
import { cn } from '@/lib/utils';

const COLLECTION_LOGO = '/header/juspeace_header.png';

const FEATURE_HUB = {
  hero: {
    src: '/product-feature/product-feature-middle.png',
    width: 3784,
    height: 2156,
  },
  lettering: {
    src: '/product-feature/product-feature-1.png',
    width: 1316,
    height: 580,
  },
  endTip: {
    src: '/product-feature/product-feature-2.png',
    width: 956,
    height: 820,
  },
  adjustment: {
    src: '/product-feature/product-feature-4.png',
    width: 816,
    height: 896,
  },
  bead: {
    src: '/product-feature/product-feature-3.png',
    width: 1316,
    height: 580,
  },
} as const;

type DetailKey = 'lettering' | 'endTip' | 'bead' | 'adjustment';

const DETAIL_GRID: Record<
  DetailKey,
  {
    frameClass: string;
    imageClass: string;
    crop?: { scale: number; origin: string };
  }
> = {
  lettering: {
    frameClass: 'h-[88px] w-[160px] sm:h-[96px] sm:w-[176px] lg:h-[104px] lg:w-[188px]',
    imageClass: 'object-contain',
  },
  endTip: {
    frameClass: 'h-[108px] w-[132px] sm:h-[116px] sm:w-[140px] lg:h-[124px] lg:w-[148px]',
    imageClass: 'object-contain',
  },
  bead: {
    frameClass: 'h-[124px] w-[124px] sm:h-[132px] sm:w-[132px] lg:h-[140px] lg:w-[140px]',
    imageClass: 'object-contain',
  },
  adjustment: {
    frameClass: 'h-[120px] w-[120px] sm:h-[128px] sm:w-[128px] lg:h-[140px] lg:w-[140px]',
    imageClass: 'object-contain',
  },
};

const MOBILE_ORDER: Array<DetailKey | 'hero'> = [
  'hero',
  'lettering',
  'endTip',
  'bead',
  'adjustment',
];

function FeatureDetailCard({
  label,
  image,
  frameClassName,
  imageClassName,
  crop,
  className,
}: {
  label: string;
  image: { src: string; width: number; height: number };
  frameClassName: string;
  imageClassName?: string;
  crop?: { scale: number; origin: string };
  className?: string;
}) {
  return (
    <figure className={cn('flex flex-col items-center gap-3 text-center', className)}>
      <button
        type="button"
        className="transition-opacity hover:opacity-90"
        aria-label={label}
      >
        <span className={cn('relative block overflow-hidden', frameClassName)}>
          <Image
            src={image.src}
            alt={label}
            width={image.width}
            height={image.height}
            sizes="188px"
            className={cn(
              'h-full w-full origin-center',
              imageClassName,
            )}
            style={
              crop
                ? { transform: `scale(${crop.scale})`, transformOrigin: crop.origin }
                : undefined
            }
          />
        </span>
      </button>
      <figcaption className="max-w-[11rem] font-serif text-sm leading-snug text-black sm:text-base">
        {label}
      </figcaption>
    </figure>
  );
}

function FeatureHero({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  const image = FEATURE_HUB.hero;

  return (
    <figure className={cn('mx-auto flex flex-col items-center text-center', className)}>
      <button
        type="button"
        className="relative w-[280px] transition-opacity hover:opacity-90 sm:w-[400px] lg:w-[560px]"
        aria-label={label}
      >
        <Image
          src={image.src}
          alt={label}
          width={image.width}
          height={image.height}
          sizes="(max-width: 1024px) 70vw, 560px"
          className="h-auto w-full object-contain"
        />
      </button>
    </figure>
  );
}

export async function FeaturesSection() {
  const { t } = await getTranslator();

  const detailLabel = (key: DetailKey) => t(`landing.features.items.${key}`);
  const heroAlt = t('landing.features.heroAlt');

  return (
    <SectionShell
      id="features"
      className="bg-jp-light-gray pt-16 pb-20 lg:pt-24 lg:pb-28"
    >
      <div
        data-scroll-reveal
        className="mx-auto flex max-w-[900px] flex-col items-center text-center"
      >
        <div className="relative size-20 shrink-0 overflow-hidden rounded-full sm:size-24 lg:size-28">
          <Image
            src={COLLECTION_LOGO}
            alt="JUSPEACE"
            width={112}
            height={112}
            className="size-full object-cover"
          />
        </div>
        <SectionLabel className="mt-6 text-base sm:mt-8 sm:text-lg lg:mt-10 lg:text-xl">
          {t('landing.features.label')}
        </SectionLabel>
        <SectionHeading className="mt-1 text-[clamp(2rem,5vw,3.5rem)] leading-[1.08] sm:mt-1.5 lg:mt-2">
          <span className="block">{t('landing.features.headingLine1')}</span>
          <span className="block">{t('landing.features.headingLine2')}</span>
          <span className="block">{t('landing.features.headingLine3')}</span>
        </SectionHeading>
      </div>

      {/* Mobile */}
      <div
        data-scroll-stagger
        className="mx-auto mt-12 flex max-w-[440px] flex-col gap-10 lg:hidden"
      >
        {MOBILE_ORDER.map((key) =>
          key === 'hero' ? (
            <div key={key} data-scroll-stagger-item>
              <FeatureHero label={heroAlt} />
            </div>
          ) : (
            <div key={key} data-scroll-stagger-item>
              <FeatureDetailCard
                label={detailLabel(key)}
                image={FEATURE_HUB[key]}
                frameClassName={DETAIL_GRID[key].frameClass}
                imageClassName={DETAIL_GRID[key].imageClass}
                crop={DETAIL_GRID[key].crop}
              />
            </div>
          ),
        )}
      </div>

      {/* Desktop hub */}
      <div
        data-scroll-stagger
        className="mx-auto mt-14 hidden min-h-[32rem] max-w-[1100px] lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-stretch lg:gap-x-10 xl:gap-x-16"
      >
        <div className="flex h-full flex-col items-start justify-between self-stretch py-2">
          {(['lettering', 'bead'] as const).map((key) => (
            <div key={key} data-scroll-stagger-item>
              <FeatureDetailCard
                label={detailLabel(key)}
                image={FEATURE_HUB[key]}
                frameClassName={DETAIL_GRID[key].frameClass}
                imageClassName={DETAIL_GRID[key].imageClass}
                crop={DETAIL_GRID[key].crop}
              />
            </div>
          ))}
        </div>

        <div
          data-scroll-stagger-item
          className="flex items-center justify-center self-center"
        >
          <FeatureHero label={heroAlt} />
        </div>

        <div className="flex h-full flex-col items-end justify-between self-stretch py-2">
          {(['endTip', 'adjustment'] as const).map((key) => (
            <div key={key} data-scroll-stagger-item>
              <FeatureDetailCard
                label={detailLabel(key)}
                image={FEATURE_HUB[key]}
                frameClassName={DETAIL_GRID[key].frameClass}
                imageClassName={DETAIL_GRID[key].imageClass}
                crop={DETAIL_GRID[key].crop}
              />
            </div>
          ))}
        </div>
      </div>

      <div
        data-scroll-reveal
        className="mx-auto mt-16 flex max-w-[720px] flex-col items-center text-center lg:mt-20"
      >
        <p className="font-sans text-lg leading-relaxed text-black sm:text-xl lg:text-2xl">
          <span className="block">{t('landing.features.subtextLine1')}</span>
          <span className="block">{t('landing.features.subtextLine2')}</span>
        </p>
        <BracketLabel className="mt-10 text-xs text-black sm:text-sm lg:text-base">
          {t('landing.features.tapHint')}
        </BracketLabel>
      </div>
    </SectionShell>
  );
}
