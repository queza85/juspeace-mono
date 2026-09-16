export type BrandStorySlideItem = {
  id: 'origin' | 'change-together' | 'story-3';
};

const MAX_PEEK_LAYERS = 2;

/**
 * Brand stories for the scrapbook stack.
 * Swap the body for `apiRequest('/brand-stories')` when the API is ready.
 */
export async function listBrandStorySlides(): Promise<BrandStorySlideItem[]> {
  return [
    { id: 'origin' },
    { id: 'change-together' },
    { id: 'story-3' },
  ];
}

export function brandStoryPeekCount(slideCount: number): number {
  return Math.min(MAX_PEEK_LAYERS, Math.max(0, slideCount - 1));
}
