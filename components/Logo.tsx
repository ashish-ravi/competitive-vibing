import Image from 'next/image';
import { cn } from '@/lib/utils';

export function LogoMark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <Image
      src="/logo.png"
      alt=""
      width={size}
      height={size}
      priority
      className={cn('shrink-0 rounded-[7px]', className)}
    />
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('text-[15px] font-semibold tracking-title', className)}>
      Competitive&nbsp;Vibing
    </span>
  );
}
