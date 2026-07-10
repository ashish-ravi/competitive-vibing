import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getLeaderboard, getLeaderboardOptIn, levelFromXp } from '@/lib/stats';
import { LeaderboardToggle } from '@/components/LeaderboardToggle';
import { UserAvatar } from '@/components/UserAvatar';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const MEDALS = ['🥇', '🥈', '🥉'];

export default async function LeaderboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/');

  const [rows, optedIn] = await Promise.all([
    getLeaderboard(),
    getLeaderboardOptIn(session.user.id),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-4 pb-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="prompt-heading font-display text-2xl font-bold tracking-tight">
            leaderboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ranked by XP. Opt-in only — join when you&apos;re ready to be seen.
          </p>
        </div>
        <LeaderboardToggle optedIn={optedIn} />
      </div>

      <Card>
        <CardContent className="divide-y pt-2">
          {rows.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nobody&apos;s on the board yet. Flip the switch above and claim rank #1.
            </p>
          )}
          {rows.map((row) => {
            const isYou = row.userId === session.user.id;
            return (
              <div
                key={row.userId}
                className={cn(
                  'flex min-h-[52px] items-center gap-3 py-2.5',
                  isYou && '-mx-4 rounded-md bg-primary/5 px-4'
                )}
              >
                <span className="w-8 text-center font-mono text-sm tabular-nums text-muted-foreground">
                  {MEDALS[row.rank - 1] ?? row.rank}
                </span>
                <UserAvatar name={row.name} image={row.avatarUrl} size={32} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {row.name}
                    {isYou && <span className="ml-1.5 text-xs text-primary">(you)</span>}
                  </span>
                  <span className="block font-mono text-xs text-muted-foreground">
                    lvl {levelFromXp(row.xp).level} · {row.solved} solved
                  </span>
                </span>
                <span className="font-mono text-sm font-semibold tabular-nums">{row.xp} xp</span>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
