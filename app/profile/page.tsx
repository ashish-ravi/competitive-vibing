import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getLeaderboardOptIn, getUserStats } from '@/lib/stats';
import { LeaderboardToggle } from '@/components/LeaderboardToggle';
import { UserAvatar } from '@/components/UserAvatar';
import { VerdictBadge } from '@/components/VerdictBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, formatRelativeTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const DIFFICULTY_BAR: Record<string, string> = {
  easy: 'bg-ease',
  medium: 'bg-grind',
  hard: 'bg-boss',
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect('/');

  const [stats, optedIn] = await Promise.all([
    getUserStats(session.user.id),
    getLeaderboardOptIn(session.user.id),
  ]);

  const earned = stats.badges.filter((b) => b.earned);

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-10">
      {/* Identity + level */}
      <section className="grid-fade flex flex-wrap items-center gap-4 rounded-lg border bg-card p-5">
        <UserAvatar name={session.user.name} image={session.user.image} size={64} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-xl font-bold tracking-tight">
            {session.user.name ?? 'Anonymous'}
          </h1>
          <p className="truncate text-sm text-muted-foreground">{session.user.email}</p>
          <div className="mt-2.5 flex items-center gap-2.5">
            <span className="rounded-full bg-primary/15 px-2.5 py-0.5 font-mono text-xs font-semibold text-primary">
              lvl {stats.level}
            </span>
            <div className="h-1.5 max-w-[180px] flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-glow"
                style={{ width: `${(stats.intoLevel / stats.forNext) * 100}%` }}
              />
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              {stats.intoLevel}/{stats.forNext}
            </span>
          </div>
        </div>
        <LeaderboardToggle optedIn={optedIn} />
      </section>

      {/* Stat tiles */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'streak', value: stats.streak, suffix: stats.streak === 1 ? 'day' : 'days' },
          { label: 'solved', value: stats.solvedCount, suffix: 'problems' },
          { label: 'attempts', value: stats.totalEvals, suffix: 'evaluations' },
          { label: 'xp', value: stats.xp, suffix: `level ${stats.level}` },
        ].map((tile, i) => (
          <div
            key={tile.label}
            className="animate-fade-up rounded-lg border bg-card p-4"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {tile.label}
            </p>
            <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">{tile.value}</p>
            <p className="text-xs text-muted-foreground">{tile.suffix}</p>
          </div>
        ))}
      </section>

      {/* Difficulty progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="prompt-heading font-display text-base">progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats.byDifficulty.map((d) => (
            <div key={d.difficulty} className="flex items-center gap-3">
              <span className="w-16 font-mono text-xs capitalize text-muted-foreground">
                {d.difficulty}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn('h-full rounded-full transition-all', DIFFICULTY_BAR[d.difficulty])}
                  style={{ width: `${d.total ? (d.solved / d.total) * 100 : 0}%` }}
                />
              </div>
              <span className="w-14 text-right font-mono text-xs tabular-nums text-muted-foreground">
                {d.solved}/{d.total}
              </span>
            </div>
          ))}

          <div className="pt-2">
            <p className="mb-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              by topic
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {stats.topics.map((t) => (
                <Link
                  key={t.topic}
                  href={`/?topic=${encodeURIComponent(t.topic)}`}
                  className="group flex items-center gap-2.5 rounded-md px-1.5 py-1 hover:bg-accent"
                >
                  <span className="w-36 truncate text-xs group-hover:text-foreground">
                    {t.label}
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-glow"
                      style={{ width: `${t.total ? (t.solved / t.total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                    {t.solved}/{t.total}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="prompt-heading font-display text-base">
            badges · {earned.length}/{stats.badges.length}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {stats.badges.map((badge) => (
            <div
              key={badge.id}
              className={cn(
                'rounded-md border p-3',
                badge.earned ? 'border-primary/40 bg-primary/5' : 'opacity-45 grayscale'
              )}
              title={badge.description}
            >
              <span className="text-xl" aria-hidden>
                {badge.icon}
              </span>
              <p className="mt-1 text-xs font-semibold">{badge.name}</p>
              <p className="text-[11px] leading-snug text-muted-foreground">{badge.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="prompt-heading font-display text-base">recent</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {stats.recent.length === 0 && (
            <p className="py-4 text-sm text-muted-foreground">
              Nothing yet — <Link href="/" className="text-primary underline-offset-4 hover:underline">pick a problem</Link> and explain your first approach.
            </p>
          )}
          {stats.recent.map((r, i) => (
            <div key={i} className="flex min-h-[44px] items-center justify-between gap-3 py-2.5">
              <span className="min-w-0 flex-1">
                {r.problemSlug ? (
                  <Link
                    href={`/problems/${r.problemSlug}`}
                    className="block truncate text-sm font-medium underline-offset-4 hover:underline"
                  >
                    {r.problemTitle}
                  </Link>
                ) : (
                  <span className="block truncate text-sm">{r.problemTitle}</span>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(r.createdAt)}
                </span>
              </span>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {r.score}
              </span>
              <VerdictBadge verdict={r.verdict} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
