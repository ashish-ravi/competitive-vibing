import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getUserStats } from '@/lib/stats';
import { buildRoadmap } from '@/lib/roadmap';
import { PageHeader } from '@/components/PageHeader';
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
    <div className="mx-auto max-w-3xl space-y-10">
      <PageHeader
        title="Explore"
        description={
          <>
            The path from zero to interview-ready, one stage at a time. Each level builds on
            the techniques of the one before it. {totalSolved} of {totalProblems} solved so far.
          </>
        }
      />
      <Roadmap stages={stages} currentLevel={currentLevel} />
    </div>
  );
}
