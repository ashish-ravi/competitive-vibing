import Link from 'next/link';
import { cn } from '@/lib/utils';

/** The "Learn more ›" pattern: an accent text link with a trailing chevron. */
export function ChevronLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex min-h-[44px] items-center gap-0.5 text-[15px] text-primary hover:underline focus-visible:outline-none focus-visible:underline',
        className
      )}
    >
      {children}
      <Chevron className="h-[1em] w-[1em]" />
    </Link>
  );
}

export function Chevron({ className, direction = 'right' }: { className?: string; direction?: 'right' | 'left' }) {
  return (
    <svg
      className={cn(className, direction === 'left' && 'rotate-180')}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m9.5 6 6 6-6 6" />
    </svg>
  );
}
