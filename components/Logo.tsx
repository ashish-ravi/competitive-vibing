import { cn } from '@/lib/utils';

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary to-glow font-mono text-sm font-semibold text-white',
        className
      )}
      aria-hidden
    >
      cv
    </span>
  );
}

/** Wordmark with the product's own streaming caret as the brand mark. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('font-display text-[15px] font-bold lowercase tracking-tight', className)}>
      competitive&nbsp;vibing
      <span className="ml-0.5 inline-block h-[0.85em] w-[0.5em] translate-y-[0.12em] animate-caret rounded-[1px] bg-primary" />
    </span>
  );
}
