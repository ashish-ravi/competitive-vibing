'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Chevron } from '@/components/ChevronLink';
import { DifficultyTabs, type DifficultyFilter } from '@/components/DifficultyTabs';
import { DifficultyBadge } from '@/components/DifficultyBadge';
import { StatusGlyph } from '@/components/StatusGlyph';
import { topicLabel, type ProblemStatus } from '@/lib/stats';
import type { ProblemListItem } from '@/lib/db';
import { cn } from '@/lib/utils';

interface ProblemBrowserProps {
  problems: ProblemListItem[];
  statuses: Record<string, ProblemStatus>;
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
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
  // Inside a topic, everything (tabs, search, counts) scopes to that topic.
  const inTopic = useMemo(
    () => (topic ? scoped.filter((p) => p.topics.includes(topic)) : scoped),
    [scoped, topic]
  );
  const tableRows = useMemo(() => {
    if (!searching) return inTopic;
    const q = search.trim().toLowerCase();
    return inTopic.filter((p) => p.title.toLowerCase().includes(q));
  }, [inTopic, search, searching]);

  const showTable = searching || topic !== null;
  const solvedInScope = inTopic.filter((p) => statuses[p.id]?.status === 'solved').length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <DifficultyTabs value={difficulty} onChange={(d) => setParams({ difficulty: d })} />
        <p className="text-[14px] tabular-nums text-muted-foreground">
          {solvedInScope} of {inTopic.length} solved
        </p>
      </div>

      <label className="relative block">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search problems"
          aria-label="Search problems"
          className="h-11 w-full rounded-xl bg-card pl-11 pr-4 text-[17px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25"
        />
      </label>

      {!showTable ? (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {topics.map((t) => {
            const pct = t.total ? Math.round((t.solved / t.total) * 100) : 0;
            return (
              <li key={t.topic}>
                <button
                  onClick={() => setParams({ topic: t.topic })}
                  className="tile-interactive group flex w-full items-center gap-4 p-5 text-left"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[17px] font-semibold tracking-title">
                      {t.label}
                    </span>
                    <span className="mt-0.5 block text-[14px] text-muted-foreground">
                      {t.solved} of {t.total} solved
                    </span>
                    <span className="mt-3 block h-1 overflow-hidden rounded-full bg-secondary">
                      <span
                        className={cn('block h-full rounded-full', pct >= 100 ? 'bg-ease' : 'bg-primary')}
                        style={{ width: `${pct}%` }}
                      />
                    </span>
                  </span>
                  <Chevron className="h-5 w-5 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-primary" />
                </button>
              </li>
            );
          })}
          {topics.length === 0 && (
            <li className="col-span-full rounded-2xl bg-card p-8 text-center text-[15px] text-muted-foreground">
              No problems yet. Run{' '}
              <code className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[14px]">npm run import</code>{' '}
              to build the problem bank.
            </li>
          )}
        </ul>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-card">
          <p className="px-5 pb-2 pt-4 text-[13px] text-muted-foreground">
            {searching ? (
              <>
                {tableRows.length} result{tableRows.length === 1 ? '' : 's'} for “{search.trim()}”
                {topic && <> in {topicLabel(topic)}</>}
              </>
            ) : (
              <>
                {tableRows.length} problem{tableRows.length === 1 ? '' : 's'}
              </>
            )}
          </p>
          <ul>
            {tableRows.map((p, i) => {
              const status = statuses[p.id];
              return (
                <li key={p.id} className={cn(i > 0 && 'border-t border-border')}>
                  <Link
                    href={`/problems/${p.slug}`}
                    className="flex min-h-[60px] items-center gap-4 px-5 py-3 transition-colors hover:bg-black/[0.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring dark:hover:bg-white/[0.04]"
                  >
                    <StatusGlyph status={status} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[17px] font-medium tracking-title">
                        {p.title}
                      </span>
                      <span className="block truncate text-[13px] text-muted-foreground">
                        {p.topics.map(topicLabel).join(' · ')}
                      </span>
                    </span>
                    {status && (
                      <span
                        className={cn(
                          'hidden text-[14px] tabular-nums sm:inline',
                          status.status === 'solved' ? 'text-ease' : 'text-muted-foreground'
                        )}
                      >
                        {status.bestScore}
                      </span>
                    )}
                    <DifficultyBadge difficulty={p.difficulty} />
                    <Chevron className="hidden h-4 w-4 text-muted-foreground/60 sm:block" />
                  </Link>
                </li>
              );
            })}
            {tableRows.length === 0 && (
              <li className="px-5 py-10 text-center text-[15px] text-muted-foreground">
                Nothing matches. Try another search or difficulty.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
