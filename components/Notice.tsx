import { cn } from '@/lib/utils';

type Tone = 'error' | 'warning' | 'info';

const TONE: Record<Tone, { icon: string; className: string }> = {
  error: { icon: 'text-boss', className: 'bg-boss/[0.08]' },
  warning: { icon: 'text-grind', className: 'bg-grind/[0.08]' },
  info: { icon: 'text-primary', className: 'bg-primary/[0.08]' },
};

/**
 * Inline notice that lives in the interface, not in an alert. The tone is
 * carried by an icon as well as color; the text is always full-contrast.
 */
export function Notice({
  tone = 'info',
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('flex gap-3 rounded-xl px-4 py-3 text-[15px] leading-relaxed', TONE[tone].className, className)}
    >
      <svg
        className={cn('mt-0.5 h-5 w-5 shrink-0', TONE[tone].icon)}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        {tone === 'info' ? (
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 5.2a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6ZM13.2 17h-2.4v-6h2.4v6Z" />
        ) : (
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1.2 5h2.4v7h-2.4V7Zm1.2 10.6a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6Z" />
        )}
      </svg>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
