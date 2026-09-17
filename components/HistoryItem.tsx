import Link from 'next/link';
import { Chevron } from '@/components/ChevronLink';
import { VerdictBadge } from '@/components/VerdictBadge';
import { formatRelativeTime } from '@/lib/utils';
import type { HistoryItem as HistoryItemData } from '@/lib/history';

export function HistoryItem({ item }: { item: HistoryItemData }) {
  const extras: string[] = [];
  if (item.interview_status === 'complete') extras.push('Interviewed');
  if (item.counterexample_status === 'verified') extras.push('Counterexample');

  return (
    <Link
      href={`/history/${item.id}`}
      className="group flex min-h-[56px] items-center gap-4 px-5 py-3 transition-colors hover:bg-black/[0.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring dark:hover:bg-white/[0.04]"
    >
      <span className="w-10 text-[17px] font-semibold tabular-nums tracking-title">
        {item.final_score ?? item.score}
      </span>
      <VerdictBadge verdict={item.final_verdict ?? item.verdict} />
      <span className="min-w-0 flex-1 truncate text-[13px] text-muted-foreground">
        {extras.join(' · ')}
      </span>
      <span className="shrink-0 text-[13px] text-muted-foreground">
        {formatRelativeTime(item.created_at)}
      </span>
      <Chevron className="h-4 w-4 shrink-0 text-muted-foreground/60 group-hover:text-primary" />
    </Link>
  );
}
