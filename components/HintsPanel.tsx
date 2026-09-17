'use client';

import { useState } from 'react';
import { Chevron } from '@/components/ChevronLink';
import { cn } from '@/lib/utils';

/** Progressive hint reveal: each hint stays hidden until deliberately opened, in order. */
export function HintsPanel({ hints }: { hints: string[] }) {
  const [revealed, setRevealed] = useState(0);

  if (hints.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-2xl bg-card" aria-labelledby="hints-heading">
      <div className="px-5 pb-1 pt-5">
        <h2 id="hints-heading" className="text-[17px] font-semibold tracking-title">
          Hints
        </h2>
        <p className="text-[13px] text-muted-foreground">
          Open one at a time, and only when you’re stuck.
        </p>
      </div>
      <ol>
        {hints.map((hint, i) => {
          const isRevealed = i < revealed;
          const isNext = i === revealed;
          return (
            <li key={i} className={cn(i > 0 && 'border-t border-border')}>
              {isRevealed ? (
                <div className="flex gap-3 px-5 py-3.5">
                  <span className="text-[15px] font-semibold tabular-nums text-muted-foreground">{i + 1}</span>
                  <p className="animate-rise text-[15px] leading-relaxed">{hint}</p>
                </div>
              ) : (
                <button
                  onClick={() => isNext && setRevealed(revealed + 1)}
                  disabled={!isNext}
                  aria-disabled={!isNext}
                  className={cn(
                    'flex min-h-[48px] w-full items-center gap-3 px-5 text-left text-[15px] transition-colors',
                    isNext
                      ? 'text-primary hover:bg-black/[0.025] dark:hover:bg-white/[0.04]'
                      : 'cursor-default text-muted-foreground/60'
                  )}
                >
                  <span className="font-semibold tabular-nums">{i + 1}</span>
                  <span className="flex-1">{isNext ? `Show hint ${i + 1}` : `Hint ${i + 1}`}</span>
                  {isNext && <Chevron className="h-4 w-4" />}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
