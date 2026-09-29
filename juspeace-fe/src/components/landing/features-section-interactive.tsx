'use client';

import Image from 'next/image';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

import { BracketLabel } from '@/components/landing/bracket-label';
import {
  DETAIL_GRID,
  FEATURE_HUB,
  MOBILE_ORDER,
  type DetailKey,
} from '@/components/landing/feature-hub.constants';
import { useT } from '@/lib/i18n/locale-context';
import { cn } from '@/lib/utils';

const STAGE_TRANSITION_MS = 280;

export type FeatureFocusKey = DetailKey | 'hero';

type FeatureImage = { src: string; width: number; height: number };

type FocusItem = {
  key: FeatureFocusKey;
  label: string;
  image: FeatureImage;
};

type FeaturesHubContextValue = {
  openFocus: (key: FeatureFocusKey) => void;
};

const FeaturesHubContext = createContext<FeaturesHubContextValue | null>(null);

function useFeaturesHub() {
  const context = useContext(FeaturesHubContext);
  if (!context) {
    throw new Error('Feature hub components must render inside FeaturesProductHub');
  }
  return context;
}

function FeatureFocusStage({
  item,
  exiting,
  onClose,
}: {
  item: FocusItem;
  exiting: boolean;
  onClose: () => void;
}) {
  const t = useT();
  const titleId = useId();
  const backRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    backRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      className={cn(
        'mx-auto flex w-full max-w-[min(100%,40rem)] flex-col items-center lg:max-w-[34rem] xl:max-w-[38rem] 2xl:max-w-[42rem]',
        exiting ? 'jp-feature-stage-out' : 'jp-feature-stage-in',
      )}
    >
      <div className="flex w-full justify-start pb-4 sm:pb-5">
        <button
          ref={backRef}
          type="button"
          onClick={onClose}
          className="font-mono text-sm text-black transition-opacity hover:opacity-55 sm:text-base"
          aria-label={t('landing.features.closeZoom')}
        >
          [ {t('landing.features.zoomBackButton')} ]
        </button>
      </div>

      <div className="relative w-full max-w-[min(88vw,20rem)] px-2 sm:max-w-[min(82vw,24rem)] lg:max-w-[min(52vw,26rem)] xl:max-w-[min(46vw,30rem)] 2xl:max-w-[min(40vw,34rem)] sm:px-4">
        <Image
          src={item.image.src}
          alt={item.label}
          width={item.image.width}
          height={item.image.height}
          sizes="(max-width: 640px) 88vw, (max-width: 1024px) 52vw, (max-width: 1536px) 46vw, 34rem"
          className="jp-feature-stage-image mx-auto h-auto w-full max-h-[clamp(11rem,34vh,22rem)] object-contain sm:max-h-[clamp(12rem,36vh,24rem)] lg:max-h-[clamp(13rem,38vh,26rem)] xl:max-h-[clamp(14rem,40vh,28rem)] 2xl:max-h-[clamp(15rem,42vh,30rem)]"
          priority
        />
      </div>

      <div id={titleId} className="mt-5 sm:mt-6">
        <BracketLabel className="text-sm sm:text-base">
          {item.label.replace('\n', ' ')}
        </BracketLabel>
      </div>
    </div>
  );
}

