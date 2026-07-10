import Link from 'next/link';
import { DifficultyBadge } from '@/components/DifficultyBadge';
import { VerdictBadge } from '@/components/VerdictBadge';
import { formatRelativeTime } from '@/lib/utils';
import type { ResumeItem } from '@/lib/stats';

/** Dashboard strip: unfinished problems + the suggested next one. */
export function ResumeSection({ items }: { items: ResumeItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-2">
      <h2 className="prompt-heading font-display text-sm font-bold lowercase tracking-tight">
        resume
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Link
            key={`${item.kind}-${item.slug}`}
            href={`/problems/${item.slug}`}
            className="group relative overflow-hidden rounded-lg border bg-card p-4 transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                {item.kind === 'continue' ? 'continue where you left off' : 'up next'}
              </span>
              {item.kind === 'continue' && item.verdict ? (
                <VerdictBadge verdict={item.verdict} />
              ) : (
                <DifficultyBadge difficulty={item.difficulty} />
              )}
            </div>
            <p className="mt-2 truncate font-display text-[15px] font-bold">{item.title}</p>
            <p className="mt-0.5 flex items-center justify-between font-mono text-xs text-muted-foreground">
              <span>#{item.topic}</span>
              {item.attemptedAt && <span>{formatRelativeTime(item.attemptedAt)}</span>}
            </p>
            <span
              className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-primary to-glow transition-transform duration-300 group-hover:scale-x-100"
              aria-hidden
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
