/**
 * The hero is the product: an explanation being evaluated, as a terminal.
 * Pure CSS stagger — no JS, respects prefers-reduced-motion via globals.
 */

const LINES: { text: React.ReactNode; className?: string; delay: number }[] = [
  {
    text: (
      <>
        <span className="text-glow">~/competitive-vibing</span>
        <span className="text-muted-foreground"> $ </span>open two-sum
      </>
    ),
    delay: 0.2,
  },
  {
    text: <span className="text-muted-foreground"># explain your approach — no code allowed</span>,
    delay: 0.9,
  },
  {
    text: (
      <>
        <span className="text-primary">&gt; </span>hash map of seen values. for each n, if
      </>
    ),
    delay: 1.6,
  },
  {
    text: (
      <>
        <span className="text-primary">&gt; </span>target − n is in the map, return both
      </>
    ),
    delay: 2.1,
  },
  {
    text: (
      <>
        <span className="text-primary">&gt; </span>indices. one pass. O(n) time, O(n) space.
      </>
    ),
    delay: 2.6,
  },
  {
    text: (
      <span className="font-semibold text-ease">✓ correct · 92/100 · all edge cases covered</span>
    ),
    delay: 3.5,
  },
  {
    text: (
      <>
        <span className="text-grind">? follow-up:</span> what happens with duplicates, like{' '}
        <span className="text-foreground">[3, 3]</span> and target 6?
      </>
    ),
    delay: 4.2,
  },
];

export function HeroTerminal() {
  return (
    <div className="w-full max-w-xl overflow-hidden rounded-lg border bg-card shadow-xl shadow-primary/5">
      <div className="flex items-center gap-1.5 border-b bg-muted/60 px-3.5 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-boss/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-grind/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-ease/70" />
        <span className="ml-2 font-mono text-xs text-muted-foreground">mock-interview — 80×24</span>
      </div>
      <div className="space-y-1.5 px-4 py-4 font-mono text-[13px] leading-relaxed">
        {LINES.map((line, i) => (
          <p key={i} className="animate-fade-up" style={{ animationDelay: `${line.delay}s` }}>
            {line.text}
          </p>
        ))}
        <p className="animate-fade-up" style={{ animationDelay: '4.9s' }}>
          <span className="text-primary">&gt; </span>
          <span className="inline-block h-[1em] w-[0.55em] translate-y-[0.15em] animate-caret rounded-[1px] bg-primary" />
        </p>
      </div>
    </div>
  );
}
