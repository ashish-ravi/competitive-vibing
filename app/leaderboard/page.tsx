import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getLeaderboard, getLeaderboardOptIn, levelFromXp } from '@/lib/stats';
import { LeaderboardToggle } from '@/components/LeaderboardToggle';
import { PageHeader } from '@/components/PageHeader';
import { UserAvatar } from '@/components/UserAvatar';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

/** Top three ranks get a filled marker; everyone else a plain number. */
function RankMarker({ rank }: { rank: number }) {
  const top = rank <= 3;
  return (
    <span
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[14px] font-semibold tabular-nums',
        top ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
      )}
    >
      {rank}
    </span>
  );
}

export default async function LeaderboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/');

  const [rows, optedIn] = await Promise.all([
    getLeaderboard(),
    getLeaderboardOptIn(session.user.id),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        title="Leaderboard"
        description="Ranked by XP. Only people who opt in are listed."
        aside={<LeaderboardToggle optedIn={optedIn} />}
      />

      <div className="overflow-hidden rounded-2xl bg-card">
        {rows.length === 0 && (
          <p className="px-6 py-12 text-center text-[15px] leading-relaxed text-muted-foreground">
            Nobody is on the board yet. Turn on the switch above to take the first spot.
          </p>
        )}
        <ol>
          {rows.map((row, i) => {
            const isYou = row.userId === session.user.id;
            return (
              <li
                key={row.userId}
                className={cn(
                  'flex min-h-[64px] items-center gap-4 px-5 py-3',
                  i > 0 && 'border-t border-border',
                  isYou && 'bg-primary/[0.06]'
                )}
              >
                <RankMarker rank={row.rank} />
                <UserAvatar name={row.name} image={row.avatarUrl} size={40} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[17px] font-medium tracking-title">
                    {row.name}
                    {isYou && <span className="ml-1.5 text-[14px] font-normal text-muted-foreground">(you)</span>}
                  </span>
                  <span className="block text-[13px] text-muted-foreground">
                    Level {levelFromXp(row.xp).level} · {row.solved} solved
                  </span>
                </span>
                <span className="text-[17px] font-semibold tabular-nums tracking-title">
                  {row.xp}
                  <span className="ml-1 text-[13px] font-normal text-muted-foreground">XP</span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
