import Image from 'next/image';
import { ChevronLeft } from 'lucide-react';

import { SectionShell } from '@/components/landing/section-shell';
import { getTranslator } from '@/lib/i18n/server';

const SHOWCASE_IMAGE = '/faq/above-FAQs.png';

export async function AboveFaqSection() {
  const { t } = await getTranslator();

  return (
    <SectionShell fullWidth className="bg-white pt-2 pb-16 lg:pt-4 lg:pb-24">
      <div data-scroll-reveal className="relative w-full">
        <Image
          src={SHOWCASE_IMAGE}
          alt={t('landing.aboveFaq.imageAlt')}
          width={1024}
          height={768}
          className="h-auto w-full object-cover"
          sizes="100vw"
        />

        <div
          className="absolute inset-y-0 left-0 flex items-center pl-4 sm:pl-6 lg:pl-10"
          aria-label={t('landing.aboveFaq.carouselLabel')}
        >
          <button
            type="button"
            disabled
            aria-disabled="true"
            aria-label={t('landing.aboveFaq.prevAria')}
            className="inline-flex size-10 items-center justify-center rounded-full bg-white/75 text-black/55 shadow-sm backdrop-blur-sm sm:size-11"
          >
            <ChevronLeft className="size-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </SectionShell>
  );
}
