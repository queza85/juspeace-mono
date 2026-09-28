import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LandingFooter } from '@/components/landing/landing-footer';
import { LandingHeader } from '@/components/landing/landing-header';
import { CheckoutPageContent } from '@/components/checkout/checkout-page-content';
import { getTranslator } from '@/lib/i18n/server';

export async function generateMetadata() {
  const { t } = await getTranslator();
  return {
    title: t('checkout.pageTitle'),
    description: t('checkout.subtitle'),
  };
}

export default async function CheckoutPage() {
  const { t } = await getTranslator();

  return (
    <>
      <LandingHeader variant="light" />
      <article className="min-h-[60vh] bg-white">
        <div className="mx-auto w-full max-w-[1280px] px-5 py-8 sm:px-8 lg:px-12 xl:px-[75px] lg:py-10">
          <Link
            href="/cart"
            className="mb-8 inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-black underline underline-offset-4 transition-opacity hover:opacity-70 sm:text-sm"
          >
            <ArrowLeft className="size-3.5" strokeWidth={2.25} aria-hidden />
            {t('checkout.back')}
          </Link>

          <CheckoutPageContent />
        </div>
      </article>
      <LandingFooter />
    </>
  );
}
