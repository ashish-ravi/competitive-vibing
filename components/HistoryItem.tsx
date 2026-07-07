import Link from 'next/link';
import { VerdictBadge } from '@/components/VerdictBadge';
import { formatRelativeTime } from '@/lib/utils';
import type { HistoryItem as HistoryItemData } from '@/lib/history';

export function HistoryItem({ item }: { item: HistoryItemData }) {
  return (
    <Link
      href={`/history/${item.id}`}
      className="flex min-h-[44px] items-center justify-between gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex min-w-0 items-center gap-2">
        <VerdictBadge verdict={item.final_verdict ?? item.verdict} />
        <span className="tabular-nums text-sm font-medium">
          {item.final_score ?? item.score}
        </span>
        {item.interview_status === 'complete' && (
          <span
            className="text-xs text-muted-foreground"
            title="Completed the follow-up interview"
          >
            💬 interviewed
          </span>
        )}
        {item.counterexample_status === 'verified' && (
          <span className="text-xs text-muted-foreground" title="Has a verified counterexample">
            💥
          </span>
        )}
      </div>
      <span className="shrink-0 text-xs text-muted-foreground">
        {formatRelativeTime(item.created_at)}
      </span>
    </Link>
  );
}
