import Image from 'next/image';

import { BrandStorySlide } from '@/components/landing/brand-story-slide';
import { SectionShell } from '@/components/landing/section-shell';
import { instrumentSansBold } from '@/lib/fonts';
import { getTranslator } from '@/lib/i18n/server';
import { cn } from '@/lib/utils';

const BRAND_STORY_FLOWER = '/brand/gd-flower.png';

export async function BrandStorySection() {
  const { t } = await getTranslator();

  return (
    <SectionShell id="story" className="bg-white pt-24 pb-20 sm:pt-28 lg:pt-36 xl:pt-40 lg:pb-28">
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
            <span
              className={cn(
                'jp-brand-story-quote-part',
                instrumentSansBold.className,
              )}
            >
              {t('landing.brandStory.quoteWordmark')}
            </span>
            <span className="jp-brand-story-quote-part jp-brand-story-quote-satoshi">
              {t('landing.brandStory.quoteLine1')}
            </span>
          </span>
          <span className="jp-brand-story-quote-line jp-brand-story-quote-part jp-brand-story-quote-satoshi">
            {t('landing.brandStory.quoteLine2')}
          </span>
          <span className="jp-brand-story-quote-line jp-brand-story-quote-part jp-brand-story-quote-satoshi">
            {t('landing.brandStory.quoteLine3')}
          </span>
          <span className="jp-brand-story-quote-line jp-brand-story-quote-part jp-brand-story-quote-satoshi">
            {t('landing.brandStory.quoteLine4')}
          </span>
        </h2>
        <p className="jp-brand-story-subtext">
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
