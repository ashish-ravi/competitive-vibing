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
    <div className="space-y-1">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

export function EvaluationResult({ evaluation, streaming, footer }: EvaluationResultProps) {
  const { verdict, commentary, correctness, edgeCases, complexity, scores } = evaluation;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Evaluation</CardTitle>
        {verdict ? (
          <VerdictBadge verdict={verdict} />
        ) : (
          streaming && <span className="text-xs text-muted-foreground">thinking…</span>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {commentary && (
          <p className="text-sm leading-relaxed">
            {commentary}
            {streaming && !correctness && <StreamingCursor />}
          </p>
        )}

        {correctness && (
          <Section title="Correctness">
            <p className="text-sm text-muted-foreground">
              {correctness.explanation}
              {streaming && !edgeCases && <StreamingCursor />}
            </p>
          </Section>
        )}

        {edgeCases && (
          <Section title="Edge cases">
            {edgeCases.missed.length > 0 ? (
              <ul className="space-y-1 text-sm">
                {edgeCases.missed.map((edge, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-amber-600 dark:text-amber-400" aria-hidden>
                      ⚠
                    </span>
                    <span>{edge}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                All the major edge cases are covered — nice.
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              {edgeCases.explanation}
              {streaming && !complexity && <StreamingCursor />}
            </p>
          </Section>
        )}

        {complexity && (
          <Section title="Complexity">
            <div className="flex flex-wrap gap-3 font-mono text-sm">
              <span>
                <span className="text-muted-foreground">time </span>
                {complexity.time}
              </span>
              <span>
                <span className="text-muted-foreground">space </span>
                {complexity.space}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {complexity.explanation}
              {streaming && !scores && <StreamingCursor />}
            </p>
          </Section>
        )}

        {scores && <ScoreBreakdown scores={scores} />}

        {streaming && !commentary && (
          <p className="text-sm text-muted-foreground">
            Reading your approach
            <StreamingCursor />
          </p>
        )}

        {footer}
      </CardContent>
    </Card>
  );
}
