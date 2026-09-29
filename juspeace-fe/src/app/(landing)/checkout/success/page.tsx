import { LandingFooter } from '@/components/landing/landing-footer';
import { LandingHeader } from '@/components/landing/landing-header';
import { OrderSuccessContent } from '@/components/checkout/order-success-content';
import { getTranslator } from '@/lib/i18n/server';

export async function generateMetadata() {
  const { t } = await getTranslator();
  return {
    title: t('orderSuccess.pageTitle'),
    description: t('orderSuccess.subtitle'),
  };
}

export default async function CheckoutSuccessPage() {
  return (
    <>
      <LandingHeader variant="light" />
      <article className="min-h-[60vh] bg-white">
        <div className="mx-auto w-full max-w-[1280px] px-5 pt-20 pb-40 sm:px-8 sm:pt-28 sm:pb-60 md:pt-36 md:pb-72 lg:px-12 lg:pt-44 lg:pb-88 xl:px-[75px] xl:pt-48 xl:pb-96 min-[1680px]:max-w-[1560px]">
          <OrderSuccessContent />
        </div>
      </article>
      <LandingFooter />
    </>
  );
}
