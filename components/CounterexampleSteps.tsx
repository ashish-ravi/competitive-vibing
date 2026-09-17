import type { CounterexampleStep } from '@/lib/db';

export function CounterexampleSteps({ steps }: { steps: CounterexampleStep[] }) {
  if (steps.length === 0) return null;
  return (
    <ol className="space-y-3">
      {steps.map((s) => (
        <li key={s.step} className="flex gap-3 text-[15px] leading-relaxed">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-[12px] font-semibold tabular-nums">
            {s.step}
          </span>
          <div className="min-w-0">
            <p>{s.action}</p>
            {s.state && (
              <p className="mt-0.5 break-words font-mono text-[13px] text-muted-foreground">{s.state}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
