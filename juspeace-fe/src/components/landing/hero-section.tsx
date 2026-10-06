import { HeroAnimatedCopy } from '@/components/landing/hero-animated-copy';
import { HeroBackgroundMotion } from '@/components/landing/hero-background-motion';
import { HeroMarquee } from '@/components/landing/hero-marquee';
import { getTranslator } from '@/lib/i18n/server';

const HERO_BACKGROUND = '/landing/landing-page-hand-background.png';

export async function HeroSection() {
  const { t } = await getTranslator();

  return (
    <section className="relative flex min-h-[100svh] w-full flex-col overflow-x-clip bg-black text-white lg:min-h-[900px] xl:min-h-[1000px] 2xl:min-h-[1177px]">
      <HeroBackgroundMotion src={HERO_BACKGROUND} />

      <div className="relative z-10 mx-auto flex w-full max-w-[1920px] flex-1 flex-col px-5 pb-8 pt-[160px] sm:px-8 sm:pt-[180px] lg:px-[75px] lg:pb-10 lg:pt-[268px] xl:pt-[288px] 2xl:pt-[308px]">
        <HeroAnimatedCopy
          titleLine1={t('landing.hero.titleLine1')}
          titleLine2={t('landing.hero.titleLine2')}
          description={t('landing.hero.description')}
          buyNow={t('landing.hero.buyNow')}
          exploreCollection={t('landing.hero.exploreCollection')}
        />
      </div>

      <div className="relative z-10 mt-auto w-full min-h-[300px] overflow-visible pt-4 sm:min-h-[340px] lg:min-h-[380px] lg:pt-6">
        <HeroMarquee />
      </div>
    </section>
  );
}
