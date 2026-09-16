import Image from 'next/image';

import { BrandStorySlide } from '@/components/landing/brand-story-slide';
import { SectionShell } from '@/components/landing/section-shell';
import { getTranslator } from '@/lib/i18n/server';

const BRAND_STORY_FLOWER = '/brand/gd-flower.png';

export async function BrandStorySection() {
  const { t } = await getTranslator();

  return (
    <SectionShell id="story" className="bg-white pt-4 pb-20 lg:pt-6 lg:pb-28">
      <div
        data-scroll-reveal
        className="mx-auto flex max-w-[1116px] flex-col items-center text-center"
      >
        <Image
          src={BRAND_STORY_FLOWER}
          alt={t('landing.brandStory.flowerAlt')}
          width={128}
          height={128}
          className="mb-6 h-20 w-20 object-contain sm:mb-8 sm:h-28 sm:w-28 lg:h-32 lg:w-32"
        />
        <h2 className="jp-brand-story-quote">
          <span className="jp-brand-story-quote-line">
            {t('landing.brandStory.quoteLine1')}
          </span>
          <span className="jp-brand-story-quote-line">
            {t('landing.brandStory.quoteLine2')}
          </span>
          <span className="jp-brand-story-quote-line">
            {t('landing.brandStory.quoteLine3')}
          </span>
          <span className="jp-brand-story-quote-line">
            {t('landing.brandStory.quoteLine4')}
          </span>
        </h2>
        <p className="jp-brand-story-subtext mt-8 sm:mt-10">
          <span className="block">{t('landing.brandStory.subtextLine1')}</span>
          <span className="block">{t('landing.brandStory.subtextLine2')}</span>
        </p>
      </div>

      <div data-scroll-reveal>
        <BrandStorySlide />
      </div>
    </SectionShell>
  );
}
