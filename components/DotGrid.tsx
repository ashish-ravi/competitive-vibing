'use client';

import { useEffect, useRef } from 'react';

/**
 * Site-wide backdrop: the brand dot grid with a violet glow at the top,
 * fading out down the viewport. Fixed layer behind everything; drifts
 * slightly against scroll (parallax) unless reduced motion is set.
 */
export function DotGrid() {
  const dotsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = dotsRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `translate3d(0, ${window.scrollY * -0.12}px, 0)`;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* top brand glow */}
      <div
        className="absolute inset-x-0 top-[-20%] h-[60vh]"
        style={{
          background:
            'radial-gradient(60% 100% at 50% 0%, hsl(var(--primary) / 0.09) 0%, hsl(var(--glow) / 0.05) 45%, transparent 75%)',
        }}
      />
      {/* dot grid, faded toward the bottom of the viewport */}
      <div
        ref={dotsRef}
        className="absolute inset-x-0 top-[-15vh] h-[150vh] will-change-transform"
        style={{
          backgroundImage: 'radial-gradient(hsl(var(--border)) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage:
            'linear-gradient(to bottom, black 0%, black 35%, hsl(0 0% 0% / 0.35) 65%, transparent 95%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, black 0%, black 35%, hsl(0 0% 0% / 0.35) 65%, transparent 95%)',
        }}
      />
    </div>
  );
}
