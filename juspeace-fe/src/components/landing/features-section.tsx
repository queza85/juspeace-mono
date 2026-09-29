import Image from 'next/image';

import { BracketLabel } from '@/components/landing/bracket-label';
import { type DetailKey } from '@/components/landing/feature-hub.constants';
import { FeaturesProductHub } from '@/components/landing/features-section-interactive';
import { SectionHeading } from '@/components/landing/section-heading';
import { SectionLabel } from '@/components/landing/section-label';
import { SectionShell } from '@/components/landing/section-shell';
import { getTranslator } from '@/lib/i18n/server';

const COLLECTION_LOGO = '/header/juspeace_header.png';

export async function FeaturesSection() {
  const { t } = await getTranslator();

  const detailLabels = {
    lettering: t('landing.features.items.lettering'),
    endTip: t('landing.features.items.endTip'),
    bead: t('landing.features.items.bead'),
    adjustment: t('landing.features.items.adjustment'),
  } satisfies Record<DetailKey, string>;

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
        <div className="relative mb-14 size-[4.5rem] shrink-0 overflow-hidden rounded-full sm:mb-16 sm:size-[5.375rem] lg:mb-20 lg:size-[6.25rem]">
          <Image
            src={COLLECTION_LOGO}
            alt="JUSPEACE"
            width={100}
            height={100}
            className="size-full object-cover"
          />
        </div>
        <SectionLabel className="text-base sm:text-lg lg:text-xl">
          {t('landing.features.label')}
        </SectionLabel>
        <SectionHeading className="mt-1 text-[clamp(2rem,5vw,3.5rem)] leading-[1.08] sm:mt-1.5 lg:mt-2">
          <span className="block">{t('landing.features.headingLine1')}</span>
          <span className="block">{t('landing.features.headingLine2')}</span>
          <span className="block">{t('landing.features.headingLine3')}</span>
        </SectionHeading>
      </div>

      <FeaturesProductHub heroAlt={heroAlt} detailLabels={detailLabels} />

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
