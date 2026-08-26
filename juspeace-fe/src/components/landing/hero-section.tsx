import Image from 'next/image';
import { ChevronsDown } from 'lucide-react';
import { MediaPlaceholder } from '@/components/landing/media-placeholder';
import { getTranslator } from '@/lib/i18n/server';

const THUMBNAIL_COUNT = 9;
const HERO_BACKGROUND = '/landing/juspeace_just_hand.png';

export async function HeroSection() {
  const { t } = await getTranslator();

  return (
    <section className="relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-black text-white lg:min-h-[900px] xl:min-h-[1000px] 2xl:min-h-[1177px]">
      <div className="absolute inset-0">
        <Image
          src={HERO_BACKGROUND}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_75%]"
        />
        <div className="absolute inset-0 bg-jp-hero-overlay" aria-hidden />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1920px] flex-1 flex-col px-5 pb-8 pt-[160px] sm:px-8 sm:pt-[180px] lg:px-[75px] lg:pb-10 lg:pt-[220px] xl:pt-[240px] 2xl:pt-[253px]">
        {/*
          Figma: title @ y=253, passage @ y=395 (≈142px lower) — staggered, not same line.
          Passage: Fragment Mono 18px, ~433px wide.
        */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          <h1 className="-mt-8 max-w-[684px] shrink-0 font-serif text-[40px] leading-[43px] font-normal tracking-normal sm:-mt-10 sm:text-[56px] sm:leading-[60px] lg:-mt-14 lg:text-[72px] lg:leading-[78px] xl:-mt-16 xl:text-[88px] xl:leading-[95px]">
            <span className="block">{t('landing.hero.titleLine1')}</span>
            <span className="block">{t('landing.hero.titleLine2')}</span>
          </h1>

          <div className="flex w-full max-w-[433px] flex-col lg:mt-[100px] lg:w-[433px] lg:shrink-0 xl:mt-[120px] 2xl:mt-[142px]">
            {/*
              Figma text 433×110, Fragment Mono 18px.
              Line breaks match design screenshot; leading ~22px (not 100% — too tight).
            */}
            <p className="whitespace-pre-line font-mono text-[18px] leading-[22px] font-normal tracking-normal text-white">
              {t('landing.hero.description')}
            </p>
            <div className="mt-[52px] flex flex-wrap items-center gap-3.5">
              <a
                href="#collection"
                className="inline-flex h-12 min-w-[140px] items-center justify-center bg-white px-6 font-mono text-[16px] leading-none font-normal tracking-normal text-black"
              >
                {t('landing.hero.buyNow')}
              </a>
              <a
                href="#collection"
                className="font-mono text-[16px] leading-none font-normal tracking-normal text-white underline underline-offset-[5px]"
              >
                {t('landing.hero.exploreCollection')}
              </a>
            </div>
          </div>
        </div>

        {/* Thumbnails + product tag (Figma places tag above the bracelet tile) */}
        <div className="mt-auto pt-10 lg:pt-14">
          <div className="mb-3 flex pl-[calc((156px+12px)*2)] sm:pl-[calc((180px+14px)*2)] lg:pl-[calc((202px+16px)*2)]">
            <p className="font-mono text-[12px] text-white sm:text-[14px] lg:text-[18px]">
              [ {t('landing.hero.tag')} ]
            </p>
          </div>

          <div className="overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-max items-end gap-3 sm:gap-3.5 lg:gap-4">
              {Array.from({ length: THUMBNAIL_COUNT }, (_, index) => (
                <div
                  key={index}
                  className={
                    index === 2
                      ? '-translate-y-6 lg:-translate-y-10'
                      : undefined
                  }
                >
                  <MediaPlaceholder
                    className="h-[148px] w-[140px] rounded-[28px] bg-neutral-700/80 sm:h-[180px] sm:w-[170px] sm:rounded-[32px] lg:h-[208px] lg:w-[202px] lg:rounded-[38px]"
                    aspectRatio="202 / 208"
                    label={t('landing.hero.thumbnail', { index: index + 1 })}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-1.5 text-white lg:mt-8">
            <p className="font-mono text-[14px] sm:text-[16px] lg:text-[18px]">
              [ <span className="font-mono">{t('landing.hero.scroll')}</span> ]
            </p>
            <ChevronsDown className="size-5 opacity-80" aria-hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
