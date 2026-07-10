'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Monthly activity calendar: a dot marks days with at least one SOLVE
 * (correct verdict) — attempts or plain logins don't count. Today is the
 * filled circle. Dates are UTC to match streak accounting.
 */
export function ActivityCalendar({ solvedDays }: { solvedDays: string[] }) {
  const solved = useMemo(() => new Set(solvedDays), [solvedDays]);
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const [view, setView] = useState({ y: now.getUTCFullYear(), m: now.getUTCMonth() });

  const atCurrentMonth = view.y === now.getUTCFullYear() && view.m === now.getUTCMonth();
  const first = new Date(Date.UTC(view.y, view.m, 1));
  const startDow = first.getUTCDay();
  const daysInMonth = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate();
  const monthLabel = first.toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

  function shift(delta: number) {
    setView(({ y, m }) => {
      const d = new Date(Date.UTC(y, m + delta, 1));
      return { y: d.getUTCFullYear(), m: d.getUTCMonth() };
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs font-medium">{monthLabel}</p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => shift(-1)}
            aria-label="Previous month"
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => shift(1)}
            disabled={atCurrentMonth}
            aria-label="Next month"
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
          >
            ›
          </button>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-7 gap-y-0.5 text-center">
        {DOW.map((d, i) => (
          <span key={i} className="font-mono text-[10px] text-muted-foreground/70">
            {d}
          </span>
        ))}
        {Array.from({ length: startDow }).map((_, i) => (
          <span key={`blank-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${view.y}-${pad(view.m + 1)}-${pad(day)}`;
          const isToday = dateStr === todayStr;
          const isSolved = solved.has(dateStr);
          return (
            <span key={day} className="flex h-8 flex-col items-center justify-center gap-0.5">
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full font-mono text-[11px] tabular-nums',
                  isToday
                    ? 'bg-primary font-semibold text-primary-foreground'
                    : isSolved
                      ? 'font-semibold text-ease'
                      : 'text-muted-foreground'
                )}
                title={isSolved ? `Solved on ${dateStr}` : dateStr}
              >
                {day}
              </span>
              <span
                className={cn('h-1 w-1 rounded-full', isSolved ? 'bg-ease' : 'bg-transparent')}
                aria-hidden
              />
            </span>
          );
        })}
      </div>
    </div>
  );
}
