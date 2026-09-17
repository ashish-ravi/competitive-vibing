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

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('font-display text-[15px] font-bold lowercase tracking-tight', className)}>
      competitive&nbsp;vibing
    </span>
  );
}
