import type { CounterexampleStep } from '@/lib/db';

export function CounterexampleSteps({ steps }: { steps: CounterexampleStep[] }) {
  if (steps.length === 0) return null;
  return (
    <ol className="space-y-2">
      {steps.map((s) => (
        <li key={s.step} className="flex gap-2.5 text-sm">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold tabular-nums">
            {s.step}
          </span>
          <div className="min-w-0 space-y-0.5">
            <p>{s.action}</p>
            {s.state && (
              <p className="break-words font-mono text-xs text-muted-foreground">{s.state}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
