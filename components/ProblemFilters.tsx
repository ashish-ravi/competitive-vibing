'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { cn } from '@/lib/utils';

const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      // min-h/w keeps 44px touch targets on mobile
      className={cn(
        'min-h-[44px] whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-input bg-background text-foreground hover:bg-accent'
      )}
    >
      {children}
    </button>
  );
}

export function ProblemFilters({ topics }: { topics: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeDifficulty = searchParams.get('difficulty');
  const activeTopic = searchParams.get('topic');

  const setParam = useCallback(
    (key: 'difficulty' | 'topic', value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null) params.delete(key);
      else params.set(key, value);
      router.replace(params.size ? `/?${params.toString()}` : '/');
    },
    [router, searchParams]
  );

  return (
    <div className="space-y-2">
      <div className="flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
        {DIFFICULTIES.map((d) => (
          <Chip
            key={d}
            active={activeDifficulty === d}
            onClick={() => setParam('difficulty', activeDifficulty === d ? null : d)}
          >
            <span className="capitalize">{d}</span>
          </Chip>
        ))}
      </div>
      {topics.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
          {topics.map((t) => (
            <Chip
              key={t}
              active={activeTopic === t}
              onClick={() => setParam('topic', activeTopic === t ? null : t)}
            >
              {t}
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
}
