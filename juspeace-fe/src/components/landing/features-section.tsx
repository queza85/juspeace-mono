import Image from 'next/image';

import { BracketLabel } from '@/components/landing/bracket-label';
import { SectionHeading } from '@/components/landing/section-heading';
import { SectionLabel } from '@/components/landing/section-label';
import { SectionShell } from '@/components/landing/section-shell';
import { getTranslator } from '@/lib/i18n/server';
import { cn } from '@/lib/utils';

const FEATURE_ITEMS = {
  bracelet: {
    src: '/product-feature/pf1.png',
    width: 2102,
    height: 886,
    widthClass: 'w-[400px] max-w-full lg:w-[440px]',
  },
  lettering: {
    src: '/product-feature/pf2.png',
    width: 502,
    height: 494,
    widthClass: 'w-[300px] max-w-full lg:w-[332px]',
  },
  bead: {
    src: '/product-feature/pf3.png',
    width: 498,
    height: 484,
    widthClass: 'w-[290px] max-w-full lg:w-[314px]',
  },
  endTip: {
    src: '/product-feature/pf5.png',
    width: 484,
    height: 478,
    widthClass: 'w-[290px] max-w-full lg:w-[314px]',
  },
  adjustment: {
    src: '/product-feature/pf6.png',
    width: 488,
    height: 488,
    widthClass: 'w-[290px] max-w-full lg:w-[314px]',
  },
} as const;

/** Bead + adjustment share one width on the bottom band (same line). */
const SIDE_FEATURE_PAIR = {
  widthClass: 'w-[290px] max-w-full lg:w-[314px]',
  labelClassName: 'min-h-[2.75rem] leading-snug lg:min-h-[3.25rem]',
} as const;

type FeatureKey = keyof typeof FEATURE_ITEMS;

function FeatureCard({
  featureKey,
  label,
  className,
  widthClass,
  labelClassName,
}: {
  featureKey: FeatureKey;
  label: string;
  className?: string;
  widthClass?: string;
  labelClassName?: string;
}) {
  const item = FEATURE_ITEMS[featureKey];

  return (
    <figure
      className={cn(
        'flex flex-col gap-2',
        widthClass ?? item.widthClass,
        className,
      )}
    >
      <BracketLabel
        className={cn(
          'text-[12px] leading-snug lg:text-[13px]',
          labelClassName,
        )}
      >
        {label}
      </BracketLabel>
      <Image
        src={item.src}
        alt={label}
        width={item.width}
        height={item.height}
        sizes="(max-width: 1024px) 90vw, 440px"
        className="block h-auto w-full"
      />
    </figure>
  );
}

function FeaturesHeadingBlock({ t }: { t: (key: string) => string }) {
  return (
    <>
      <SectionLabel className="text-sm lg:text-base">
        {t('landing.features.label')}
      </SectionLabel>
      <SectionHeading className="mt-2 text-[clamp(1.85rem,3.5vw,3rem)] leading-[1.08]">
        <span className="block">{t('landing.features.headingLine1')}</span>
        <span className="block">{t('landing.features.headingLine2')}</span>
      </SectionHeading>
    </>
  );
}

export async function FeaturesSection() {
  const { t } = await getTranslator();

  const mobileOrder: FeatureKey[] = [
    'bracelet',
    'lettering',
    'bead',
    'endTip',
    'adjustment',
  ];

  return (
    <SectionShell id="features" className="bg-white pt-28 pb-12 lg:pt-40 lg:pb-20">
      {/* Mobile */}
      <div
        data-scroll-reveal
        className="mx-auto mb-8 flex max-w-[1116px] flex-col items-center text-center lg:hidden"
      >
        <FeaturesHeadingBlock t={t} />
      </div>

      <div
        data-scroll-stagger
        className="mx-auto flex max-w-[1116px] flex-col gap-8 sm:gap-10 lg:hidden"
      >
        {mobileOrder.map((key) => (
          <div key={key} data-scroll-stagger-item className="mx-auto w-full max-w-[440px]">
            <FeatureCard
              featureKey={key}
              label={t(`landing.features.items.${key}`)}
            />
          </div>
        ))}
      </div>

      {/*
        Desktop masonry (matches Figma / user wireframe):
        Row 1: bracelet (left)          | lettering (right, spans rows 1–2)
        Row 2:                          | FEATURES heading (center)
        Row 3: bead + adjustment (top), end tip centered between them (offset down)
      */}
      <div
        data-scroll-stagger
        className="mx-auto hidden max-w-[1116px] lg:grid lg:grid-cols-12 lg:grid-rows-[auto_auto_auto] lg:items-start lg:gap-x-6 lg:gap-y-6 xl:gap-x-10"
      >
        <div
          className="col-span-6 row-start-1 pt-[3.25rem] lg:pt-14"
          data-scroll-stagger-item
        >
          <FeatureCard
            featureKey="bracelet"
            label={t('landing.features.items.bracelet')}
          />
        </div>

        <div
          className="col-span-5 col-start-8 row-start-1 self-start justify-self-end -mt-16 lg:-mt-24 xl:-mt-28"
          data-scroll-stagger-item
        >
          <FeatureCard
            featureKey="lettering"
            label={t('landing.features.items.lettering')}
          />
        </div>

        <div
          className="col-span-4 col-start-5 row-start-2 self-center text-center"
          data-scroll-reveal
        >
          <FeaturesHeadingBlock t={t} />
        </div>

        <div className="col-span-12 row-start-3 grid grid-cols-[1fr_auto_1fr] items-start gap-x-6 xl:gap-x-10">
          <div className="justify-self-start" data-scroll-stagger-item>
            <FeatureCard
              featureKey="bead"
              label={t('landing.features.items.bead')}
              widthClass={SIDE_FEATURE_PAIR.widthClass}
              labelClassName={SIDE_FEATURE_PAIR.labelClassName}
            />
          </div>

          <div
            className="mt-56 justify-self-center lg:mt-64 xl:mt-72"
            data-scroll-stagger-item
          >
            <FeatureCard
              featureKey="endTip"
              label={t('landing.features.items.endTip')}
            />
          </div>

          <div className="justify-self-end" data-scroll-stagger-item>
            <FeatureCard
              featureKey="adjustment"
              label={t('landing.features.items.adjustment')}
              widthClass={SIDE_FEATURE_PAIR.widthClass}
              labelClassName={SIDE_FEATURE_PAIR.labelClassName}
            />
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
