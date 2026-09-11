import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { getTranslator } from '@/lib/i18n/server';

const SLIDE_ASSETS = {
  paperclip: '/papper_click.png',
  koreanText: '/korean-text-beside-gd-pink-image.png',
  pinkPoster: '/gd-pick-photo.jpg',
  portraitSignature: '/gd-image-beside-pink.jpg',
  flower: '/gd-flower.png',
} as const;

export async function BrandStorySlide() {
  const { t } = await getTranslator();

  return (
    <div className="jp-brand-story-slide-stack mt-16 lg:mt-24">
      <div aria-hidden className="jp-brand-story-slide-layer jp-brand-story-slide-layer--back" />
      <div aria-hidden className="jp-brand-story-slide-layer jp-brand-story-slide-layer--mid" />

      <Image
        src={SLIDE_ASSETS.paperclip}
        alt=""
        width={88}
        height={88}
        aria-hidden
        className="pointer-events-none absolute -left-2 top-[-18px] z-40 h-[72px] w-[72px] -rotate-[22deg] object-contain sm:-left-3 sm:top-[-22px] sm:h-20 sm:w-20 lg:h-[88px] lg:w-[88px]"
      />

      <div className="jp-brand-story-slide-paper">
        <div className="flex flex-col gap-10 px-6 py-10 sm:px-10 sm:py-12 lg:flex-row lg:items-stretch lg:gap-14 lg:px-12 lg:py-14 xl:gap-20 xl:px-16 xl:py-16">
          <div className="jp-brand-story-slide-visual mx-auto lg:mx-0">
            <Image
              src={SLIDE_ASSETS.koreanText}
              alt={t('landing.brandStory.slideKoreanTextAlt')}
              width={1171}
              height={606}
              className="jp-brand-story-slide-korean absolute left-[-2%] top-[16%] z-10 w-[26%] object-contain"
            />
            <Image
              src={SLIDE_ASSETS.pinkPoster}
              alt={t('landing.brandStory.slidePinkPosterAlt')}
              width={480}
              height={640}
              className="jp-brand-story-slide-pink absolute left-[14%] top-[2%] z-20 w-[36%] -rotate-[9deg] object-cover shadow-[0_6px_20px_rgba(0,0,0,0.14)]"
            />
            <Image
              src={SLIDE_ASSETS.portraitSignature}
              alt={t('landing.brandStory.slidePortraitAlt')}
              width={520}
              height={720}
              className="jp-brand-story-slide-portrait absolute left-[38%] top-[0%] z-30 w-[44%] rotate-[6deg] object-cover shadow-[0_6px_20px_rgba(0,0,0,0.14)]"
            />
            <Image
              src={SLIDE_ASSETS.flower}
              alt={t('landing.brandStory.flowerAlt')}
              width={64}
              height={64}
              className="absolute bottom-[10%] left-[12%] z-40 h-9 w-9 object-contain sm:h-10 sm:w-10"
            />
          </div>

          <div className="flex flex-1 flex-col justify-between gap-12 lg:max-w-[520px] lg:py-4 xl:max-w-[560px]">
            <div className="jp-brand-story-slide-copy space-y-6 lg:space-y-8">
              <p>{t('landing.brandStory.slide1Paragraph1')}</p>
              <p>{t('landing.brandStory.slide1Paragraph2')}</p>
            </div>

            <div className="flex items-end justify-between gap-6">
              <p className="font-mono text-[13px] leading-none text-black sm:text-[14px]">
                [ {t('landing.brandStory.nextStory')} ]
              </p>
              <div
                className="flex items-center gap-2 text-black/60"
                aria-label={t('landing.brandStory.slideNavLabel')}
              >
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  aria-label={t('landing.brandStory.prevStoryAria')}
                  className="inline-flex size-7 items-center justify-center opacity-50"
                >
                  <ChevronLeft className="size-[18px]" strokeWidth={1.25} />
                </button>
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  aria-label={t('landing.brandStory.nextStoryAria')}
                  className="inline-flex size-7 items-center justify-center opacity-50"
                >
                  <ChevronRight className="size-[18px]" strokeWidth={1.25} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
