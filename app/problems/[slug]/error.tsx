'use client';

import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function ProblemError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-5 py-20 text-center">
      <h2 className="text-[28px] font-semibold tracking-display">This problem didn’t load</h2>
      <p className="text-[17px] leading-relaxed text-muted-foreground">
        This is usually temporary. Try again in a moment.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Link href="/" className={cn(buttonVariants({ variant: 'secondary' }))}>
          Back to library
        </Link>
      </div>
    </div>
  );
}
