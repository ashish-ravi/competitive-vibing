import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DifficultyBadge } from '@/components/DifficultyBadge';
import type { PublicProblem } from '@/lib/db';

export function ProblemCard({ problem }: { problem: PublicProblem }) {
  return (
    <Link href={`/problems/${problem.slug}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
      <Card className="h-full min-h-[44px] transition-colors hover:border-primary/50 active:bg-accent">
        <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
          <CardTitle className="text-base">{problem.title}</CardTitle>
          <DifficultyBadge difficulty={problem.difficulty} />
        </CardHeader>
        <CardContent className="flex flex-wrap gap-1.5">
          {problem.topics.map((topic) => (
            <Badge key={topic} variant="secondary" className="font-normal">
              {topic}
            </Badge>
          ))}
        </CardContent>
      </Card>
    </Link>
  );
}
