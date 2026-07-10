import Image from 'next/image';
import { cn } from '@/lib/utils';

export function LogoMark({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <Image
      src="/logo.png"
      alt=""
      width={size}
      height={size}
      priority
      className={cn('shrink-0 rounded-md', className)}
    />
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
