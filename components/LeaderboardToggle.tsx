'use client';

import { useTransition } from 'react';
import { toggleLeaderboardAction } from '@/app/actions';
import { cn } from '@/lib/utils';

/** A labeled switch in the iOS idiom: label on the left, green when on. */
export function LeaderboardToggle({ optedIn }: { optedIn: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <label
      className={cn(
        'flex min-h-[44px] cursor-pointer items-center gap-3 text-[15px] font-medium',
        pending && 'opacity-60'
      )}
    >
      <span>{pending ? 'Saving…' : 'Show me on the leaderboard'}</span>
      <button
        type="button"
        role="switch"
        aria-checked={optedIn}
        disabled={pending}
        onClick={() => startTransition(() => toggleLeaderboardAction(!optedIn))}
        className={cn(
          'relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          optedIn ? 'bg-[#34c759]' : 'bg-black/[0.16] dark:bg-white/[0.24]'
        )}
      >
        <span
          className={cn(
            'absolute left-0 top-[2px] h-[27px] w-[27px] rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,0.15),0_1px_1px_rgba(0,0,0,0.16)] transition-transform duration-200',
            optedIn ? 'translate-x-[22px]' : 'translate-x-[2px]'
          )}
          aria-hidden
        />
      </button>
    </label>
  );
}
