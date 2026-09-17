import Link from 'next/link';
import { Chevron } from '@/components/ChevronLink';
import { cn } from '@/lib/utils';

/**
 * Display-size page title in the Apple idiom: one large semibold line,
 * an optional secondary sentence beneath, an optional back link above.
 */
export function PageHeader({
  title,
  description,
  back,
  aside,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  back?: { href: string; label: string };
  /** Right-aligned control (e.g. a toggle) on wide screens. */
  aside?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn('flex flex-wrap items-end justify-between gap-x-6 gap-y-4', className)}>
      <div className="min-w-0 max-w-2xl">
        {back && (
          <Link
            href={back.href}
            className="-ml-1 inline-flex min-h-[36px] items-center gap-0.5 text-[15px] text-primary hover:underline"
          >
            <Chevron direction="left" className="h-[1em] w-[1em]" />
            {back.label}
          </Link>
        )}
        <h1 className="text-[32px] font-semibold leading-[1.1] tracking-display md:text-[40px]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-[17px] leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      {aside}
    </header>
  );
}
