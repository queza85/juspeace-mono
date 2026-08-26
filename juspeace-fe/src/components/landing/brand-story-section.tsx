import { BracketLabel } from '@/components/landing/bracket-label';
import { MediaPlaceholder } from '@/components/landing/media-placeholder';
import { SectionHeading } from '@/components/landing/section-heading';
import { SectionLabel } from '@/components/landing/section-label';
import { SectionShell } from '@/components/landing/section-shell';
import { getTranslator } from '@/lib/i18n/server';

export async function BrandStorySection() {
  const { t } = await getTranslator();

  return (
    <SectionShell id="story" className="bg-white py-20 lg:py-28">
      <div className="mx-auto flex max-w-[1116px] flex-col items-center text-center">
        <SectionLabel>{t('landing.brandStory.label')}</SectionLabel>
        <SectionHeading className="mt-6 max-w-[534px] text-[clamp(2rem,5vw,3.625rem)] leading-[1.12] tracking-[-0.02em]">
          {t('landing.brandStory.quote')}
        </SectionHeading>
        <p className="mt-8 max-w-[447px] font-mono text-lg leading-8 text-black sm:text-[22px]">
          {t('landing.brandStory.subtext')}
        </p>
      </div>

      <div className="mt-16 grid gap-10 lg:mt-24 lg:grid-cols-3 lg:items-end lg:gap-8">
        <article className="flex flex-col gap-5">
          <MediaPlaceholder
            className="w-full rounded-none"
            aspectRatio="511 / 696"
            label={t('landing.brandStory.leftImage')}
          />
          <BracketLabel className="text-jp-muted">
            {t('landing.brandStory.leftCaption')}
          </BracketLabel>
          <p className="max-w-[508px] font-mono text-lg leading-8 text-black sm:text-[22px]">
            {t('landing.brandStory.leftBody')}
          </p>
        </article>

        <article className="lg:-translate-y-12">
          <MediaPlaceholder
            className="w-full rounded-none"
            aspectRatio="511 / 696"
            label={t('landing.brandStory.centerImage')}
          />
        </article>

        <article className="flex flex-col gap-5">
          <MediaPlaceholder
            className="w-full rounded-none"
            aspectRatio="511 / 696"
            label={t('landing.brandStory.rightImage')}
          />
          <BracketLabel className="text-jp-muted">
            {t('landing.brandStory.rightCaption')}
          </BracketLabel>
          <p className="max-w-[508px] font-mono text-lg leading-8 text-black sm:text-[22px]">
            {t('landing.brandStory.rightBody')}
          </p>
        </article>
      </div>
    </SectionShell>
  );
}
