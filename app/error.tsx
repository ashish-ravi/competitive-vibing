'use client';

import { Button } from '@/components/ui/button';

export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <h2 className="text-xl font-semibold">Something went sideways</h2>
      <p className="text-sm text-muted-foreground">
        We couldn&apos;t load the problem list. This is usually temporary.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
