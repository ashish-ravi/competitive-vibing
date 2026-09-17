import Link from 'next/link';
import { auth } from '@/lib/auth';
import { signInAction } from '@/app/actions';
import { listProblems } from '@/lib/problems';
import {
  getLeaderboard,
  getProblemStatuses,
  getResumeItems,
  getSolveDays,
  getUserStats,
  topicLabel,
} from '@/lib/stats';
import { LandingSpecimen } from '@/components/LandingSpecimen';
import { ProblemBrowser } from '@/components/ProblemBrowser';
import { ProgressRail } from '@/components/ProgressRail';
import { ResumeSection } from '@/components/ResumeSection';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

const FACTS: { lead: string; rest: string }[] = [
  { lead: '150 problems', rest: 'from the Blind 75 and NeetCode 150 canon, written fresh.' },
  { lead: 'Rubric-scored', rest: 'on correctness, edge cases, complexity, and clarity.' },
  { lead: 'Follow-up questions', rest: 'that adjust your score, the way a real interview does.' },
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: { topic?: string; difficulty?: string; from?: string };
}) {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="mx-auto max-w-5xl pb-20 pt-8 md:pt-16">
        <section className="grid gap-12 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:gap-16">
          <div className="max-w-2xl">
            <h1 className="font-display text-[40px] font-bold leading-[1.1] tracking-tight md:text-[52px] md:leading-[1.06]">
              Explain the algorithm. Get an interviewer’s verdict.
            </h1>
            <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-muted-foreground">
              Describe your approach in plain English. Competitive Vibing scores it for
              correctness, edge cases, and complexity, then asks the follow-up questions a real
              interviewer would. No code, no editor.
            </p>
            <form action={signInAction} className="mt-8">
              <Button size="lg" type="submit" className="w-full sm:w-auto sm:min-w-[240px]">
                Continue with Google
              </Button>
            </form>
            <p className="mt-3 text-[13px] text-muted-foreground">
              Uses your Google name and photo to save your progress. Nothing else is collected.
            </p>
          </div>
          <LandingSpecimen />
        </section>

        <ul className="mt-16 grid gap-6 border-t pt-8 sm:grid-cols-3">
          {FACTS.map((fact) => (
            <li key={fact.lead} className="text-[15px] leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">{fact.lead}</span> {fact.rest}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const [problems, statuses, stats, resumeItems, leaderboard, solvedDays] = await Promise.all([
    listProblems(),
    getProblemStatuses(session.user.id),
    getUserStats(session.user.id),
    getResumeItems(session.user.id),
    getLeaderboard(5),
    getSolveDays(session.user.id),
  ]);

  const firstName = session.user.name?.split(' ')[0] ?? 'you';
  const topic = searchParams.topic;
  const topicProgress = topic ? stats.topics.find((t) => t.topic === topic) : undefined;
  // Back link mirrors where the user came from (explore roadmap vs library grid).
  const backLink =
    searchParams.from === 'explore'
      ? { href: '/explore', label: '← explore' }
      : { href: '/', label: '← all topics' };

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-5">
        {topic ? (
          // Topic page: focused header, no greeting/resume noise.
          <div className="pb-1">
            <Link
              href={backLink.href}
              className="font-mono text-xs text-primary underline-offset-4 hover:underline"
            >
              {backLink.label}
            </Link>
            <h1 className="prompt-heading mt-2 font-display text-2xl font-bold tracking-tight">
              {topicLabel(topic)}
            </h1>
            {topicProgress && (
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {topicProgress.solved}/{topicProgress.total} solved
                {topicProgress.attempted > 0 && <> · {topicProgress.attempted} in progress</>}
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-3 pb-2">
              <div>
                <h1 className="prompt-heading font-display text-2xl font-bold tracking-tight">
                  {stats.streak > 0 ? `day ${stats.streak} of the streak, ${firstName}` : `pick a fight, ${firstName}`}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground xl:hidden">
                  {stats.solvedCount} solved · level {stats.level} ·{' '}
                  <span className="font-mono">{stats.xp} xp</span>
                </p>
              </div>
            </div>
            <ResumeSection items={resumeItems} />
          </>
        )}
        <ProblemBrowser problems={problems} statuses={statuses} />
      </div>
      <ProgressRail
        stats={stats}
        leaderboard={leaderboard}
        currentUserId={session.user.id}
        solvedDays={solvedDays}
      />
    </div>
  );
}
