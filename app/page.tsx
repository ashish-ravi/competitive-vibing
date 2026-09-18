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
import { PageHeader } from '@/components/PageHeader';
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
            <h1 className="text-[40px] font-semibold leading-[1.1] tracking-display md:text-[52px] md:leading-[1.06]">
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

        <ul className="mt-16 grid gap-6 border-t border-border pt-8 sm:grid-cols-3">
          {FACTS.map((fact) => (
            <li key={fact.lead} className="text-[15px] leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">{fact.lead}</span> {fact.rest}
            </li>
          ))}
        </ul>

        <footer className="mt-16 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-muted-foreground">
          <Link href="/privacy" className="min-h-[44px] leading-[44px] hover:text-foreground">
            Privacy Policy
          </Link>
          <Link href="/terms" className="min-h-[44px] leading-[44px] hover:text-foreground">
            Terms of Service
          </Link>
        </footer>
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

  const firstName = session.user.name?.split(' ')[0] ?? 'there';
  const topic = searchParams.topic;
  const topicProgress = topic ? stats.topics.find((t) => t.topic === topic) : undefined;
  // Back link mirrors where the user came from (explore roadmap vs library grid).
  const back =
    searchParams.from === 'explore'
      ? { href: '/explore', label: 'Explore' }
      : { href: '/', label: 'All topics' };

  const summary =
    stats.streak > 0
      ? `Day ${stats.streak} of your streak. ${stats.solvedCount} solved, level ${stats.level}.`
      : stats.solvedCount > 0
        ? `${stats.solvedCount} solved, level ${stats.level}. Start a new streak today.`
        : 'Pick a topic and explain your first approach.';

  return (
    <div className="flex gap-8">
      <div className="min-w-0 flex-1 space-y-8">
        {topic ? (
          <PageHeader
            back={back}
            title={topicLabel(topic)}
            description={
              topicProgress
                ? `${topicProgress.solved} of ${topicProgress.total} solved${
                    topicProgress.attempted > 0 ? `, ${topicProgress.attempted} in progress` : ''
                  }.`
                : undefined
            }
          />
        ) : (
          <>
            <PageHeader title={`Hello, ${firstName}.`} description={summary} />
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
