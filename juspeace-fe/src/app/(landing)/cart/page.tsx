import { LandingFooter } from '@/components/landing/landing-footer';
import { LandingHeader } from '@/components/landing/landing-header';
import { CartBreadcrumb } from '@/components/cart/cart-breadcrumb';
import { CartPageContent } from '@/components/cart/cart-page-content';
import { getTranslator } from '@/lib/i18n/server';

export async function generateMetadata() {
  const { t } = await getTranslator();
  return {
    title: t('cart.pageTitle'),
    description: t('cart.subtitle'),
  };
}

export default function CartPage() {
  return (
    <>
      <LandingHeader variant="light" />
      <article className="min-h-[60vh] bg-white">
        <div className="mx-auto w-full max-w-[1920px] px-5 pt-8 pb-[226px] sm:px-6 lg:px-8 lg:pt-10 lg:pb-[374px] xl:px-10">
          <div className="mx-auto w-[80vw] max-w-full">
            <CartBreadcrumb />
            <CartPageContent />
          </div>
        </div>
      </article>
      <LandingFooter />
    </>
  );
}
