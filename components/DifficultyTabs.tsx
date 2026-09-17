'use client';

import { cn } from '@/lib/utils';

export type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard';

const TABS: { value: DifficultyFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

/** Segmented control: neutral track, the selected segment lifts on a white knob. */
export function DifficultyTabs({
  value,
  onChange,
}: {
  value: DifficultyFilter;
  onChange: (value: DifficultyFilter) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Difficulty"
      className="inline-grid h-11 grid-cols-4 rounded-[10px] bg-black/[0.06] p-0.5 dark:bg-white/[0.08] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
    >
      {TABS.map((tab) => {
        const selected = value === tab.value;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.value)}
            className={cn(
              'min-w-[68px] rounded-[8px] px-4 text-[14px] transition-[background-color,box-shadow,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              selected
                ? 'bg-card font-semibold text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.12),0_0_0_0.5px_rgba(0,0,0,0.04)] dark:bg-[#48484a] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.14),0_2px_6px_rgba(0,0,0,0.6)]'
                : 'font-medium text-foreground/80 hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
