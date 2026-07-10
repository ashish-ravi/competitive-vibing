'use client';

import { useTransition } from 'react';
import { toggleLeaderboardAction } from '@/app/actions';
import { cn } from '@/lib/utils';

export function LeaderboardToggle({ optedIn }: { optedIn: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={optedIn}
      disabled={pending}
      onClick={() => startTransition(() => toggleLeaderboardAction(!optedIn))}
      className={cn(
        'inline-flex min-h-[44px] items-center gap-2.5 rounded-md border px-3.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60',
        optedIn ? 'border-primary/50 bg-primary/10' : 'bg-card hover:bg-accent'
      )}
    >
      <span
        className={cn(
          'relative h-5 w-9 rounded-full transition-colors',
          optedIn ? 'bg-primary' : 'bg-muted-foreground/30'
        )}
        aria-hidden
      >
        <span
          className={cn(
            'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all',
            optedIn ? 'left-[18px]' : 'left-0.5'
          )}
        />
      </span>
      {pending ? 'Saving…' : optedIn ? 'On the leaderboard' : 'Join the leaderboard'}
    </button>
  );
}
