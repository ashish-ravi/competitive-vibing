import Link from 'next/link';
import { Chevron } from '@/components/ChevronLink';
import { ProgressRing } from '@/components/ProgressRing';
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
    <span
      className={cn(
        'absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full text-[15px] font-semibold tabular-nums',
        complete
          ? 'bg-ease text-white'
          : current
            ? 'bg-primary text-primary-foreground'
            : 'bg-card text-muted-foreground ring-1 ring-inset ring-border'
      )}
      aria-hidden
    >
      {complete ? (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m5 13 4 4L19 7" />
        </svg>
      ) : (
        level
      )}
    </span>
  );
}

function TopicTile({ item }: { item: RoadmapTopic }) {
  return (
    <Link
      href={`/?topic=${encodeURIComponent(item.topic)}&from=explore`}
      className="tile-interactive group flex items-center gap-4 p-4"
    >
      <ProgressRing value={item.total ? item.solved / item.total : 0} size={46} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[17px] font-semibold tracking-title">{item.label}</span>
        <span className="mt-0.5 block text-[14px] text-muted-foreground">
          {item.solved} of {item.total} solved
        </span>
      </span>
      <Chevron className="h-5 w-5 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-primary" />
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
      <div className="absolute bottom-8 left-[19px] top-10 w-0.5 bg-border" aria-hidden />
      {stages.map((stage) => {
        const current = stage.level === currentLevel;
        return (
          <section key={stage.level} className="relative pb-12 pl-14 last:pb-0 sm:pl-16">
            <StageMarker level={stage.level} complete={stage.complete} current={current} />
            <div className="flex min-h-[40px] flex-wrap items-center gap-x-3 gap-y-1">
              <h2 className="text-[22px] font-semibold tracking-title">{stage.title}</h2>
              {current && (
                <span className="rounded-full bg-primary/[0.12] px-2.5 py-0.5 text-[12px] font-semibold text-primary">
                  You are here
                </span>
              )}
              {stage.complete && (
                <span className="rounded-full bg-ease/[0.12] px-2.5 py-0.5 text-[12px] font-semibold text-ease">
                  Complete
                </span>
              )}
            </div>
            <p className="mt-1 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              {stage.blurb}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {stage.items.map((item) => (
                <TopicTile key={item.topic} item={item} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
