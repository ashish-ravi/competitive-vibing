import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getUserStats } from '@/lib/stats';
import { buildRoadmap } from '@/lib/roadmap';
import { Roadmap } from '@/components/Roadmap';

export const dynamic = 'force-dynamic';

export default async function ExplorePage() {
  const session = await auth();
  if (!session?.user) redirect('/');

  const stats = await getUserStats(session.user.id);
  const { stages, currentLevel } = buildRoadmap(stats.topics);

  const totalSolved = stages.reduce((n, s) => n + s.items.reduce((m, t) => m + t.solved, 0), 0);
  const totalProblems = stages.reduce((n, s) => n + s.items.reduce((m, t) => m + t.total, 0), 0);

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16">
      <div>
        <h1 className="prompt-heading font-display text-2xl font-bold tracking-tight">explore</h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          The path from zero to interview-ready. Start at the top, clear a stage, move down —
          every level builds on the techniques of the one before it.
        </p>
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          {totalSolved}/{totalProblems} solved across the path
        </p>
      </div>
      <Roadmap stages={stages} currentLevel={currentLevel} />
    </div>
  );
}
