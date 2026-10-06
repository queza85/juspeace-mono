'use client';

import { useGSAP } from '@gsap/react';
import { ensureGsapPlugins, gsap } from '@/lib/motion/gsap-client';
import { prefersReducedMotion } from '@/lib/motion/prefers-reduced-motion';

function isInView(element: HTMLElement, startRatio: number): boolean {
  const rect = element.getBoundingClientRect();
  return rect.top < window.innerHeight * startRatio && rect.bottom > 0;
}

/** Sets up scroll-triggered reveals for `[data-scroll-reveal]` and `[data-scroll-stagger]`. */
export function LandingScrollMotion() {
  useGSAP(() => {
    ensureGsapPlugins();

    if (prefersReducedMotion()) return;

    const reveals = gsap.utils.toArray<HTMLElement>('[data-scroll-reveal]');

    reveals.forEach((element) => {
      if (isInView(element, 0.88)) {
        gsap.set(element, { opacity: 1, y: 0 });
        return;
      }

      const delay = Number.parseFloat(element.dataset.scrollDelay ?? '0');

      gsap.set(element, { opacity: 0, y: 48 });

      gsap.to(element, {
        opacity: 1,
        y: 0,
        duration: 0.95,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 88%',
          once: true,
        },
      });
    });

    const staggerGroups = gsap.utils.toArray<HTMLElement>('[data-scroll-stagger]');

    staggerGroups.forEach((group) => {
      const items = group.querySelectorAll<HTMLElement>('[data-scroll-stagger-item]');
      if (items.length === 0) return;

      if (isInView(group, 0.85)) {
        gsap.set(items, { opacity: 1, y: 0 });
        return;
      }

      gsap.set(items, { opacity: 0, y: 36 });

      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 0.85,
        stagger: 0.14,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: group,
          start: 'top 85%',
          once: true,
        },
      });
    });
  }, []);

  return null;
}
