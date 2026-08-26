'use client';

import { useGSAP } from '@gsap/react';
import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';
import { ensureGsapPlugins, gsap } from '@/lib/motion/gsap-client';
import { prefersReducedMotion } from '@/lib/motion/prefers-reduced-motion';
import { useT } from '@/lib/i18n/locale-context';
import { cn } from '@/lib/utils';

const CAROUSEL_IMAGES = [
  '/marque/juspeace_mar1.png',
  '/marque/juspeace_mar2.png',
  '/marque/juspeace_mr3.png',
  '/marque/juspeace_mar4.png',
  '/marque/juespeace_mar4.png',
  '/marque/juspeace_mar5.jpg',
  '/marque/ju_mar6.png',
  '/marque/mar_7.png',
  '/marque/mar8.png',
] as const;

const CAROUSEL_LABEL_KEYS = [
  'landing.hero.marquee.item1',
  'landing.hero.marquee.item2',
  'landing.hero.marquee.item3',
  'landing.hero.marquee.item4',
  'landing.hero.marquee.item5',
  'landing.hero.marquee.item6',
  'landing.hero.marquee.item7',
  'landing.hero.marquee.item8',
  'landing.hero.marquee.item9',
] as const;

/** Seconds for one full set to drift past — slow editorial pace. */
const LOOP_DURATION_S = 48;

const THUMB_CLASS =
  'relative h-[148px] w-[140px] overflow-hidden rounded-[28px] sm:h-[180px] sm:w-[170px] sm:rounded-[32px] lg:h-[208px] lg:w-[202px] lg:rounded-[38px]';

const SLOT_CLASS =
  'flex w-[140px] shrink-0 flex-col items-center sm:w-[170px] lg:w-[202px]';

/**
 * Slow infinite drift + click spotlight.
 * Two equal track halves → `xPercent: -50` loops seamlessly.
 * Pauses on hover / when a card is selected.
 */
export function HeroMarquee() {
  const t = useT();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const loopTweenRef = useRef<gsap.core.Tween | null>(null);
  const pausedByUserRef = useRef(false);

  const applySpotlight = useCallback((index: number | null) => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = prefersReducedMotion();
    const duration = reduced ? 0 : 0.4;
    const hasFocus = index !== null;

    root.querySelectorAll<HTMLElement>('[data-marquee-image]').forEach((el) => {
      const itemIndex = Number(el.dataset.itemIndex);
      const isActive = index === itemIndex;

      gsap.to(el, {
        scale: isActive ? 1.06 : hasFocus ? 0.96 : 1,
        y: isActive ? -10 : 0,
        opacity: !hasFocus || isActive ? 1 : 0.5,
        duration,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });

    root.querySelectorAll<HTMLElement>('[data-marquee-label]').forEach((el) => {
      const itemIndex = Number(el.dataset.itemIndex);
      const isActive = index === itemIndex;

      gsap.to(el, {
        opacity: isActive ? 1 : 0,
        y: isActive ? 0 : 8,
        duration,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });
  }, []);

  const pauseLoop = useCallback(() => {
    loopTweenRef.current?.pause();
  }, []);

  const resumeLoop = useCallback(() => {
    if (pausedByUserRef.current) return;
    if (prefersReducedMotion()) return;
    loopTweenRef.current?.resume();
  }, []);

  useGSAP(
    () => {
      ensureGsapPlugins();
      const track = trackRef.current;
      if (!track) return;

      const reduced = prefersReducedMotion();

      gsap.set(track, { opacity: 0, y: 24 });
      gsap.to(track, {
        opacity: 1,
        y: 0,
        duration: reduced ? 0 : 0.8,
        delay: reduced ? 0 : 0.55,
        ease: 'power3.out',
      });

      if (reduced) {
        const randomStart = -((Math.random() * 0.4 + 0.05) * 50);
        gsap.set(track, { xPercent: randomStart });
        return;
      }

      const tween = gsap.fromTo(
        track,
        { xPercent: 0 },
        {
          xPercent: -50,
          duration: LOOP_DURATION_S,
          ease: 'none',
          repeat: -1,
        },
      );

      const cardCount = CAROUSEL_IMAGES.length;
      const startCard = Math.floor(Math.random() * cardCount);
      const withinCard = Math.random();
      tween.progress((startCard + withinCard) / cardCount);

      loopTweenRef.current = tween;

      return () => {
        tween.kill();
        loopTweenRef.current = null;
      };
    },
    { scope: rootRef },
  );

  useGSAP(
    () => {
      applySpotlight(activeIndex);
    },
    { scope: rootRef, dependencies: [activeIndex, applySpotlight] },
  );

  const handleSelect = (index: number) => {
    setActiveIndex((prev) => {
      const next = prev === index ? null : index;
      pausedByUserRef.current = next !== null;

      if (next !== null) {
        pauseLoop();
      } else {
        resumeLoop();
      }

      return next;
    });
  };

  const renderSet = (setKey: string, decorative: boolean) =>
    CAROUSEL_IMAGES.map((src, index) => {
      const isActive = activeIndex === index;
      const label = t(CAROUSEL_LABEL_KEYS[index]);

      return (
        <div key={`${setKey}-${src}`} className={SLOT_CLASS}>
          <div className="mb-6 flex h-8 w-full shrink-0 items-end justify-center sm:h-9 lg:mb-8 lg:h-10">
            <p
              data-marquee-label
              data-item-index={index}
              className={cn(
                'pointer-events-none text-center font-mono text-[12px] leading-none whitespace-nowrap text-white opacity-0',
                'drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]',
                'sm:text-[14px] lg:text-[18px]',
              )}
              aria-hidden={!isActive || decorative}
            >
              [ {label} ]
            </p>
          </div>

          <button
            type="button"
            data-marquee-image
            data-item-index={index}
            aria-label={label}
            aria-pressed={isActive}
            aria-hidden={decorative}
            tabIndex={decorative ? -1 : 0}
            onClick={() => handleSelect(index)}
            className={cn(
              THUMB_CLASS,
              'origin-bottom cursor-pointer border-0 bg-neutral-800 p-0 will-change-transform',
              isActive && 'ring-1 ring-white/40',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white',
            )}
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="(max-width: 640px) 140px, (max-width: 1024px) 170px, 202px"
              className="object-cover"
              draggable={false}
            />
          </button>
        </div>
      );
    });

  return (
    <div
      ref={rootRef}
      className="w-full overflow-visible"
      aria-label={t('landing.hero.marquee.ariaLabel')}
      onMouseEnter={pauseLoop}
      onMouseLeave={resumeLoop}
    >
      <div className="overflow-x-clip overflow-y-visible pt-4 pb-4">
        <div
          ref={trackRef}
          className="flex w-max items-end will-change-transform"
        >
          <div className="flex items-end gap-5 pr-5">{renderSet('a', false)}</div>
          <div className="flex items-end gap-5 pr-5" aria-hidden>
            {renderSet('b', true)}
          </div>
        </div>
      </div>
    </div>
  );
}
