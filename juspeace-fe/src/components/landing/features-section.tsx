import { BracketLabel } from '@/components/landing/bracket-label';
import { MediaPlaceholder } from '@/components/landing/media-placeholder';
import { SectionHeading } from '@/components/landing/section-heading';
import { SectionLabel } from '@/components/landing/section-label';
import { SectionShell } from '@/components/landing/section-shell';
import { getTranslator } from '@/lib/i18n/server';

const FEATURE_ITEMS = [
  {
    key: 'bracelet',
    className: 'lg:col-start-1 lg:row-start-1 lg:max-w-[565px]',
    aspectRatio: '565 / 442',
  },
  {
    key: 'lettering',
    className: 'lg:col-start-3 lg:row-start-1 lg:max-w-[426px] lg:justify-self-end',
    aspectRatio: '426 / 613',
  },
  {
    key: 'bead',
    className: 'lg:col-start-1 lg:row-start-2 lg:max-w-[403px] lg:self-end',
    aspectRatio: '403 / 581',
  },
  {
    key: 'adjustment',
    className: 'lg:col-start-3 lg:row-start-2 lg:max-w-[409px] lg:justify-self-end',
    aspectRatio: '409 / 588',
  },
  {
    key: 'endTip',
    className: 'lg:col-start-2 lg:row-start-2 lg:max-w-[403px] lg:self-end lg:justify-self-center',
    aspectRatio: '403 / 345',
  },
] as const;

export async function FeaturesSection() {
  const { t } = await getTranslator();

  return (
    <SectionShell id="features" className="bg-white py-16 lg:py-28">
      <div className="relative mx-auto mb-16 flex max-w-[1116px] flex-col items-center text-center lg:absolute lg:inset-x-0 lg:top-1/3 lg:mb-0 lg:z-10">
        <SectionLabel>{t('landing.features.label')}</SectionLabel>
        <SectionHeading className="mt-4">
          <span className="block">{t('landing.features.headingLine1')}</span>
          <span className="block">{t('landing.features.headingLine2')}</span>
        </SectionHeading>
      </div>

      <div className="relative grid gap-12 lg:min-h-[1100px] lg:grid-cols-3 lg:grid-rows-2 lg:gap-8 lg:pt-24">
        {FEATURE_ITEMS.map((item) => (
          <figure key={item.key} className={`flex flex-col gap-3 ${item.className}`}>
            <BracketLabel>{t(`landing.features.items.${item.key}`)}</BracketLabel>
            <MediaPlaceholder
              className="w-full rounded-none"
              aspectRatio={item.aspectRatio}
              label={t(`landing.features.items.${item.key}`)}
            />
          </figure>
        ))}
      </div>
    </SectionShell>
  );
}
