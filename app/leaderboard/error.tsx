'use client';

import { Button } from '@/components/ui/button';

export default function LeaderboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <h2 className="text-xl font-semibold">Couldn&apos;t load the leaderboard</h2>
      <p className="text-sm text-muted-foreground">This is usually temporary.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
