interface Scores {
  total: number;
  correctness: number;
  edge_cases: number;
  complexity: number;
  clarity: number;
}

const DIMENSIONS: { key: keyof Omit<Scores, 'total'>; label: string; max: number }[] = [
  { key: 'correctness', label: 'Correctness', max: 40 },
  { key: 'edge_cases', label: 'Edge cases', max: 30 },
  { key: 'complexity', label: 'Complexity', max: 20 },
  { key: 'clarity', label: 'Clarity', max: 10 },
];

export function ScoreBreakdown({ scores }: { scores: Scores }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[15px] font-semibold">Score</span>
        <span className="text-[40px] font-semibold leading-none tabular-nums tracking-display">
          {scores.total}
          <span className="ml-1 text-[15px] font-normal text-muted-foreground">of 100</span>
        </span>
      </div>
      <dl className="mt-4 space-y-2.5">
        {DIMENSIONS.map(({ key, label, max }) => (
          <div key={key} className="flex items-center gap-3 text-[14px]">
            <dt className="w-24 shrink-0 text-muted-foreground">{label}</dt>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-500"
                style={{ width: `${(scores[key] / max) * 100}%` }}
              />
            </div>
            <dd className="w-12 shrink-0 text-right tabular-nums text-muted-foreground">
              {scores[key]}/{max}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
