import Image from 'next/image';

import { SectionHeading } from '@/components/landing/section-heading';
import { inriaSerifBold } from '@/lib/fonts';
import { SectionLabel } from '@/components/landing/section-label';
import { SectionShell } from '@/components/landing/section-shell';
import { getTranslator } from '@/lib/i18n/server';
import { cn } from '@/lib/utils';

const COLLECTION_LOGO = '/header/juspeace_header.png';
const DAISY_ICON = '/brand/gd-flower.png';

const CIRCLE_SIZE =
  'h-[72px] w-[72px] sm:h-[82px] sm:w-[82px] lg:h-[92px] lg:w-[92px]';

/** Orbital positions: top pair flanks "Donation", bottom pair frames the headline. */
const FLOATING_IMAGES = [
  {
    src: '/donation/donation-one.png',
    width: 1142,
    height: 738,
    altKey: 'floatingOne',
    className:
      'left-[2%] top-[19%] sm:-left-[2%] sm:top-[18%] lg:-left-[8%] lg:top-[17%]',
  },
  {
    src: '/donation/donation-two.png',
    width: 1020,
    height: 1294,
    altKey: 'floatingTwo',
    className:
      'right-[2%] top-[19%] sm:-right-[2%] sm:top-[18%] lg:-right-[8%] lg:top-[17%]',
  },
  {
    src: '/donation/donation-three.png',
    width: 1060,
    height: 796,
    altKey: 'floatingThree',
    className:
      'left-0 top-[56%] sm:-left-[12%] sm:top-[58%] lg:-left-[22%] lg:top-[60%]',
  },
  {
    src: '/donation/donation-four.png',
    width: 1054,
    height: 820,
    altKey: 'floatingFour',
    className:
      'right-0 top-[56%] sm:-right-[12%] sm:top-[58%] lg:-right-[22%] lg:top-[60%]',
  },
] as const;

const AVATAR_IMAGES = [
  '/donation/donation-one.png',
  '/donation/donation-two.png',
  '/donation/donation-three.png',
  '/donation/donation-four.png',
  '/donation/donation-two.png',
] as const;

function DonationCirclePhoto({
  src,
  width,
  height,
  alt,
  className,
}: {
  src: string;
  width: number;
  height: number;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'absolute overflow-hidden rounded-full border-2 border-white shadow-[0_4px_14px_rgba(0,0,0,0.07)]',
        CIRCLE_SIZE,
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

export async function DonationSection() {
  const { t } = await getTranslator();

  return (
    <SectionShell id="donation" className="mb-16 bg-white pt-16 pb-10 lg:mb-28 lg:pt-24 lg:pb-12">
      <div data-scroll-reveal className="mx-auto max-w-[1116px]">
        <div className="relative mx-auto min-h-[320px] max-w-[720px] sm:min-h-[340px] lg:min-h-[360px] lg:max-w-[800px]">
          {FLOATING_IMAGES.map((item) => (
            <DonationCirclePhoto
              key={item.src}
              src={item.src}
              width={item.width}
              height={item.height}
              alt={t(`landing.donation.${item.altKey}Alt`)}
              className={item.className}
            />
          ))}

          <div className="relative z-10 mx-auto flex w-full flex-col items-center px-4 text-center">
            <div className="relative size-16 shrink-0 -translate-y-4 overflow-hidden rounded-full sm:size-20 sm:-translate-y-5 lg:size-24 lg:-translate-y-6">
              <Image
                src={COLLECTION_LOGO}
                alt="JUSPEACE"
                width={96}
                height={96}
                className="size-full object-cover"
              />
            </div>
            <SectionLabel className="mt-5 text-base sm:text-lg">
              {t('landing.donation.label')}
            </SectionLabel>
            <SectionHeading className="mt-8 text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.12]">
              <span className="block">{t('landing.donation.headlineLine1')}</span>
              <span className="block whitespace-nowrap">{t('landing.donation.headlineLine2')}</span>
            </SectionHeading>
            <p className="mt-16 max-w-[34rem] px-4 text-center font-sans text-base leading-relaxed text-black sm:mt-20 sm:text-lg">
              <span className="block">{t('landing.donation.bodyLine1')}</span>
              <span className="block">{t('landing.donation.bodyLine2')}</span>
              <span className="block">{t('landing.donation.bodyLine3')}</span>
            </p>
          </div>
        </div>

        <div
          data-scroll-reveal
          className="mx-auto mt-24 flex w-full flex-col items-center text-center lg:mt-32"
        >
          <p className="font-display text-4xl font-bold leading-[1.02] tracking-[-0.035em] text-black sm:text-5xl lg:text-7xl xl:text-8xl">
            <span className={`relative inline-block font-bold ${inriaSerifBold.className}`}>
              <Image
                src={DAISY_ICON}
                alt=""
                width={48}
                height={48}
                aria-hidden
                className="absolute -top-14 left-[calc(13.6%-3rem)] !h-24 !w-24 object-contain sm:-top-16 sm:left-[calc(13.6%-3.5rem)] sm:!h-28 sm:!w-28 lg:-top-20 lg:left-[calc(13.6%-4.5rem)] lg:!h-36 lg:!w-36"
              />
              {t('landing.donation.statLine1')}
            </span>
            <span className="mt-1 block font-display font-medium">{t('landing.donation.statLine2')}</span>
          </p>

          <div className="mt-20 mb-20 flex items-center justify-center pl-3 sm:mt-[5.25rem] sm:mb-[5.25rem] lg:mt-24 lg:mb-24">
            {AVATAR_IMAGES.map((src, index) => (
              <div
                key={`${src}-${index}`}
                className="relative -ml-3 h-11 w-11 overflow-hidden rounded-full border-2 border-white shadow-sm first:ml-0 sm:h-12 sm:w-12"
              >
                <Image
                  src={src}
                  alt={t('landing.donation.avatarAlt', { index: index + 1 })}
                  width={120}
                  height={120}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>

          <p className="jp-donation-intro-ko flex flex-col items-center gap-1.5 text-sm text-black sm:text-base">
            <span>{t('landing.donation.introKoLine1')}</span>
            <span className="text-black/80" aria-hidden>
              —
            </span>
            <span>{t('landing.donation.introKoLine2')}</span>
          </p>

          <button
            type="button"
            className="mt-14 bg-black px-8 py-3 font-sans text-sm text-white transition-opacity hover:opacity-90 sm:mt-16 sm:px-10"
          >
            {t('landing.donation.cta')}
          </button>
        </div>
      </div>
    </SectionShell>
  );
}
