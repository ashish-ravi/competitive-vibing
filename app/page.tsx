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
import { HeroTerminal } from '@/components/HeroTerminal';
import { ProblemBrowser } from '@/components/ProblemBrowser';
import { ProgressRail } from '@/components/ProgressRail';
import { ResumeSection } from '@/components/ResumeSection';
import { Reveal } from '@/components/Reveal';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

const STEPS = [
  {
    title: 'Explain, don’t code',
    body: 'Pick a classic problem and describe your approach in plain English or pseudocode — the part interviews actually grade.',
  },
  {
    title: 'Get a real verdict',
    body: 'Correctness, edge cases, complexity, clarity — scored against a rubric and streamed back in seconds.',
  },
  {
    title: 'Survive the follow-ups',
    body: 'The AI interviewer probes your gaps with follow-up questions, then re-scores you. Flawed idea? Watch it break on a verified counterexample.',
  },
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: { topic?: string; difficulty?: string; from?: string };
}) {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="space-y-16 pb-16 pt-4 md:pt-10">
        <section className="grid items-center gap-10 md:grid-cols-2">
          <div className="space-y-6">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
              interview prep for the thinking part
            </p>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
              Talk your way through the interview.
            </h1>
            <p className="max-w-md text-muted-foreground">
              150 classic problems. No editor, no autocomplete — just you explaining an algorithm
              and an AI interviewer deciding if it holds up.
            </p>
            <form action={signInAction}>
              <Button size="lg" type="submit">
                Sign in with Google — it’s free
              </Button>
            </form>
          </div>
          <HeroTerminal />
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 120}>
              <div className="h-full rounded-lg border bg-card p-5">
                <h2 className="prompt-heading font-display text-base font-bold">{step.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </section>
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
