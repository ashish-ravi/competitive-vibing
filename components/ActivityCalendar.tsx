'use client';

import { useMemo, useState } from 'react';
import { Chevron } from '@/components/ChevronLink';
import { cn } from '@/lib/utils';

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Monthly activity calendar. A day is filled green when at least one
 * explanation was graded correct on it — attempts and plain logins don't
 * count. Today is outlined in the accent. Dates are UTC to match streaks.
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
        <p className="text-[15px] font-semibold">{monthLabel}</p>
        <div className="-mr-2 flex">
          <button
            type="button"
            onClick={() => shift(-1)}
            aria-label="Previous month"
            className="flex h-8 w-8 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/[0.08]"
          >
            <Chevron direction="left" className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => shift(1)}
            disabled={atCurrentMonth}
            aria-label="Next month"
            className="flex h-8 w-8 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/[0.08] disabled:text-muted-foreground/50 disabled:hover:bg-transparent"
          >
            <Chevron className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-y-1 text-center">
        {DOW.map((d, i) => (
          <span key={i} className="text-[11px] font-medium text-muted-foreground">
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
            <span key={day} className="flex h-8 items-center justify-center">
              <span
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-[13px] tabular-nums',
                  isSolved
                    ? 'bg-ease font-semibold text-white'
                    : isToday
                      ? 'font-semibold text-primary ring-[1.5px] ring-primary'
                      : 'text-foreground/80'
                )}
                title={isSolved ? `Solved on ${dateStr}` : dateStr}
              >
                {day}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
