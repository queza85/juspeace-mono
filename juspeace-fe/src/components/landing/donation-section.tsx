import { Play } from 'lucide-react';
import { BracketLabel } from '@/components/landing/bracket-label';
import { MediaPlaceholder } from '@/components/landing/media-placeholder';
import { SectionHeading } from '@/components/landing/section-heading';
import { SectionLabel } from '@/components/landing/section-label';
import { SectionShell } from '@/components/landing/section-shell';
import { getTranslator } from '@/lib/i18n/server';

export async function DonationSection() {
  const { t } = await getTranslator();

  return (
    <>
      <SectionShell fullWidth className="bg-black">
        <div className="relative mx-auto flex min-h-[520px] w-full max-w-[1920px] items-center justify-center lg:min-h-[1044px]">
          <MediaPlaceholder
            className="absolute inset-0 h-full rounded-none bg-neutral-900"
            aspectRatio="auto"
            label={t('landing.donation.mediaLabel')}
          />
          <button
            type="button"
            className="relative z-10 flex size-20 items-center justify-center rounded-full border border-white/40 bg-black/30 text-white backdrop-blur-sm"
            aria-label={t('landing.donation.playLabel')}
          >
            <Play className="size-8 fill-white" aria-hidden />
          </button>
        </div>
      </SectionShell>

      <SectionShell id="donation" className="bg-white py-16 lg:py-24">
        <div className="mx-auto flex max-w-[583px] flex-col items-center text-center">
          <SectionLabel>{t('landing.donation.label')}</SectionLabel>
          <SectionHeading className="mt-6 text-[clamp(2rem,5vw,3.625rem)] leading-[1.12] tracking-[-0.02em]">
            <span className="block">{t('landing.donation.headlineLine1')}</span>
            <span className="block">{t('landing.donation.headlineLine2')}</span>
            <span className="block">{t('landing.donation.headlineLine3')}</span>
          </SectionHeading>
          <p className="mt-8 font-mono text-lg leading-8 text-black sm:text-[22px]">
            {t('landing.donation.body')}
          </p>
          <BracketLabel className="mt-8">
            {t('landing.donation.priceTag')}
          </BracketLabel>
        </div>
      </SectionShell>
    </>
  );
}
