'use client';

import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function ProblemError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <h2 className="text-xl font-semibold">Couldn&apos;t load this problem</h2>
      <p className="text-sm text-muted-foreground">This is usually temporary.</p>
      <div className="flex gap-2">
        <Button onClick={reset}>Try again</Button>
        <Link href="/" className={cn(buttonVariants({ variant: 'outline' }))}>
          Back to problems
        </Link>
      </div>
    </div>
  );
}
