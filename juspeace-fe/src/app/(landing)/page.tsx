import { BrandStorySection } from '@/components/landing/brand-story-section';
import { DonationSection } from '@/components/landing/donation-section';
import { FaqSection } from '@/components/landing/faq-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { GallerySection } from '@/components/landing/gallery-section';
import { HeroSection } from '@/components/landing/hero-section';
import { LandingFooter } from '@/components/landing/landing-footer';
import { LandingHeader } from '@/components/landing/landing-header';
import { LandingScrollMotion } from '@/components/landing/landing-scroll-motion';
import { ProductCollectionSection } from '@/components/landing/product-collection-section';
import { RelationshipSection } from '@/components/landing/relationship-section';
import { listProducts } from '@/lib/api/products';

export default async function LandingPage() {
  const productsResponse = await listProducts({ limit: 12 }).catch(() => null);

  return (
    <>
      <LandingScrollMotion />
      <LandingHeader />
      <HeroSection />
      <BrandStorySection />
      <RelationshipSection />
      <ProductCollectionSection products={productsResponse?.items ?? []} />
      <FeaturesSection />
      <GallerySection />
      <DonationSection />
      <FaqSection />
      <LandingFooter />
    </>
  );
}
