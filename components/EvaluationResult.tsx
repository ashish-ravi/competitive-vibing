import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScoreBreakdown } from '@/components/ScoreBreakdown';
import { StreamingCursor } from '@/components/StreamingCursor';
import { VerdictBadge } from '@/components/VerdictBadge';
import type { Verdict } from '@/lib/db';

/** Progressively-filled evaluation state, updated as NDJSON chunks arrive. */
export interface PartialEvaluation {
  verdict?: Verdict;
  commentary?: string;
  correctness?: { explanation: string };
  edgeCases?: { missed: string[]; explanation: string };
  complexity?: { time: string; space: string; explanation: string };
  scores?: { total: number; correctness: number; edge_cases: number; complexity: number; clarity: number };
  followupQuestions?: string[];
  evaluationId?: string;
}

interface EvaluationResultProps {
  evaluation: PartialEvaluation;
  streaming: boolean;
  /** Rendered inside the card after all sections (e.g. error notice). */
  footer?: React.ReactNode;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="animate-rise border-t border-border pt-4">
      <h3 className="text-[15px] font-semibold">{title}</h3>
      <div className="mt-1.5 space-y-2">{children}</div>
    </section>
  );
}

export function EvaluationResult({ evaluation, streaming, footer }: EvaluationResultProps) {
  const { verdict, commentary, correctness, edgeCases, complexity, scores } = evaluation;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="text-[22px]">Evaluation</CardTitle>
        {verdict ? (
          <VerdictBadge verdict={verdict} className="px-3 py-1 text-[13px]" />
        ) : (
          streaming && <span className="text-[13px] text-muted-foreground">Reading…</span>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {commentary && (
          <p className="animate-rise text-[17px] leading-relaxed">
            {commentary}
            {streaming && !correctness && <StreamingCursor />}
          </p>
        )}

        {correctness && (
          <Section title="Correctness">
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              {correctness.explanation}
              {streaming && !edgeCases && <StreamingCursor />}
            </p>
          </Section>
        )}

        {edgeCases && (
          <Section title="Edge cases">
            {edgeCases.missed.length > 0 ? (
              <ul className="space-y-1.5 text-[15px] leading-relaxed">
                {edgeCases.missed.map((edge, i) => (
                  <li key={i} className="flex gap-2.5">
                    <svg className="mt-[3px] h-4 w-4 shrink-0 text-grind" viewBox="0 0 24 24" fill="currentColor" aria-label="Missed">
                      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1.2 5h2.4v7h-2.4V7Zm1.2 10.6a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6Z" />
                    </svg>
                    <span>{edge}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="flex items-center gap-2 text-[15px] text-ease">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1.3 14.3-3.9-3.9 1.5-1.5 2.4 2.4 5.5-5.5 1.5 1.5-7 7Z" />
                </svg>
                All the major edge cases are covered.
              </p>
            )}
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              {edgeCases.explanation}
              {streaming && !complexity && <StreamingCursor />}
            </p>
          </Section>
        )}

        {complexity && (
          <Section title="Complexity">
            <dl className="flex flex-wrap gap-x-6 gap-y-1 text-[15px]">
              <div className="flex gap-2">
                <dt className="text-muted-foreground">Time</dt>
                <dd className="font-mono">{complexity.time}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-muted-foreground">Space</dt>
                <dd className="font-mono">{complexity.space}</dd>
              </div>
            </dl>
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              {complexity.explanation}
              {streaming && !scores && <StreamingCursor />}
            </p>
          </Section>
        )}

        {scores && (
          <div className="animate-rise border-t border-border pt-4">
            <ScoreBreakdown scores={scores} />
          </div>
        )}

        {streaming && !commentary && (
          <p className="text-[15px] text-muted-foreground">
            Reading your approach
            <StreamingCursor />
          </p>
        )}

        {footer}
      </CardContent>
    </Card>
  );
}
