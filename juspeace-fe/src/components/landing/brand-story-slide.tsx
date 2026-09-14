import { BrandStorySlideDeck } from '@/components/landing/brand-story-slide-deck';
import { listBrandStorySlides } from '@/lib/api/brand-story';

export async function BrandStorySlide() {
  const slides = await listBrandStorySlides();
  return <BrandStorySlideDeck slides={slides} />;
}
