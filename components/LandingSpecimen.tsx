/**
 * The landing page's one signature element: a real graded explanation,
 * typeset like a document rather than a mock screen. It shows exactly what
 * the product does — an explanation in, an interviewer's verdict out.
 */
export function LandingSpecimen() {
  return (
    <figure className="rounded-xl border bg-card p-6 shadow-sm md:p-8">
      <figcaption className="flex items-baseline justify-between gap-3 text-[13px] text-muted-foreground">
        <span>Two Sum · Easy</span>
        <span>Sample evaluation</span>
      </figcaption>

      <blockquote className="mt-4 text-[17px] leading-relaxed">
        “Keep a hash map of the values I’ve already seen. For each number, check whether
        target&nbsp;−&nbsp;number is in the map. If it is, return both indices. One pass over the
        array.”
      </blockquote>

      <div className="mt-6 border-t pt-5">
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 text-ease"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="m5 13 4 4L19 7" />
          </svg>
          <span className="text-[17px] font-semibold text-ease">Correct</span>
          <span className="ml-auto text-[15px] font-medium tabular-nums">92 / 100</span>
        </div>

        <dl className="mt-4 space-y-2.5 text-[15px] leading-snug">
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 text-muted-foreground">Edge cases</dt>
            <dd>Duplicate values and no-solution input both handled.</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 text-muted-foreground">Complexity</dt>
            <dd>
              <span className="font-mono text-[14px]">O(n)</span> time,{' '}
              <span className="font-mono text-[14px]">O(n)</span> space — stated and right.
            </dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 text-muted-foreground">Follow-up</dt>
            <dd>What happens if the same value appears twice and the target is double it?</dd>
          </div>
        </dl>
      </div>
    </figure>
  );
}
