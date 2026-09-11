import { AboveFaqSection } from '@/components/landing/above-faq-section';
import { BrandStorySection } from '@/components/landing/brand-story-section';
import { DonationSection } from '@/components/landing/donation-section';
import { FaqSection } from '@/components/landing/faq-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { GallerySection } from '@/components/landing/gallery-section';
import { HeroSection } from '@/components/landing/hero-section';
import { LandingFooter } from '@/components/landing/landing-footer';
import { LandingHeader } from '@/components/landing/landing-header';
import { LandingScrollMotion } from '@/components/landing/landing-scroll-motion';
import { LandingVideoSection } from '@/components/landing/landing-video-section';
import { ProductCollectionSection } from '@/components/landing/product-collection-section';
import { listProducts } from '@/lib/api/products';

export default async function LandingPage() {
  const productsResponse = await listProducts({ limit: 12 }).catch(() => null);

  return (
    <>
      <LandingScrollMotion />
      <LandingHeader />
      <HeroSection />
      <BrandStorySection />
      <ProductCollectionSection products={productsResponse?.items ?? []} />
      <FeaturesSection />
      <LandingVideoSection />
      <GallerySection />
      <DonationSection />
      <AboveFaqSection />
      <FaqSection />
      <LandingFooter />
    </>
  );
}
