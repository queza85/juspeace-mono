export const FEATURE_HUB = {
  hero: {
    src: '/product-feature/product-feature-middle.png',
    width: 3784,
    height: 2156,
  },
  lettering: {
    src: '/product-feature/product-feature-1.png',
    width: 1316,
    height: 580,
  },
  endTip: {
    src: '/product-feature/product-feature-2.png',
    width: 956,
    height: 820,
  },
  adjustment: {
    src: '/product-feature/product-feature-4.png',
    width: 816,
    height: 896,
  },
  bead: {
    src: '/product-feature/product-feature-3.png',
    width: 1316,
    height: 580,
  },
} as const;

export type DetailKey = 'lettering' | 'endTip' | 'bead' | 'adjustment';

export const DETAIL_GRID: Record<
  DetailKey,
  {
    frameClass: string;
    imageClass: string;
    crop?: { scale: number; origin: string };
  }
> = {
  lettering: {
    frameClass: 'h-[88px] w-[160px] sm:h-[96px] sm:w-[176px] lg:h-[104px] lg:w-[188px]',
    imageClass: 'object-contain',
  },
  endTip: {
    frameClass: 'h-[108px] w-[132px] sm:h-[116px] sm:w-[140px] lg:h-[124px] lg:w-[148px]',
    imageClass: 'object-contain',
  },
  bead: {
    frameClass: 'h-[124px] w-[124px] sm:h-[132px] sm:w-[132px] lg:h-[140px] lg:w-[140px]',
    imageClass: 'object-contain',
  },
  adjustment: {
    frameClass: 'h-[120px] w-[120px] sm:h-[128px] sm:w-[128px] lg:h-[140px] lg:w-[140px]',
    imageClass: 'object-contain',
  },
};

export const MOBILE_ORDER: Array<DetailKey | 'hero'> = [
  'hero',
  'lettering',
  'endTip',
  'bead',
  'adjustment',
];
