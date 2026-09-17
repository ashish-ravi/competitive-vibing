import { ActivityCalendar } from '@/components/ActivityCalendar';
import { ChevronLink } from '@/components/ChevronLink';
import { UserAvatar } from '@/components/UserAvatar';
import { cn } from '@/lib/utils';
import type { LeaderboardRow, UserStats } from '@/lib/stats';

const DIFFICULTY_BAR: Record<string, string> = {
  easy: 'bg-ease',
  medium: 'bg-grind',
  hard: 'bg-boss',
};

function Tile({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn('rounded-2xl bg-card p-5', className)}>{children}</section>;
}

function TileTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[15px] font-semibold">{children}</h2>;
}

/** Desktop right rail: level, calendar, difficulty progress, badges, top five. */
export function ProgressRail({
  stats,
  leaderboard = [],
  currentUserId,
  solvedDays = [],
}: {
  stats: UserStats;
  leaderboard?: LeaderboardRow[];
  currentUserId?: string;
  solvedDays?: string[];
}) {
  const pct = Math.round((stats.intoLevel / stats.forNext) * 100);

  return (
    <aside className="hidden w-[300px] shrink-0 xl:block">
      <div className="sticky top-[4.5rem] space-y-4">
        <Tile>
          <div className="flex items-baseline justify-between">
            <p className="text-[22px] font-semibold tracking-title">Level {stats.level}</p>
            <p className="text-[13px] text-muted-foreground">
              {stats.forNext - stats.intoLevel} XP to level {stats.level + 1}
            </p>
          </div>
          <div
            className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progress to next level"
          >
            <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <dd className="text-[28px] font-semibold leading-none tabular-nums tracking-title">
                {stats.streak}
              </dd>
              <dt className="mt-1.5 text-[13px] text-muted-foreground">
                day{stats.streak === 1 ? '' : 's'} in a row
              </dt>
            </div>
            <div>
              <dd className="text-[28px] font-semibold leading-none tabular-nums tracking-title">
                {stats.solvedCount}
              </dd>
              <dt className="mt-1.5 text-[13px] text-muted-foreground">solved</dt>
            </div>
          </dl>
          <div className="mt-5 border-t border-border pt-4">
            <ActivityCalendar solvedDays={solvedDays} />
          </div>
        </Tile>

        <Tile>
          <TileTitle>Progress</TileTitle>
          <ul className="mt-3 space-y-3">
            {stats.byDifficulty.map((d) => (
              <li key={d.difficulty} className="flex items-center gap-3">
                <span className="w-16 text-[13px] capitalize text-muted-foreground">{d.difficulty}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn('h-full rounded-full', DIFFICULTY_BAR[d.difficulty])}
                    style={{ width: `${d.total ? (d.solved / d.total) * 100 : 0}%` }}
                  />
                </div>
                <span className="w-14 text-right text-[13px] tabular-nums text-muted-foreground">
                  {d.solved}/{d.total}
                </span>
              </li>
            ))}
          </ul>
          <ChevronLink href="/profile" className="mt-1 min-h-[36px] text-[14px]">
            Full profile
          </ChevronLink>
        </Tile>

        <Tile>
          <TileTitle>Badges</TileTitle>
          <div className="mt-3 flex flex-wrap gap-2">
            {stats.badges.map((b) => (
              <span
                key={b.id}
                title={`${b.name} — ${b.description}`}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl text-lg',
                  b.earned ? 'bg-secondary' : 'bg-secondary/50 opacity-35 grayscale'
                )}
              >
                {b.icon}
              </span>
            ))}
          </div>
        </Tile>

        <Tile>
          <TileTitle>Leaderboard</TileTitle>
          {leaderboard.length === 0 ? (
            <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
              Nobody is on the board yet. Join it from your profile.
            </p>
          ) : (
            <ol className="mt-2">
              {leaderboard.map((row) => {
                const isYou = row.userId === currentUserId;
                return (
                  <li
                    key={row.userId}
                    className={cn(
                      '-mx-2 flex items-center gap-3 rounded-lg px-2 py-1.5',
                      isYou && 'bg-primary/[0.07]'
                    )}
                  >
                    <span className="w-4 text-center text-[13px] tabular-nums text-muted-foreground">
                      {row.rank}
                    </span>
                    <UserAvatar name={row.name} image={row.avatarUrl} size={24} />
                    <span className="min-w-0 flex-1 truncate text-[14px] font-medium">
                      {row.name}
                      {isYou && <span className="ml-1 font-normal text-muted-foreground">(you)</span>}
                    </span>
                    <span className="text-[13px] tabular-nums text-muted-foreground">{row.xp} XP</span>
                  </li>
                );
              })}
            </ol>
          )}
          <ChevronLink href="/leaderboard" className="mt-1 min-h-[36px] text-[14px]">
            Full leaderboard
          </ChevronLink>
        </Tile>
      </div>
    </aside>
  );
}
