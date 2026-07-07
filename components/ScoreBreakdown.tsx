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
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold">Score</span>
        <span className="text-2xl font-bold tabular-nums">
          {scores.total}
          <span className="text-sm font-normal text-muted-foreground">/100</span>
        </span>
      </div>
      <div className="space-y-1.5">
        {DIMENSIONS.map(({ key, label, max }) => (
          <div key={key} className="flex items-center gap-2 text-xs">
            <span className="w-20 shrink-0 text-muted-foreground">{label}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${(scores[key] / max) * 100}%` }}
              />
            </div>
            <span className="w-10 shrink-0 text-right tabular-nums text-muted-foreground">
              {scores[key]}/{max}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
