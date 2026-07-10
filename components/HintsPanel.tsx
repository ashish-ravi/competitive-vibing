'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

/** Progressive hint reveal: each hint stays hidden until deliberately opened. */
export function HintsPanel({ hints }: { hints: string[] }) {
  const [revealed, setRevealed] = useState(0);

  if (hints.length === 0) return null;

  return (
    <div className="rounded-lg border bg-card">
      <p className="border-b px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-muted-foreground">
        hints — spend them wisely
      </p>
      <ol className="divide-y">
        {hints.map((hint, i) => {
          const isRevealed = i < revealed;
          const isNext = i === revealed;
          return (
            <li key={i} className="px-4 py-3">
              {isRevealed ? (
                <p className="animate-fade-up text-sm leading-relaxed">
                  <span className="mr-2 font-mono text-xs text-primary">{i + 1}/</span>
                  {hint}
                </p>
              ) : (
                <button
                  onClick={() => isNext && setRevealed(revealed + 1)}
                  disabled={!isNext}
                  className={cn(
                    'flex min-h-[32px] w-full items-center gap-2 text-left font-mono text-xs',
                    isNext
                      ? 'text-primary underline-offset-4 hover:underline'
                      : 'cursor-not-allowed text-muted-foreground/50'
                  )}
                >
                  <span>{i + 1}/</span>
                  {isNext ? `reveal hint ${i + 1}` : `hint ${i + 1} — reveal ${i} first`}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
