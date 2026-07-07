import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DifficultyBadge } from '@/components/DifficultyBadge';
import { HistoryItem } from '@/components/HistoryItem';
import type { Difficulty } from '@/lib/db';
import type { HistoryItem as HistoryItemData } from '@/lib/history';

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
    <div className="space-y-3">
      {groups.map((group) => (
        <Card key={group.problemId}>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-base">
              {group.problem ? (
                <Link
                  href={`/problems/${group.problem.slug}`}
                  className="hover:underline underline-offset-4"
                >
                  {group.problem.title}
                </Link>
              ) : (
                'Removed problem'
              )}
            </CardTitle>
            {group.problem && (
              <DifficultyBadge difficulty={group.problem.difficulty as Difficulty} />
            )}
          </CardHeader>
          <CardContent className="divide-y">
            {group.items.map((item) => (
              <HistoryItem key={item.id} item={item} />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
