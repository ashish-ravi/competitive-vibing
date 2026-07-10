import Link from 'next/link';
import { ProgressRing } from '@/components/ProgressRing';
import { Reveal } from '@/components/Reveal';
import type { RoadmapStage, RoadmapTopic } from '@/lib/roadmap';
import { cn } from '@/lib/utils';

type StageWithItems = RoadmapStage & { items: RoadmapTopic[]; complete: boolean };

function StageMarker({
  level,
  complete,
  current,
}: {
  level: number;
  complete: boolean;
  current: boolean;
}) {
  return (
    <span className="absolute left-0 top-0 flex h-11 w-11 items-center justify-center" aria-hidden>
      {current && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/25" />
      )}
      <span
        className={cn(
          'relative flex h-11 w-11 items-center justify-center rounded-full border-2 font-mono text-sm font-semibold',
          complete
            ? 'border-ease bg-ease/10 text-ease'
            : current
              ? 'border-primary bg-background text-primary shadow-[0_0_20px_-4px_hsl(var(--primary)/0.6)]'
              : 'border-border bg-background text-muted-foreground'
        )}
      >
        {complete ? (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m5 13 4 4L19 7" />
          </svg>
        ) : (
          level
        )}
      </span>
    </span>
  );
}

function TopicTile({ item, dimmed }: { item: RoadmapTopic; dimmed: boolean }) {
  const complete = item.solved >= item.total;
  return (
    <Link
      href={`/?topic=${encodeURIComponent(item.topic)}&from=explore`}
      className={cn(
        'group flex items-center gap-3.5 rounded-lg border bg-card p-4 transition-all duration-200',
        'hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        complete && 'border-ease/40',
        dimmed && 'opacity-80'
      )}
    >
      <ProgressRing value={item.total ? item.solved / item.total : 0} />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-[15px] font-bold">{item.label}</span>
        <span className="mt-0.5 block font-mono text-xs text-primary">#{item.topic}</span>
      </span>
      <span className="flex flex-col items-end gap-1">
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {item.solved}/{item.total}
        </span>
        <span
          className="translate-x-1 font-mono text-sm text-primary opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
          aria-hidden
        >
          →
        </span>
      </span>
    </Link>
  );
}

export function Roadmap({
  stages,
  currentLevel,
}: {
  stages: StageWithItems[];
  currentLevel: number;
}) {
  return (
    <div className="relative">
      {/* spine */}
      <div
        className="absolute bottom-6 left-[21px] top-6 w-0.5 rounded-full bg-gradient-to-b from-primary via-glow/50 to-border"
        aria-hidden
      />
      {stages.map((stage, i) => {
        const current = stage.level === currentLevel;
        return (
          <Reveal key={stage.level} delay={Math.min(i * 90, 500)}>
            <section className="relative pb-10 pl-16 last:pb-0">
              <StageMarker level={stage.level} complete={stage.complete} current={current} />
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 pt-1.5">
                <h2 className="font-display text-lg font-bold tracking-tight">{stage.title}</h2>
                {current && (
                  <span className="rounded-full bg-primary/15 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-primary">
                    you are here
                  </span>
                )}
                {stage.complete && (
                  <span className="font-mono text-[11px] text-ease">cleared</span>
                )}
              </div>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">{stage.blurb}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {stage.items.map((item) => (
                  <TopicTile key={item.topic} item={item} dimmed={stage.level > currentLevel} />
                ))}
              </div>
            </section>
          </Reveal>
        );
      })}
    </div>
  );
}
