import Link from 'next/link';
import { LandingFooter } from '@/components/landing/landing-footer';
import { LandingHeader } from '@/components/landing/landing-header';
import { ReviewPageContent } from '@/components/checkout/review-page-content';
import { getTranslator } from '@/lib/i18n/server';

export async function generateMetadata() {
  const { t } = await getTranslator();
  return {
    title: t('review.pageTitle'),
    description: t('review.subtitle'),
  };
}

export default async function CheckoutReviewPage() {
  const { t } = await getTranslator();

  return (
    <>
      <LandingHeader variant="light" />
      <article className="min-h-[60vh] bg-white">
        <div className="mx-auto w-full max-w-[1280px] px-5 py-8 sm:px-8 lg:px-12 xl:px-[75px] lg:py-10 min-[1680px]:max-w-[1560px]">
          <nav
            aria-label="Breadcrumb"
            className="mb-8 font-mono text-xs text-jp-muted sm:text-sm"
          >
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link
                  href="/#collection"
                  className="transition-colors hover:text-black"
                >
                  {t('products.detail.breadcrumbCollection')}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href="/cart" className="transition-colors hover:text-black">
                  {t('cart.breadcrumb')}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link
                  href="/checkout"
                  className="transition-colors hover:text-black"
                >
                  {t('checkout.breadcrumb')}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link
                  href="/checkout/payment"
                  className="transition-colors hover:text-black"
                >
                  {t('payment.breadcrumb')}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-black">{t('review.breadcrumb')}</li>
            </ol>
          </nav>

          <ReviewPageContent />
        </div>
      </article>
      <LandingFooter />
    </>
  );
}
