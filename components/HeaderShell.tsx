'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/** Sticky header chrome that gains elevation once the page scrolls. */
export function HeaderShell({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b backdrop-blur transition-[background-color,border-color,box-shadow] duration-300',
        scrolled
          ? 'border-border bg-background/95 shadow-[0_4px_24px_-12px_hsl(var(--primary)/0.25)]'
          : 'border-transparent bg-background/70'
      )}
    >
      {children}
    </header>
  );
}
