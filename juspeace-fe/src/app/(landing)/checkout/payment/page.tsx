import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LandingFooter } from '@/components/landing/landing-footer';
import { LandingHeader } from '@/components/landing/landing-header';
import { PaymentPageContent } from '@/components/checkout/payment-page-content';
import { getTranslator } from '@/lib/i18n/server';

export async function generateMetadata() {
  const { t } = await getTranslator();
  return {
    title: t('payment.pageTitle'),
    description: t('payment.subtitle'),
  };
}

export default async function CheckoutPaymentPage() {
  const { t } = await getTranslator();

  return (
    <>
      <LandingHeader variant="light" />
      <article className="min-h-[60vh] bg-white">
        <div className="mx-auto w-full max-w-[1280px] px-5 pt-8 pb-[226px] sm:px-8 lg:px-12 lg:pt-10 lg:pb-[374px] xl:px-[75px] min-[1680px]:max-w-[1560px]">
          <Link
            href="/checkout"
            className="mb-8 inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-black underline underline-offset-4 transition-opacity hover:opacity-70 sm:text-sm"
          >
            <ArrowLeft className="size-3.5" strokeWidth={2.25} aria-hidden />
            {t('payment.back')}
          </Link>

          <PaymentPageContent />
        </div>
      </article>
      <LandingFooter />
    </>
  );
}
