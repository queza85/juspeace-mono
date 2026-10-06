'use client';

import { useGSAP } from '@gsap/react';
import { useRef } from 'react';
import { ensureGsapPlugins, gsap } from '@/lib/motion/gsap-client';
import { prefersReducedMotion } from '@/lib/motion/prefers-reduced-motion';

interface HeroAnimatedCopyProps {
  titleLine1: string;
  titleLine2: string;
  description: string;
  buyNow: string;
  exploreCollection: string;
}

export function HeroAnimatedCopy({
  titleLine1,
  titleLine2,
  description,
  buyNow,
  exploreCollection,
}: HeroAnimatedCopyProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      ensureGsapPlugins();
      const root = rootRef.current;
      if (!root) return;

      const titleLines = root.querySelectorAll('[data-hero-line]');
      const descriptionEl = root.querySelector('[data-hero-description]');
      const ctaItems = root.querySelectorAll('[data-hero-cta]');

      if (prefersReducedMotion()) {
        gsap.set([titleLines, descriptionEl, ctaItems], {
          opacity: 1,
          y: 0,
          x: 0,
          clipPath: 'inset(0% 0% 0% 0%)',
        });
        return;
      }

      gsap.set(titleLines, {
        opacity: 0,
        y: 56,
        clipPath: 'inset(100% 0% 0% 0%)',
      });
      gsap.set(descriptionEl, { opacity: 0, y: 28, x: 24 });
      gsap.set(ctaItems, { opacity: 0, y: 20 });

      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .to(titleLines, {
          opacity: 1,
          y: 0,
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1,
          stagger: 0.18,
        })
        .to(
          descriptionEl,
          { opacity: 1, y: 0, x: 0, duration: 0.85 },
          '-=0.55',
        )
        .to(
          ctaItems,
          { opacity: 1, y: 0, duration: 0.65, stagger: 0.12 },
          '-=0.45',
        );
    },
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      className="jp-hero-copy-row flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-16"
    >
      <h1 className="jp-hero-title -mt-8 shrink-0 sm:-mt-10 lg:-mt-10 xl:-mt-12">
        <span
          data-hero-line
          className="-mb-[0.16em] block overflow-hidden pb-[0.16em]"
        >
          <span className="jp-hero-title-line">{titleLine1}</span>
        </span>
        <span
          data-hero-line
          className="-mb-[0.16em] block overflow-hidden pb-[0.16em]"
        >
          <span className="jp-hero-title-line">{titleLine2}</span>
        </span>
      </h1>

      <div className="jp-hero-copy-side flex w-full max-w-[433px] flex-col lg:w-[433px] lg:shrink-0">
        <p
          data-hero-description
          className="jp-hero-description text-left"
        >
          {(() => {
            let wordIndex = 0;
            return description.split(/(\s+)/).map((token, index) => {
              if (/^\s+$/.test(token)) {
                return <span key={`s-${index}`}>{token}</span>;
              }
              const i = wordIndex++;
              return (
                <span
                  key={`w-${index}`}
                  className="jp-hero-word"
                  style={{ ['--i' as string]: i }}
                >
                  {token}
                </span>
              );
            });
          })()}
        </p>
        <div className="mt-[52px] flex flex-wrap items-center gap-8">
          <a
            data-hero-cta
            href="#collection"
            className="jp-cta-primary h-12 min-w-[140px] bg-white px-6 font-mono text-[16px] leading-none font-normal tracking-normal text-black"
          >
            {buyNow}
          </a>
          <a
            data-hero-cta
            href="#collection"
            className="jp-cta-link pb-0.5 font-mono text-[16px] leading-none font-normal tracking-normal text-white underline-offset-[5px]"
          >
            {exploreCollection}
          </a>
        </div>
      </div>
    </div>
  );
}
