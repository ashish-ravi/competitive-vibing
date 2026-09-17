'use client';

import { Button } from '@/components/ui/button';

export default function ExploreError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-5 py-20 text-center">
      <h2 className="text-[28px] font-semibold tracking-display">The roadmap didn’t load</h2>
      <p className="text-[17px] leading-relaxed text-muted-foreground">
        This is usually temporary. Try again in a moment.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
