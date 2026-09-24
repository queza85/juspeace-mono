'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { ensureGsapPlugins, gsap } from '@/lib/motion/gsap-client';
import { prefersReducedMotion } from '@/lib/motion/prefers-reduced-motion';

interface HeroBackgroundMotionProps {
  src: string;
}

export function HeroBackgroundMotion({ src }: HeroBackgroundMotionProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      ensureGsapPlugins();
      const image = imageRef.current;
      if (!image) return;

      if (prefersReducedMotion()) {
        gsap.set(image, { scale: 1, opacity: 1 });
        return;
      }

      gsap.set(image, { scale: 1.08, opacity: 0 });
      gsap.to(image, {
        scale: 1,
        opacity: 1,
        duration: 1.6,
        ease: 'power2.out',
      });
    },
    { scope: wrapRef },
  );

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <div ref={imageRef} className="absolute inset-0 will-change-transform">
        <Image
          src={src}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-fill"
        />
      </div>
      <div className="absolute inset-0 bg-jp-hero-overlay" aria-hidden />
    </div>
  );
}
