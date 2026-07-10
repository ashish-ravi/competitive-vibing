'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DifficultyTabs, type DifficultyFilter } from '@/components/DifficultyTabs';
import { DifficultyBadge } from '@/components/DifficultyBadge';
import { topicLabel, type ProblemStatus } from '@/lib/stats';
import type { ProblemListItem } from '@/lib/db';
import { cn } from '@/lib/utils';

interface ProblemBrowserProps {
  problems: ProblemListItem[];
  statuses: Record<string, ProblemStatus>;
}

function StatusGlyph({ status }: { status: ProblemStatus | undefined }) {
  if (status?.status === 'solved') {
    return (
      <span className="font-mono text-sm font-semibold text-ease" title="Solved">
        ✓
      </span>
    );
  }
  if (status?.status === 'attempted') {
    return (
      <span className="font-mono text-sm font-semibold text-grind" title="Attempted">
        ~
      </span>
    );
  }
  return (
    <span className="font-mono text-sm text-muted-foreground/50" title="Not attempted">
      ·
    </span>
  );
}

export function ProblemBrowser({ problems, statuses }: ProblemBrowserProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');

  const difficulty = (searchParams.get('difficulty') ?? 'all') as DifficultyFilter;
  const topic = searchParams.get('topic');

  function setParams(next: { difficulty?: DifficultyFilter; topic?: string | null }) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.difficulty !== undefined) {
      if (next.difficulty === 'all') params.delete('difficulty');
      else params.set('difficulty', next.difficulty);
    }
    if (next.topic !== undefined) {
      if (next.topic === null) params.delete('topic');
      else params.set('topic', next.topic);
    }
    router.replace(params.size ? `/?${params.toString()}` : '/', { scroll: false });
  }

  const scoped = useMemo(
    () => problems.filter((p) => difficulty === 'all' || p.difficulty === difficulty),
    [problems, difficulty]
  );

  const topics = useMemo(() => {
    const map = new Map<string, { total: number; solved: number }>();
    for (const p of scoped) {
      for (const t of p.topics) {
        const entry = map.get(t) ?? { total: 0, solved: 0 };
        entry.total++;
        if (statuses[p.id]?.status === 'solved') entry.solved++;
        map.set(t, entry);
      }
    }
    return [...map.entries()]
      .map(([t, v]) => ({ topic: t, label: topicLabel(t), ...v }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [scoped, statuses]);

  const searching = search.trim().length > 0;
  const tableRows = useMemo(() => {
    let rows = scoped;
    if (topic && !searching) rows = rows.filter((p) => p.topics.includes(topic));
    if (searching) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((p) => p.title.toLowerCase().includes(q));
    }
    return rows;
  }, [scoped, topic, search, searching]);

  const showTable = searching || topic !== null;
  const solvedInScope = scoped.filter((p) => statuses[p.id]?.status === 'solved').length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <DifficultyTabs
          value={difficulty}
          onChange={(d) => setParams({ difficulty: d, topic: null })}
        />
        <p className="font-mono text-xs text-muted-foreground">
          {solvedInScope}/{scoped.length} solved
        </p>
      </div>

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search problems…"
        aria-label="Search problems"
        className="h-11 w-full rounded-md border border-input bg-card px-3 font-mono text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />

      {!showTable ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((t, i) => (
            <button
              key={t.topic}
              onClick={() => setParams({ topic: t.topic })}
              className="animate-fade-up rounded-lg border bg-card p-4 text-left transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ animationDelay: `${Math.min(i * 45, 500)}ms` }}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-display text-[15px] font-bold">{t.label}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {t.solved}/{t.total}
                </span>
              </div>
              <span className="mt-0.5 block font-mono text-xs text-primary">#{t.topic}</span>
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-glow transition-all"
                  style={{ width: `${t.total ? (t.solved / t.total) * 100 : 0}%` }}
                />
              </div>
            </button>
          ))}
          {topics.length === 0 && (
            <p className="col-span-full rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
              No problems here yet. Run{' '}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono">npm run import</code> to
              build the problem bank.
            </p>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          <div className="flex items-center justify-between border-b px-4 py-2.5">
            <p className="font-mono text-xs text-muted-foreground">
              {searching ? (
                <>“{search.trim()}” · {tableRows.length} match{tableRows.length === 1 ? '' : 'es'}</>
              ) : (
                <>
                  #{topic} · {tableRows.length} problem{tableRows.length === 1 ? '' : 's'}
                </>
              )}
            </p>
            {topic && !searching && (
              <button
                onClick={() => setParams({ topic: null })}
                className="font-mono text-xs text-primary underline-offset-4 hover:underline"
              >
                ← all topics
              </button>
            )}
          </div>
          <ul className="divide-y">
            {tableRows.map((p) => {
              const status = statuses[p.id];
              return (
                <li key={p.id}>
                  <Link
                    href={`/problems/${p.slug}`}
                    className="flex min-h-[52px] items-center gap-3 px-4 py-3 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  >
                    <StatusGlyph status={status} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{p.title}</span>
                      <span className="block truncate font-mono text-xs text-muted-foreground">
                        {p.topics.map((t) => `#${t}`).join(' ')}
                      </span>
                    </span>
                    {status && (
                      <span
                        className={cn(
                          'hidden font-mono text-xs tabular-nums sm:inline',
                          status.status === 'solved' ? 'text-ease' : 'text-muted-foreground'
                        )}
                      >
                        {status.bestScore}
                      </span>
                    )}
                    <DifficultyBadge difficulty={p.difficulty} />
                  </Link>
                </li>
              );
            })}
            {tableRows.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-muted-foreground">
                Nothing matches. Try another search or difficulty.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
