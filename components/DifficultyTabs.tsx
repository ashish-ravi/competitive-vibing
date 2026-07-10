'use client';

import { cn } from '@/lib/utils';

export type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard';

const TABS: { value: DifficultyFilter; label: string; activeClass: string }[] = [
  { value: 'all', label: 'All', activeClass: 'bg-primary text-primary-foreground' },
  { value: 'easy', label: 'Easy', activeClass: 'bg-ease text-white' },
  { value: 'medium', label: 'Medium', activeClass: 'bg-grind text-white' },
  { value: 'hard', label: 'Hard', activeClass: 'bg-boss text-white' },
];

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
      className="inline-flex rounded-lg border bg-card p-1"
    >
      {TABS.map((tab) => (
        <button
          key={tab.value}
          role="tab"
          aria-selected={value === tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'min-h-[38px] rounded-md px-4 font-mono text-sm font-medium transition-colors',
            value === tab.value ? tab.activeClass : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
