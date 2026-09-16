'use client';

import Image from 'next/image';
import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
} from 'react';

import {
  brandStoryPeekCount,
  type BrandStorySlideItem,
} from '@/lib/api/brand-story';
import { useT } from '@/lib/i18n/locale-context';
import {
  SCATTER_DURATION,
  SCATTER_EASE,
  SETTLE_DURATION,
  SETTLE_EASE,
  paperBackground,
  scatterRotation,
  scatterShadow,
  scatterY,
  stackSlotMetrics,
  type SlideDirection,
} from '@/lib/motion/brand-story-slide-motion';
import { ensureGsapPlugins, gsap } from '@/lib/motion/gsap-client';
import { prefersReducedMotion } from '@/lib/motion/prefers-reduced-motion';

const SLIDE_ASSETS = {
  paperclip: '/papper_click.png',
  koreanHandwriting: '/brand-story/korean-handwriting.png',
  pinkPoster: '/gd-pick-photo.jpg',
  besidePink: '/gd-image-beside-pink.jpg',
  signature: '/brand-story/signature.png',
  loveTogether: '/brand-story/love-together.png',
  changeTogether: '/story/love_together.png',
  thirdSlideOne: '/third-slide-one.png',
  thirdSlideTwo: '/third-slide-two.png',
  arrowLeft: '/brand-story/arrow-left.svg',
  arrowRight: '/brand-story/arrow-right.svg',
} as const;

export const PEEK_X_REM = 1.15;
export const PEEK_Y_REM = 1;

type Translate = (key: string) => string;

function rotateOrder(
  order: BrandStorySlideItem[],
  direction: SlideDirection,
): BrandStorySlideItem[] {
  if (order.length < 2) return order;
  if (direction === 'next') {
    return [...order.slice(1), order[0]];
  }
  return [order[order.length - 1], ...order.slice(0, -1)];
}

function remToPx(rem: number): number {
  if (typeof window === 'undefined') return rem * 16;
  const rootFontSize = Number.parseFloat(
    getComputedStyle(document.documentElement).fontSize,
  );
  return rem * (Number.isFinite(rootFontSize) ? rootFontSize : 16);
}

function slotStyle(depth: number, peekCount: number): CSSProperties {
  return {
    ['--depth' as string]: String(depth),
    zIndex: peekCount + 1 - depth,
  };
}

interface BrandStorySlideDeckProps {
  slides: BrandStorySlideItem[];
}

