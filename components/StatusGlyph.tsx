import { cn } from '@/lib/utils';
import type { ProblemStatus } from '@/lib/stats';

/**
 * Problem state as a shape, not just a color: filled check for solved,
 * half-filled circle for attempted, empty ring for untouched.
 */
export function StatusGlyph({
  status,
  className,
}: {
  status: ProblemStatus | undefined;
  className?: string;
}) {
  const size = cn('h-[22px] w-[22px] shrink-0', className);
  if (status?.status === 'solved') {
    return (
      <svg className={cn(size, 'text-ease')} viewBox="0 0 24 24" fill="currentColor" aria-label="Solved">
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1.3 14.3-3.9-3.9 1.5-1.5 2.4 2.4 5.5-5.5 1.5 1.5-7 7Z" />
      </svg>
    );
  }
  if (status?.status === 'attempted') {
    return (
      <svg className={cn(size, 'text-grind')} viewBox="0 0 24 24" fill="none" aria-label="Attempted">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M12 3a9 9 0 0 1 0 18V3Z" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg className={cn(size, 'text-border')} viewBox="0 0 24 24" fill="none" aria-label="Not attempted">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
