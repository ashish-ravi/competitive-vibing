import Link from 'next/link';
import { DifficultyBadge } from '@/components/DifficultyBadge';
import { HistoryItem } from '@/components/HistoryItem';
import type { Difficulty } from '@/lib/db';
import type { HistoryItem as HistoryItemData } from '@/lib/history';
import { cn } from '@/lib/utils';

interface ProblemGroup {
  problemId: string;
  problem: { slug: string; title: string; difficulty: string } | null;
  items: HistoryItemData[];
}

/** Group a page of evaluations by problem, preserving recency order. */
function groupByProblem(items: HistoryItemData[]): ProblemGroup[] {
  const groups = new Map<string, ProblemGroup>();
  for (const item of items) {
    let group = groups.get(item.problem_id);
    if (!group) {
      group = { problemId: item.problem_id, problem: item.problem, items: [] };
      groups.set(item.problem_id, group);
    }
    group.items.push(item);
  }
  return [...groups.values()];
}

export function HistoryList({ items }: { items: HistoryItemData[] }) {
  const groups = groupByProblem(items);

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <section key={group.problemId} className="overflow-hidden rounded-2xl bg-card">
          <div className="flex items-center justify-between gap-3 px-5 pb-2 pt-5">
            <h2 className="min-w-0 truncate text-[17px] font-semibold tracking-title">
              {group.problem ? (
                <Link href={`/problems/${group.problem.slug}`} className="hover:underline">
                  {group.problem.title}
                </Link>
              ) : (
                'Removed problem'
              )}
            </h2>
            {group.problem && (
              <DifficultyBadge difficulty={group.problem.difficulty as Difficulty} />
            )}
          </div>
          <ul>
            {group.items.map((item, i) => (
              <li key={item.id} className={cn(i > 0 && 'border-t border-border')}>
                <HistoryItem item={item} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
