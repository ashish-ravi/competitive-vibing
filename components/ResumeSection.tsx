import Link from 'next/link';
import { Chevron } from '@/components/ChevronLink';
import { DifficultyBadge } from '@/components/DifficultyBadge';
import { VerdictBadge } from '@/components/VerdictBadge';
import { topicLabel } from '@/lib/stats';
import { formatRelativeTime } from '@/lib/utils';
import type { ResumeItem } from '@/lib/stats';

/** Dashboard strip: unfinished problems + the suggested next one. */
export function ResumeSection({ items }: { items: ResumeItem[] }) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="resume-heading">
      <h2 id="resume-heading" className="text-[22px] font-semibold tracking-title">
        Pick up where you left off
      </h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
        {items.map((item) => (
          <li key={`${item.kind}-${item.slug}`}>
            <Link
              href={`/problems/${item.slug}`}
              className="tile-interactive group flex h-full items-center gap-4 p-5"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium text-muted-foreground">
                  {item.kind === 'continue' ? 'Continue' : 'Up next'}
                  {item.attemptedAt && <> · {formatRelativeTime(item.attemptedAt)}</>}
                </span>
                <span className="mt-1 block truncate text-[17px] font-semibold tracking-title">
                  {item.title}
                </span>
                <span className="mt-2 flex items-center gap-2 text-[13px] text-muted-foreground">
                  {item.kind === 'continue' && item.verdict ? (
                    <VerdictBadge verdict={item.verdict} className="shrink-0 whitespace-nowrap" />
                  ) : (
                    <DifficultyBadge difficulty={item.difficulty} />
                  )}
                  <span className="truncate">{topicLabel(item.topic)}</span>
                </span>
              </span>
              <Chevron className="h-5 w-5 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-primary" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
