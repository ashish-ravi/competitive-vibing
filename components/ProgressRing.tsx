import { useId } from 'react';
import { cn } from '@/lib/utils';

interface ProgressRingProps {
  /** 0..1 */
  value: number;
  size?: number;
  className?: string;
}

/** Circular progress with the brand gradient; a check when complete. */
export function ProgressRing({ value, size = 44, className }: ProgressRingProps) {
  const gradientId = useId();
  const stroke = 3.5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, value));
  const complete = clamped >= 1;

  return (
    <span
      className={cn('relative inline-flex shrink-0 items-center justify-center', className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--glow))" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={complete ? 'hsl(var(--ease))' : `url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped)}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <span className="absolute font-mono text-[10px] font-semibold tabular-nums">
        {complete ? (
          <svg className="h-4 w-4 text-ease" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="m5 13 4 4L19 7" />
          </svg>
        ) : (
          `${Math.round(clamped * 100)}%`
        )}
      </span>
    </span>
  );
}
