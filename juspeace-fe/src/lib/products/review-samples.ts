export interface ProductReviewSample {
  id: string;
  reviewerNameKey: string;
  reviewerEmailKey: string;
  avatarInitials: string;
  avatarTone: 'slate' | 'rose';
  rating: number;
  postedAtKey: string;
  titleKey?: string;
  bodyKey: string;
  photoSrc?: string;
}

/** Static PDP reviews until the reviews API is available. */
export const PRODUCT_REVIEW_SAMPLES: ProductReviewSample[] = [
  {
    id: '1',
    reviewerNameKey: 'products.detail.reviews.samples.1.name',
    reviewerEmailKey: 'products.detail.reviews.samples.1.email',
    avatarInitials: 'MM',
    avatarTone: 'slate',
    rating: 5,
    postedAtKey: 'products.detail.reviews.samples.1.postedAt',
    titleKey: 'products.detail.reviews.samples.1.title',
    bodyKey: 'products.detail.reviews.samples.1.body',
    photoSrc: '/product-collection/juespeace_mar4.png',
  },
  {
    id: '2',
    reviewerNameKey: 'products.detail.reviews.samples.2.name',
    reviewerEmailKey: 'products.detail.reviews.samples.2.email',
    avatarInitials: 'LL',
    avatarTone: 'rose',
    rating: 5,
    postedAtKey: 'products.detail.reviews.samples.2.postedAt',
    bodyKey: 'products.detail.reviews.samples.2.body',
  },
];
