'use client';

import { useGSAP } from '@gsap/react';
import { useRef } from 'react';
import { ensureGsapPlugins, gsap } from '@/lib/motion/gsap-client';
import { prefersReducedMotion } from '@/lib/motion/prefers-reduced-motion';

interface HeroScrollHintProps {
  label: string;
}

/** Figma `[ Scroll ]` cue under the marquee — idle motion only. */
export function HeroScrollHint({ label }: HeroScrollHintProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      ensureGsapPlugins();
      const root = rootRef.current;
      if (!root) return;

      const cluster = root.querySelector('[data-scroll-cluster]');
      const brackets = root.querySelectorAll('[data-scroll-bracket]');
      const letters = root.querySelectorAll('[data-scroll-letter]');
      const rail = root.querySelector('[data-scroll-rail]');
      const bead = root.querySelector('[data-scroll-bead]');
      const tip = root.querySelector('[data-scroll-tip]');

      if (prefersReducedMotion()) {
        gsap.set([cluster, brackets, letters, rail, bead, tip], {
          opacity: 1,
          y: 0,
          x: 0,
          scaleY: 1,
        });
        return;
      }

      gsap.set(cluster, { opacity: 0, y: 14 });
      gsap.set(brackets, { opacity: 0 });
      gsap.set(letters, { opacity: 0, y: 8 });
      gsap.set(rail, { scaleY: 0, transformOrigin: 'top center' });
      gsap.set(bead, { opacity: 0, y: 0 });
      gsap.set(tip, { opacity: 0, y: -4 });

      gsap
        .timeline({ delay: 1.15, defaults: { ease: 'power3.out' } })
        .to(cluster, { opacity: 1, y: 0, duration: 0.5 })
        .to(brackets, { opacity: 1, duration: 0.35, stagger: 0.08 }, '-=0.2')
        .to(
          letters,
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.04 },
          '-=0.25',
        )
        .to(rail, { scaleY: 1, duration: 0.45 }, '-=0.1')
        .to(bead, { opacity: 1, duration: 0.25 }, '-=0.2')
        .to(tip, { opacity: 0.85, y: 0, duration: 0.35 }, '-=0.1');

      gsap.to(brackets, {
        x: (i) => (i === 0 ? -3 : 3),
        duration: 1.6,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: 2,
      });

      if (bead) {
        gsap.fromTo(
          bead,
          { y: 0, opacity: 1 },
          {
            y: 28,
            opacity: 0.15,
            duration: 1.45,
            ease: 'power1.inOut',
            repeat: -1,
            delay: 2.1,
          },
        );
      }

      if (tip) {
        gsap.to(tip, {
          y: 4,
          duration: 1.1,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: 2.2,
        });
      }
    },
    { scope: rootRef },
  );

  const handleClick = () => {
    const next = document.querySelector<HTMLElement>('#story');
    if (!next) return;
    next.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  const letters = Array.from(label);

  return (
    <div
      ref={rootRef}
      className="relative z-10 mx-auto w-full max-w-[1920px] px-5 pb-8 sm:px-8 lg:px-[75px] lg:pb-10"
    >
      <button
        type="button"
        data-scroll-cluster
        onClick={handleClick}
        aria-label={label}
        className="group mx-auto mt-6 flex cursor-pointer flex-col items-center gap-2 border-0 bg-transparent p-0 text-white lg:mt-8"
      >
        <p className="flex items-center gap-1.5 font-mono text-[14px] leading-none tracking-[0.12em] sm:text-[16px] lg:text-[18px]">
          <span data-scroll-bracket className="inline-block opacity-80">
            [
          </span>
          <span className="inline-flex gap-[0.05em]">
            {letters.map((char, index) => (
              <span
                key={`${char}-${index}`}
                data-scroll-letter
                className="inline-block transition-opacity duration-300 group-hover:opacity-70"
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </span>
          <span data-scroll-bracket className="inline-block opacity-80">
            ]
          </span>
        </p>

        <span
          className="relative flex h-11 w-5 flex-col items-center"
          aria-hidden
        >
          <span
            data-scroll-rail
            className="absolute top-0 h-10 w-px bg-gradient-to-b from-white via-white/70 to-transparent"
          />
          <span
            data-scroll-bead
            className="absolute top-0 size-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.85)]"
          />
          <span
            data-scroll-tip
            className="absolute bottom-0 h-0 w-0 border-x-[4px] border-t-[6px] border-x-transparent border-t-white/80"
          />
        </span>
      </button>
    </div>
  );
}
