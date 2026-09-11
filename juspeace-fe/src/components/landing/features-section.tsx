import Image from 'next/image';

import { SectionHeading } from '@/components/landing/section-heading';
import { SectionLabel } from '@/components/landing/section-label';
import { SectionShell } from '@/components/landing/section-shell';
import { getTranslator } from '@/lib/i18n/server';
import { cn } from '@/lib/utils';

const COLLECTION_LOGO = '/header/juspeace_header.png';

const FEATURE_HUB = {
  hero: { src: '/pd-coll-one.png', width: 1254, height: 1254 },
  lettering: { src: '/pd-coll-two.png', width: 1254, height: 1254 },
  endTip: { src: '/pd-coll-three.png', width: 484, height: 478 },
  adjustment: { src: '/pd-coll-four.png', width: 1254, height: 1254 },
  bead: { src: '/pd-coll-five.png', width: 488, height: 488 },
} as const;

type DetailKey = 'lettering' | 'endTip' | 'bead' | 'adjustment';

const DETAIL_GRID: Record<
  DetailKey,
  { gridClass: string; imageClass: string }
> = {
  lettering: {
    gridClass: 'lg:col-start-1 lg:row-start-1 lg:justify-self-end',
    imageClass: 'max-w-[200px] sm:max-w-[220px] lg:max-w-[240px]',
  },
  endTip: {
    gridClass: 'lg:col-start-3 lg:row-start-1 lg:justify-self-start',
    imageClass: 'max-w-[180px] sm:max-w-[200px] lg:max-w-[220px]',
  },
  bead: {
    gridClass: 'lg:col-start-1 lg:row-start-3 lg:justify-self-end',
    imageClass: 'max-w-[180px] sm:max-w-[200px] lg:max-w-[220px]',
  },
  adjustment: {
    gridClass: 'lg:col-start-3 lg:row-start-3 lg:justify-self-start',
    imageClass: 'max-w-[200px] sm:max-w-[220px] lg:max-w-[240px]',
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
  imageClassName,
  className,
}: {
  label: string;
  image: { src: string; width: number; height: number };
  imageClassName?: string;
  className?: string;
}) {
  return (
    <figure className={cn('flex flex-col items-center gap-3 text-center', className)}>
      <button
        type="button"
        className="transition-opacity hover:opacity-90"
        aria-label={label}
      >
        <Image
          src={image.src}
          alt={label}
          width={image.width}
          height={image.height}
          sizes="(max-width: 1024px) 45vw, 240px"
          className={cn('h-auto w-full', imageClassName)}
        />
      </button>
      <figcaption className="font-serif text-sm text-black sm:text-base">
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
    <figure
      className={cn('flex flex-col items-center text-center', className)}
    >
      <button
        type="button"
        className="transition-opacity hover:opacity-90"
        aria-label={label}
      >
        <Image
          src={image.src}
          alt={label}
          width={image.width}
          height={image.height}
          sizes="(max-width: 1024px) 70vw, 360px"
          className="h-auto w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[360px]"
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
        <Image
          src={COLLECTION_LOGO}
          alt="JUSPEACE"
          width={48}
          height={48}
          className="h-10 w-10 object-contain sm:h-12 sm:w-12"
        />
        <SectionLabel className="mt-6 text-base sm:text-lg lg:text-xl">
          {t('landing.features.label')}
        </SectionLabel>
        <SectionHeading className="mt-4 text-[clamp(2rem,5vw,3.5rem)] leading-[1.08]">
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
                imageClassName={DETAIL_GRID[key].imageClass}
              />
            </div>
          ),
        )}
      </div>

      {/* Desktop hub */}
      <div
        data-scroll-stagger
        className="mx-auto mt-14 hidden max-w-[920px] lg:grid lg:grid-cols-[1fr_auto_1fr] lg:grid-rows-[auto_auto_auto] lg:items-center lg:gap-x-8 lg:gap-y-6 xl:gap-x-12"
      >
        {(Object.keys(DETAIL_GRID) as DetailKey[]).map((key) => (
          <div
            key={key}
            data-scroll-stagger-item
            className={cn('flex justify-center', DETAIL_GRID[key].gridClass)}
          >
            <FeatureDetailCard
              label={detailLabel(key)}
              image={FEATURE_HUB[key]}
              imageClassName={DETAIL_GRID[key].imageClass}
            />
          </div>
        ))}

        <div
          data-scroll-stagger-item
          className="lg:col-start-2 lg:row-start-1 lg:row-span-3 lg:flex lg:items-center lg:justify-center"
        >
          <FeatureHero label={heroAlt} />
        </div>
      </div>

      <div
        data-scroll-reveal
        className="mx-auto mt-16 flex max-w-[720px] flex-col items-center text-center lg:mt-20"
      >
        <p className="font-sans text-base leading-relaxed text-black sm:text-lg">
          {t('landing.features.subtext')}
        </p>
        <p className="mt-8 font-display text-[clamp(1.75rem,4vw,2.75rem)] font-bold leading-[1.12] tracking-[-0.02em] text-black">
          {t('landing.features.closingPrefix')}{' '}
          <span className="italic">{t('landing.features.closingBrand')}</span>
        </p>
        <p className="mt-6 font-mono text-xs text-black/70 sm:text-sm">
          [ {t('landing.features.tapHint')} ]
        </p>
      </div>
    </SectionShell>
  );
}