function FeatureDetailCard({
  featureKey,
  label,
  image,
  frameClassName,
  imageClassName,
  crop,
  className,
  align = 'center',
}: {
  featureKey: DetailKey;
  label: string;
  image: FeatureImage;
  frameClassName: string;
  imageClassName?: string;
  crop?: { scale: number; origin: string };
  className?: string;
  align?: 'start' | 'end' | 'center';
}) {
  const { openFocus } = useFeaturesHub();

  return (
    <figure
      className={cn(
        'flex flex-col',
        align === 'start' && 'items-start',
        align === 'end' && 'items-end',
        align === 'center' && 'items-center',
        className,
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          className="group cursor-pointer"
          aria-label={label}
          onClick={() => openFocus(featureKey)}
        >
          <span
            className={cn(
              'relative block overflow-hidden transition-transform duration-300 ease-out group-hover:scale-[1.04]',
              frameClassName,
            )}
          >
            <Image
              src={image.src}
              alt={label}
              width={image.width}
              height={image.height}
              sizes="188px"
              className={cn('h-full w-full origin-center', imageClassName)}
              style={
                crop
                  ? { transform: `scale(${crop.scale})`, transformOrigin: crop.origin }
                  : undefined
              }
            />
          </span>
        </button>
        <figcaption className="jp-features-detail-caption text-center!">
          {label.split('\n').map((line, index) => (
            <span key={index} className="block">
              {line}
            </span>
          ))}
        </figcaption>
      </div>
    </figure>
  );
}

function FeatureHero({
  label,
  className,
  image,
}: {
  label: string;
  className?: string;
  image: FeatureImage;
}) {
  const { openFocus } = useFeaturesHub();

  return (
    <figure className={cn('mx-auto flex flex-col items-center text-center', className)}>
      <button
        type="button"
        className="group relative w-[280px] cursor-pointer sm:w-[400px] lg:w-[620px] xl:w-[680px]"
        aria-label={label}
        onClick={() => openFocus('hero')}
      >
        <Image
          src={image.src}
          alt={label}
          width={image.width}
          height={image.height}
          sizes="(max-width: 1024px) 70vw, (max-width: 1280px) 620px, 680px"
          className="h-auto w-full object-contain transition-transform duration-300 ease-out group-hover:scale-[1.02]"
        />
      </button>
    </figure>
  );
}

export function FeaturesProductHub({
  heroAlt,
  detailLabels,
}: {
  heroAlt: string;
  detailLabels: Record<DetailKey, string>;
}) {
  const hubRef = useRef<HTMLDivElement>(null);
  const [focusKey, setFocusKey] = useState<FeatureFocusKey | null>(null);
  const [stageExiting, setStageExiting] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const focusItems = useMemo<Record<FeatureFocusKey, FocusItem>>(
    () => ({
      hero: {
        key: 'hero',
        label: heroAlt,
        image: FEATURE_HUB.hero,
      },
      lettering: {
        key: 'lettering',
        label: detailLabels.lettering,
        image: FEATURE_HUB.lettering,
      },
      endTip: {
        key: 'endTip',
        label: detailLabels.endTip,
        image: FEATURE_HUB.endTip,
      },
      bead: {
        key: 'bead',
        label: detailLabels.bead,
        image: FEATURE_HUB.bead,
      },
      adjustment: {
        key: 'adjustment',
        label: detailLabels.adjustment,
        image: FEATURE_HUB.adjustment,
      },
    }),
    [detailLabels, heroAlt],
  );

  const activeItem = focusKey ? focusItems[focusKey] : null;

  const openFocus = useCallback((key: FeatureFocusKey) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setStageExiting(false);
    setFocusKey(key);
    hubRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

  const closeFocus = useCallback(() => {
    setStageExiting(true);
    closeTimerRef.current = setTimeout(() => {
      setFocusKey(null);
      setStageExiting(false);
      closeTimerRef.current = null;
    }, STAGE_TRANSITION_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const hubHidden = focusKey !== null;

  return (
    <FeaturesHubContext.Provider value={{ openFocus }}>
      <div
        ref={hubRef}
        className={cn(
          'relative mt-12 w-full lg:mt-14',
          hubHidden
            ? 'min-h-[20rem] sm:min-h-[22rem] lg:min-h-[24rem] xl:min-h-[26rem]'
            : 'min-h-[28rem] lg:min-h-[36rem] xl:min-h-[38rem]',
        )}
      >
        <div
          className={cn(
            'transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none',
            hubHidden ? 'pointer-events-none scale-[0.98] opacity-0' : 'scale-100 opacity-100',
          )}
          aria-hidden={hubHidden}
        >
          <div
            data-scroll-stagger
            className="mx-auto flex max-w-[440px] flex-col gap-10 lg:hidden"
          >
            {MOBILE_ORDER.map((key) =>
              key === 'hero' ? (
                <div key={key} data-scroll-stagger-item>
                  <FeatureHero label={heroAlt} image={FEATURE_HUB.hero} />
                </div>
              ) : (
                <div key={key} data-scroll-stagger-item>
                  <FeatureDetailCard
                    featureKey={key}
                    label={detailLabels[key]}
                    image={FEATURE_HUB[key]}
                    frameClassName={DETAIL_GRID[key].frameClass}
                    imageClassName={DETAIL_GRID[key].imageClass}
                    crop={DETAIL_GRID[key].crop}
                  />
                </div>
              ),
            )}
          </div>

          <div
            data-scroll-stagger
            className="hidden min-h-[36rem] w-full lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-stretch lg:gap-x-6 xl:min-h-[38rem] xl:gap-x-8 2xl:gap-x-12"
          >
            <div className="flex h-full min-h-[36rem] flex-col items-start justify-between gap-y-16 self-stretch py-5 xl:min-h-[38rem] xl:items-end xl:gap-y-20 xl:py-6 2xl:pr-6">
              {(['lettering', 'bead'] as const).map((key) => (
                <div key={key} data-scroll-stagger-item>
                  <FeatureDetailCard
                    featureKey={key}
                    label={detailLabels[key]}
                    image={FEATURE_HUB[key]}
                    frameClassName={DETAIL_GRID[key].frameClass}
                    imageClassName={DETAIL_GRID[key].imageClass}
                    crop={DETAIL_GRID[key].crop}
                    align="start"
                  />
                </div>
              ))}
            </div>

            <div
              data-scroll-stagger-item
              className="flex shrink-0 items-center justify-center self-center px-2 xl:px-4"
            >
              <FeatureHero label={heroAlt} image={FEATURE_HUB.hero} />
            </div>

            <div className="flex h-full min-h-[36rem] flex-col items-end justify-between gap-y-16 self-stretch py-5 xl:min-h-[38rem] xl:items-start xl:gap-y-20 xl:py-6 2xl:pl-6">
              {(['endTip', 'adjustment'] as const).map((key) => (
                <div key={key} data-scroll-stagger-item>
                  <FeatureDetailCard
                    featureKey={key}
                    label={detailLabels[key]}
                    image={FEATURE_HUB[key]}
                    frameClassName={DETAIL_GRID[key].frameClass}
                    imageClassName={DETAIL_GRID[key].imageClass}
                    crop={DETAIL_GRID[key].crop}
                    align="end"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {activeItem ? (
          <div className="absolute inset-0 flex items-center">
            <FeatureFocusStage
              item={activeItem}
              exiting={stageExiting}
              onClose={closeFocus}
            />
          </div>
        ) : null}
      </div>
    </FeaturesHubContext.Provider>
  );
}
