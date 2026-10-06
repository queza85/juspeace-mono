import Link from 'next/link';

import { LandingFooter } from '@/components/landing/landing-footer';
import { LandingHeader } from '@/components/landing/landing-header';
import { getTranslator } from '@/lib/i18n/server';

export async function generateMetadata() {
  const { t } = await getTranslator();

  return {
    title: t('landing.productVerification.pageTitle'),
    description: t('landing.productVerification.pageBody'),
  };
}

export default async function VerifyPage() {
  const { t } = await getTranslator();

  return (
    <>
      <LandingHeader variant="light" />
      <article className="min-h-[60vh] bg-white">
        <div className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-6 lg:py-24">
          <p className="font-sans text-sm tracking-[0.14em] text-black/60">
            {t('landing.productVerification.label')}
          </p>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-black sm:text-5xl">
            {t('landing.productVerification.pageTitle')}
          </h1>
          <p className="mt-8 text-base leading-7 text-black/80">
            {t('landing.productVerification.pageBody')}
          </p>
          <p className="mt-8 font-sans text-sm tracking-[0.14em] text-black sm:text-base">
            {t('landing.productVerification.steps')}
          </p>
          <p className="mt-8 text-base leading-7 text-black/80">
            {t('landing.productVerification.pageCertificate')}
          </p>
          <Link
            href="/#collection"
            className="jp-landing-cta mt-10 inline-flex items-center justify-center"
          >
            {t('landing.hero.exploreCollection')}
          </Link>
        </div>
      </article>
      <LandingFooter />
    </>
  );
}
