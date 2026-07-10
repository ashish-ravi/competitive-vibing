import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { UserStats } from '@/lib/stats';

const DIFFICULTY_BAR: Record<string, string> = {
  easy: 'bg-ease',
  medium: 'bg-grind',
  hard: 'bg-boss',
};

/** Compact progress panel for the desktop right rail (library page). */
export function ProgressRail({ stats }: { stats: UserStats }) {
  return (
    <aside className="hidden w-72 shrink-0 xl:block">
      <div className="sticky top-[4.5rem] space-y-3">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-baseline justify-between">
            <span className="rounded-full bg-primary/15 px-2.5 py-0.5 font-mono text-xs font-semibold text-primary">
              lvl {stats.level}
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {stats.intoLevel}/{stats.forNext} xp
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-glow"
              style={{ width: `${(stats.intoLevel / stats.forNext) * 100}%` }}
            />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-md bg-muted/60 px-2.5 py-2">
              <p className="font-mono text-lg font-semibold tabular-nums leading-none">
                {stats.streak}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">day streak</p>
            </div>
            <div className="rounded-md bg-muted/60 px-2.5 py-2">
              <p className="font-mono text-lg font-semibold tabular-nums leading-none">
                {stats.solvedCount}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">solved</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <p className="prompt-heading font-display text-sm font-bold lowercase">progress</p>
          <div className="mt-3 space-y-2.5">
            {stats.byDifficulty.map((d) => (
              <div key={d.difficulty} className="flex items-center gap-2.5">
                <span className="w-14 font-mono text-[11px] capitalize text-muted-foreground">
                  {d.difficulty}
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn('h-full rounded-full', DIFFICULTY_BAR[d.difficulty])}
                    style={{ width: `${d.total ? (d.solved / d.total) * 100 : 0}%` }}
                  />
                </div>
                <span className="w-12 text-right font-mono text-[11px] tabular-nums text-muted-foreground">
                  {d.solved}/{d.total}
                </span>
              </div>
            ))}
          </div>
          <Link
            href="/profile"
            className="mt-3 inline-block font-mono text-xs text-primary underline-offset-4 hover:underline"
          >
            full profile →
          </Link>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <p className="prompt-heading font-display text-sm font-bold lowercase">badges</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {stats.badges.map((b) => (
              <span
                key={b.id}
                title={`${b.name} — ${b.description}`}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-md border text-base',
                  b.earned ? 'border-primary/40 bg-primary/5' : 'opacity-35 grayscale'
                )}
              >
                {b.icon}
              </span>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