export function BrandStorySlideDeck({ slides }: BrandStorySlideDeckProps) {
  const t = useT();
  const [order, setOrder] = useState(slides);
  const [isAnimating, setIsAnimating] = useState(false);
  const [liveMessage, setLiveMessage] = useState('');
  const folderRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const peekCount = brandStoryPeekCount(order.length);
  const frontSlide = order[0];

  const announceFront = useCallback(
    (slide: BrandStorySlideItem | undefined) => {
      if (!slide) return;
      setLiveMessage(
        `${t('landing.brandStory.label')}: ${slide.id.replace(/-/g, ' ')}`,
      );
    },
    [t],
  );

  const applyDepthStyles = useCallback(
    (nextOrder: BrandStorySlideItem[]) => {
      const folder = folderRef.current;
      if (!folder) return;
      const papers = folder.querySelectorAll<HTMLElement>(
        '[data-brand-story-paper]',
      );
      papers.forEach((paper) => {
        const id = paper.dataset.slideId;
        const depth = nextOrder.findIndex((slide) => slide.id === id);
        if (depth < 0) return;
        paper.style.setProperty('--depth', String(depth));
        paper.dataset.stackDepth = String(depth);
        paper.style.backgroundColor = paperBackground(depth);
        paper.style.zIndex = String(peekCount + 1 - depth);
        gsap.set(paper, {
          clearProps:
            'x,y,rotation,scale,opacity,transform,boxShadow,width,marginTop,marginLeft,marginRight,backgroundColor',
        });
        paper.style.backgroundColor = paperBackground(depth);
        paper.classList.remove('jp-brand-story-slide-paper--scattering');
      });
    },
    [peekCount],
  );

  const buildNextTimeline = useCallback(
    (
      tl: gsap.core.Timeline,
      paperById: Map<string, HTMLElement>,
      nextOrder: BrandStorySlideItem[],
      peekX: number,
      peekY: number,
      folderWidth: number,
    ) => {
      const outgoingId = order[0]?.id ?? '';

      order.forEach((slide, fromDepth) => {
        const paper = paperById.get(slide.id);
        if (!paper) return;
        const fromMetrics = stackSlotMetrics(
          fromDepth,
          peekCount,
          peekX,
          peekY,
          folderWidth,
        );
        gsap.set(paper, {
          width: fromMetrics.width,
          marginTop: fromMetrics.marginTop,
          marginLeft: fromMetrics.inset,
          marginRight: fromMetrics.inset,
          transformOrigin: 'center center',
        });
        paper.classList.add(
          'jp-brand-story-slide-paper--animating',
          'jp-brand-story-slide-paper--scattering',
        );
      });

      // Phase 1: scatter fan
      order.forEach((slide, fromDepth) => {
        const paper = paperById.get(slide.id);
        if (!paper) return;
        tl.to(
          paper,
          {
            y: scatterY(fromDepth),
            rotation: scatterRotation(fromDepth, 'next'),
            boxShadow: scatterShadow('scatter'),
            duration: SCATTER_DURATION,
            ease: SCATTER_EASE,
            zIndex:
              fromDepth === 0 ? peekCount + 5 : peekCount + 1 - fromDepth,
          },
          0,
        );
      });

      // Phase 2: settle into new stack order
      const settleAt = SCATTER_DURATION - 0.05;
      order.forEach((slide) => {
        const paper = paperById.get(slide.id);
        if (!paper) return;
        const toDepth = nextOrder.findIndex((item) => item.id === slide.id);
        if (toDepth < 0) return;
        const toMetrics = stackSlotMetrics(
          toDepth,
          peekCount,
          peekX,
          peekY,
          folderWidth,
        );
        const isOutgoing = slide.id === outgoingId;

        tl.to(
          paper,
          {
            y: 0,
            rotation: 0,
            width: toMetrics.width,
            marginTop: toMetrics.marginTop,
            marginLeft: toMetrics.inset,
            marginRight: toMetrics.inset,
            backgroundColor: paperBackground(toDepth),
            boxShadow: scatterShadow('flat'),
            duration: SETTLE_DURATION,
            ease: SETTLE_EASE,
            zIndex: peekCount + 1 - toDepth,
          },
          settleAt,
        );

        if (isOutgoing) {
          tl.set(
            paper,
            { zIndex: peekCount + 1 - toDepth },
            settleAt + SETTLE_DURATION * 0.4,
          );
        }
      });
    },
    [order, peekCount],
  );

  const buildPrevTimeline = useCallback(
    (
      tl: gsap.core.Timeline,
      paperById: Map<string, HTMLElement>,
      nextOrder: BrandStorySlideItem[],
      peekX: number,
      peekY: number,
      folderWidth: number,
    ) => {
      const incomingId = nextOrder[0]?.id ?? '';
      const incomingFromDepth = order.length - 1;

      order.forEach((slide, fromDepth) => {
        const paper = paperById.get(slide.id);
        if (!paper) return;
        const fromMetrics = stackSlotMetrics(
          fromDepth,
          peekCount,
          peekX,
          peekY,
          folderWidth,
        );
        gsap.set(paper, {
          width: fromMetrics.width,
          marginTop: fromMetrics.marginTop,
          marginLeft: fromMetrics.inset,
          marginRight: fromMetrics.inset,
          transformOrigin: 'center center',
        });
        paper.classList.add(
          'jp-brand-story-slide-paper--animating',
          'jp-brand-story-slide-paper--scattering',
        );
      });

      // Phase 1: scatter fan (mirrored)
      order.forEach((slide, fromDepth) => {
        const paper = paperById.get(slide.id);
        if (!paper) return;
        const liftY =
          fromDepth === incomingFromDepth
            ? scatterY(0) - 6
            : scatterY(fromDepth);
        tl.to(
          paper,
          {
            y: liftY,
            rotation: scatterRotation(fromDepth, 'prev'),
            boxShadow: scatterShadow('scatter'),
            duration: SCATTER_DURATION,
            ease: SCATTER_EASE,
            zIndex:
              fromDepth === incomingFromDepth
                ? peekCount + 6
                : peekCount + 1 - fromDepth,
          },
          0,
        );
      });

      // Phase 2: settle — incoming rises to front
      const settleAt = SCATTER_DURATION - 0.05;
      order.forEach((slide) => {
        const paper = paperById.get(slide.id);
        if (!paper) return;
        const toDepth = nextOrder.findIndex((item) => item.id === slide.id);
        if (toDepth < 0) return;
        const toMetrics = stackSlotMetrics(
          toDepth,
          peekCount,
          peekX,
          peekY,
          folderWidth,
        );
        const isIncoming = slide.id === incomingId;

        if (isIncoming) {
          // Ensure incoming uses front slot metrics during settle
          tl.to(
            paper,
            {
              y: 0,
              rotation: 0,
              width: toMetrics.width,
              marginTop: toMetrics.marginTop,
              marginLeft: toMetrics.inset,
              marginRight: toMetrics.inset,
              backgroundColor: paperBackground(0),
              boxShadow: scatterShadow('flat'),
              duration: SETTLE_DURATION,
              ease: SETTLE_EASE,
              zIndex: peekCount + 1,
            },
            settleAt,
          );
          return;
        }

        tl.to(
          paper,
          {
            y: 0,
            rotation: 0,
            width: toMetrics.width,
            marginTop: toMetrics.marginTop,
            marginLeft: toMetrics.inset,
            marginRight: toMetrics.inset,
            backgroundColor: paperBackground(toDepth),
            boxShadow: scatterShadow('flat'),
            duration: SETTLE_DURATION,
            ease: SETTLE_EASE,
            zIndex: peekCount + 1 - toDepth,
          },
          settleAt,
        );
      });
    },
    [order, peekCount],
  );

  const restack = useCallback(
    (direction: SlideDirection) => {
      if (isAnimating || order.length < 2) return;

      const nextOrder = rotateOrder(order, direction);

      if (prefersReducedMotion()) {
        setOrder(nextOrder);
        announceFront(nextOrder[0]);
        return;
      }

      const folder = folderRef.current;
      if (!folder) {
        setOrder(nextOrder);
        return;
      }

      ensureGsapPlugins();
      timelineRef.current?.kill();

      const peekX = remToPx(PEEK_X_REM);
      const peekY = remToPx(PEEK_Y_REM);
      const folderWidth = folder.getBoundingClientRect().width;
      const papers = Array.from(
        folder.querySelectorAll<HTMLElement>('[data-brand-story-paper]'),
      );

      const paperById = new Map(
        papers.map((paper) => [paper.dataset.slideId ?? '', paper]),
      );

      setIsAnimating(true);

      const tl = gsap.timeline({
        onComplete: () => {
          papers.forEach((paper) => {
            paper.classList.remove(
              'jp-brand-story-slide-paper--animating',
              'jp-brand-story-slide-paper--scattering',
            );
          });
          setOrder(nextOrder);
          applyDepthStyles(nextOrder);
          announceFront(nextOrder[0]);
          setIsAnimating(false);
          timelineRef.current = null;
        },
      });
      timelineRef.current = tl;

      if (direction === 'next') {
        buildNextTimeline(
          tl,
          paperById,
          nextOrder,
          peekX,
          peekY,
          folderWidth,
        );
      } else {
        buildPrevTimeline(
          tl,
          paperById,
          nextOrder,
          peekX,
          peekY,
          folderWidth,
        );
      }
    },
    [
      announceFront,
      applyDepthStyles,
      buildNextTimeline,
      buildPrevTimeline,
      isAnimating,
      order,
    ],
  );

  return (
    <div className="jp-brand-story-slide-stack">
      <div
        ref={folderRef}
        className="jp-brand-story-slide-folder"
        style={
          {
            ['--peek-x' as string]: `${PEEK_X_REM}rem`,
            ['--peek-y' as string]: `${PEEK_Y_REM}rem`,
            ['--peek-count' as string]: String(peekCount),
          } as CSSProperties
        }
      >
        <Image
          src={SLIDE_ASSETS.paperclip}
          alt=""
          width={828}
          height={1158}
          aria-hidden
          className="jp-brand-story-slide-paperclip"
        />

        <div
          className={`jp-brand-story-slide-deck${isAnimating ? ' jp-brand-story-slide-deck--animating' : ''}`}
        >
        {order.map((slide, depth) => {
          const isFront = depth === 0;
          return (
            <article
              key={slide.id}
              data-brand-story-paper
              data-slide-id={slide.id}
              data-stack-depth={depth}
              className={`jp-brand-story-slide-paper${isFront ? ' jp-brand-story-slide-paper--front' : ' jp-brand-story-slide-paper--peek'}`}
              style={{
                ...slotStyle(depth, peekCount),
                backgroundColor: paperBackground(depth),
              }}
              aria-hidden={!isFront}
            >
              <BrandStorySlideVisual slide={slide} t={t} />

              <div className="jp-brand-story-slide-copy-wrap">
                <BrandStorySlideCopy slide={slide} t={t} />

                {isFront ? (
                  <div className="jp-brand-story-slide-nav">
                    <button
                      type="button"
                      className="jp-brand-story-slide-nav-label"
                      onClick={() => restack('next')}
                      disabled={isAnimating}
                      aria-label={t('landing.brandStory.nextStoryAria')}
                    >
                      [ {t('landing.brandStory.nextStory')} ]
                    </button>
                    <div
                      className="jp-brand-story-slide-nav-arrows"
                      aria-label={t('landing.brandStory.slideNavLabel')}
                    >
                      <button
                        type="button"
                        onClick={() => restack('prev')}
                        disabled={isAnimating}
                        aria-label={t('landing.brandStory.prevStoryAria')}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={SLIDE_ASSETS.arrowLeft}
                          alt=""
                          width={24}
                          height={24}
                          aria-hidden
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => restack('next')}
                        disabled={isAnimating}
                        aria-label={t('landing.brandStory.nextStoryAria')}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={SLIDE_ASSETS.arrowRight}
                          alt=""
                          width={24}
                          height={24}
                          aria-hidden
                        />
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {liveMessage ||
          (frontSlide
            ? `${t('landing.brandStory.label')}: ${frontSlide.id.replace(/-/g, ' ')}`
            : '')}
      </p>
    </div>
  );
}

function BrandStorySlideVisual({
  slide,
  t,
}: {
  slide: BrandStorySlideItem | undefined;
  t: Translate;
}) {
  if (slide?.id === 'change-together') {
    return (
      <div className="jp-brand-story-slide-visual">
        <div className="jp-brand-story-slide-korean">
          <Image
            src={SLIDE_ASSETS.koreanHandwriting}
            alt={t('landing.brandStory.slideKoreanTextAlt')}
            width={850}
            height={317}
            unoptimized
            className="jp-brand-story-slide-korean-img"
          />
        </div>
        <Image
          src={SLIDE_ASSETS.loveTogether}
          alt={t('landing.brandStory.slideLoveTogetherAlt')}
          width={1238}
          height={1550}
          className="jp-brand-story-slide-photo-left jp-brand-story-slide-love"
        />
        <Image
          src={SLIDE_ASSETS.changeTogether}
          alt={t('landing.brandStory.slideChangeTogetherAlt')}
          width={1240}
          height={1544}
          className="jp-brand-story-slide-photo-right jp-brand-story-slide-change"
        />
        <div className="jp-brand-story-slide-sign">
          <Image
            src={SLIDE_ASSETS.signature}
            alt={t('landing.brandStory.slideSignatureAlt')}
            width={736}
            height={1308}
            className="jp-brand-story-slide-sign-img"
          />
        </div>
      </div>
    );
  }

  if (slide?.id === 'story-3') {
    return (
      <div className="jp-brand-story-slide-visual jp-brand-story-slide-visual--story-3">
        <div className="jp-brand-story-slide-korean">
          <Image
            src={SLIDE_ASSETS.koreanHandwriting}
            alt={t('landing.brandStory.slideKoreanTextAlt')}
            width={850}
            height={317}
            unoptimized
            className="jp-brand-story-slide-korean-img"
          />
        </div>
        <Image
          src={SLIDE_ASSETS.thirdSlideOne}
          alt={t('landing.brandStory.slide3FlowerWallAlt')}
          width={1140}
          height={990}
          className="jp-brand-story-slide-photo-left jp-brand-story-slide-third-one h-auto"
        />
        <Image
          src={SLIDE_ASSETS.thirdSlideTwo}
          alt={t('landing.brandStory.slide3EventHallAlt')}
          width={1108}
          height={914}
          className="jp-brand-story-slide-photo-right jp-brand-story-slide-third-two"
        />
        <div className="jp-brand-story-slide-sign">
          <Image
            src={SLIDE_ASSETS.signature}
            alt={t('landing.brandStory.slideSignatureAlt')}
            width={736}
            height={1308}
            className="jp-brand-story-slide-sign-img"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="jp-brand-story-slide-visual jp-brand-story-slide-visual--origin">
      <Image
        src={SLIDE_ASSETS.pinkPoster}
        alt={t('landing.brandStory.slidePinkPosterAlt')}
        width={620}
        height={875}
        className="jp-brand-story-slide-photo-left jp-brand-story-slide-pink h-auto"
      />
      <Image
        src={SLIDE_ASSETS.besidePink}
        alt={t('landing.brandStory.slidePortraitAlt')}
        width={1200}
        height={1511}
        className="jp-brand-story-slide-photo-right jp-brand-story-slide-beside h-auto"
      />
      <div className="jp-brand-story-slide-korean">
        <Image
          src={SLIDE_ASSETS.koreanHandwriting}
          alt={t('landing.brandStory.slideKoreanTextAlt')}
          width={850}
          height={317}
          unoptimized
          className="jp-brand-story-slide-korean-img"
        />
      </div>
      <div className="jp-brand-story-slide-sign">
        <Image
          src={SLIDE_ASSETS.signature}
          alt={t('landing.brandStory.slideSignatureAlt')}
          width={736}
          height={1308}
          className="jp-brand-story-slide-sign-img"
        />
      </div>
    </div>
  );
}

function BrandStorySlideCopy({
  slide,
  t,
}: {
  slide: BrandStorySlideItem | undefined;
  t: Translate;
}) {
  if (slide?.id === 'change-together') {
    return (
      <div className="jp-brand-story-slide-copy">
        <p>
          <span className="jp-brand-story-slide-copy-line">
            {t('landing.brandStory.slideParagraph1Line1')}
          </span>
          <span className="jp-brand-story-slide-copy-line">
            {t('landing.brandStory.slideParagraph1Line2')}
          </span>
          <span className="jp-brand-story-slide-copy-line">
            {t('landing.brandStory.slideParagraph1Lead')}
            <em>{t('landing.brandStory.slideParagraph1Emphasis')}</em>
          </span>
        </p>
        <p>
          <span className="jp-brand-story-slide-copy-line">
            {t('landing.brandStory.slideParagraph2Line1')}
          </span>
          <span className="jp-brand-story-slide-copy-line">
            {t('landing.brandStory.slideParagraph2Lead')}
            <em>{t('landing.brandStory.slideParagraph2Emphasis')}</em>
          </span>
          <span className="jp-brand-story-slide-copy-line">
            {t('landing.brandStory.slideParagraph2Tail')}
          </span>
        </p>
      </div>
    );
  }

  if (slide?.id === 'story-3') {
    return (
      <div className="jp-brand-story-slide-copy">
        <p>
          <span className="jp-brand-story-slide-copy-line">
            {t('landing.brandStory.slide3Paragraph1Line1')}
          </span>
          <span className="jp-brand-story-slide-copy-line">
            {t('landing.brandStory.slide3Paragraph1Line2')}
          </span>
        </p>
        <p>
          <span className="jp-brand-story-slide-copy-line">
            <em>{t('landing.brandStory.slide3Paragraph2')}</em>
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className="jp-brand-story-slide-copy">
      <p>
        <span className="jp-brand-story-slide-copy-line">
          {t('landing.brandStory.slide1Paragraph1Line1')}
        </span>
        <span className="jp-brand-story-slide-copy-line">
          {t('landing.brandStory.slide1Paragraph1Line2')}
        </span>
        <span className="jp-brand-story-slide-copy-line">
          {t('landing.brandStory.slide1Paragraph1Line3')}
        </span>
      </p>
      <p>
        <span className="jp-brand-story-slide-copy-line">
          {t('landing.brandStory.slide1Paragraph2Lead')}
          <em>{t('landing.brandStory.slide1Paragraph2Emphasis')}</em>
          {t('landing.brandStory.slide1Paragraph2Tail')}
        </span>
        <span className="jp-brand-story-slide-copy-line">
          {t('landing.brandStory.slide1Paragraph2Line2Lead')}
          <em>{t('landing.brandStory.slide1Paragraph2Line2Emphasis')}</em>
        </span>
      </p>
    </div>
  );
}
