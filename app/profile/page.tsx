import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getLeaderboardOptIn, getUserStats } from '@/lib/stats';
import { Chevron } from '@/components/ChevronLink';
import { DeleteAccount } from '@/components/DeleteAccount';
import { LeaderboardToggle } from '@/components/LeaderboardToggle';
import { UserAvatar } from '@/components/UserAvatar';
import { VerdictBadge } from '@/components/VerdictBadge';
import { cn, formatRelativeTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const DIFFICULTY_BAR: Record<string, string> = {
  easy: 'bg-ease',
  medium: 'bg-grind',
  hard: 'bg-boss',
};

function Tile({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-2xl bg-card p-5 md:p-6', className)}>
      {title && <h2 className="text-[22px] font-semibold tracking-title">{title}</h2>}
      {children}
    </section>
  );
}

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect('/');

  const [stats, optedIn] = await Promise.all([
    getUserStats(session.user.id),
    getLeaderboardOptIn(session.user.id),
  ]);

  const earned = stats.badges.filter((b) => b.earned);
  const pct = Math.round((stats.intoLevel / stats.forNext) * 100);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Identity */}
      <header className="flex flex-col items-center pt-4 text-center">
        <UserAvatar name={session.user.name} image={session.user.image} size={88} />
        <h1 className="mt-4 text-[32px] font-semibold leading-tight tracking-display md:text-[40px]">
          {session.user.name ?? 'Anonymous'}
        </h1>
        <p className="mt-1 text-[15px] text-muted-foreground">{session.user.email}</p>
      </header>

      {/* Level */}
      <Tile>
        <div className="flex items-baseline justify-between">
          <p className="text-[22px] font-semibold tracking-title">Level {stats.level}</p>
          <p className="text-[14px] tabular-nums text-muted-foreground">
            {stats.forNext - stats.intoLevel} XP to level {stats.level + 1}
          </p>
        </div>
        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-secondary"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progress to next level"
        >
          <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
          {[
            { label: stats.streak === 1 ? 'day in a row' : 'days in a row', value: stats.streak },
            { label: 'solved', value: stats.solvedCount },
            { label: 'evaluations', value: stats.totalEvals },
            { label: 'XP total', value: stats.xp },
          ].map((tile) => (
            <div key={tile.label}>
              <dd className="text-[32px] font-semibold leading-none tabular-nums tracking-display">
                {tile.value}
              </dd>
              <dt className="mt-1.5 text-[14px] text-muted-foreground">{tile.label}</dt>
            </div>
          ))}
        </dl>
        <div className="mt-6 border-t border-border pt-4">
          <LeaderboardToggle optedIn={optedIn} />
          <p className="mt-1 text-[13px] text-muted-foreground">
            Opt in to appear in the public ranking with your name, photo and XP.
          </p>
        </div>
      </Tile>

      {/* Difficulty + topic progress */}
      <Tile title="Progress">
        <ul className="mt-4 space-y-3">
          {stats.byDifficulty.map((d) => (
            <li key={d.difficulty} className="flex items-center gap-4">
              <span className="w-16 text-[15px] capitalize text-muted-foreground">{d.difficulty}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn('h-full rounded-full', DIFFICULTY_BAR[d.difficulty])}
                  style={{ width: `${d.total ? (d.solved / d.total) * 100 : 0}%` }}
                />
              </div>
              <span className="w-14 text-right text-[15px] tabular-nums text-muted-foreground">
                {d.solved}/{d.total}
              </span>
            </li>
          ))}
        </ul>

        <h3 className="mt-8 text-[15px] font-semibold">By topic</h3>
        <ul className="mt-2 -mx-2 grid sm:grid-cols-2 sm:gap-x-4">
          {stats.topics.map((t) => (
            <li key={t.topic}>
              <Link
                href={`/?topic=${encodeURIComponent(t.topic)}`}
                className="group flex min-h-[44px] items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
              >
                <span className="w-32 truncate text-[14px]">{t.label}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn('h-full rounded-full', t.total && t.solved >= t.total ? 'bg-ease' : 'bg-primary')}
                    style={{ width: `${t.total ? (t.solved / t.total) * 100 : 0}%` }}
                  />
                </div>
                <span className="w-10 text-right text-[13px] tabular-nums text-muted-foreground">
                  {t.solved}/{t.total}
                </span>
                <Chevron className="h-4 w-4 text-muted-foreground/60 group-hover:text-primary" />
              </Link>
            </li>
          ))}
        </ul>
      </Tile>

      {/* Badges */}
      <Tile title={`Badges · ${earned.length} of ${stats.badges.length}`}>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {stats.badges.map((badge) => (
            <li
              key={badge.id}
              className={cn(
                'rounded-xl bg-secondary/60 p-4',
                !badge.earned && 'opacity-45 grayscale'
              )}
              title={badge.description}
            >
              <span className="text-[26px] leading-none" aria-hidden>
                {badge.icon}
              </span>
              <p className="mt-2.5 text-[15px] font-semibold">{badge.name}</p>
              <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">
                {badge.description}
              </p>
            </li>
          ))}
        </ul>
      </Tile>

      {/* Recent */}
      <Tile title="Recent">
        {stats.recent.length === 0 ? (
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            Nothing yet.{' '}
            <Link href="/" className="text-primary hover:underline">
              Pick a problem
            </Link>{' '}
            and explain your first approach.
          </p>
        ) : (
          <ul className="mt-2">
            {stats.recent.map((r, i) => {
              const inner = (
                <>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[17px] font-medium tracking-title">
                      {r.problemTitle}
                    </span>
                    <span className="text-[13px] text-muted-foreground">
                      {formatRelativeTime(r.createdAt)}
                    </span>
                  </span>
                  <span className="text-[15px] tabular-nums text-muted-foreground">{r.score}</span>
                  <VerdictBadge verdict={r.verdict} />
                </>
              );
              return (
                <li key={i} className={cn(i > 0 && 'border-t border-border')}>
                  {r.problemSlug ? (
                    <Link
                      href={`/problems/${r.problemSlug}`}
                      className="group -mx-2 flex min-h-[56px] items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
                    >
                      {inner}
                      <Chevron className="h-4 w-4 text-muted-foreground/60 group-hover:text-primary" />
                    </Link>
                  ) : (
                    <div className="flex min-h-[56px] items-center gap-3 py-2.5">{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Tile>

      {/* Account */}
      <Tile title="Account">
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
          Signed in with Google as {session.user.email}. Deleting your account removes your
          progress and every evaluation.
        </p>
        <div className="mt-3">
          <DeleteAccount />
        </div>
      </Tile>
    </div>
  );
}
