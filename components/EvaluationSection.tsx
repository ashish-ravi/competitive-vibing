'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ApproachReveal } from '@/components/ApproachReveal';
import { CounterexampleCard } from '@/components/CounterexampleCard';
import { EvaluationResult, type PartialEvaluation } from '@/components/EvaluationResult';
import { ExplanationInput } from '@/components/ExplanationInput';
import { InterviewPanel } from '@/components/InterviewPanel';
import { RateLimitNotice } from '@/components/RateLimitNotice';
import { readNdjsonStream } from '@/lib/stream';

interface EvaluationSectionProps {
  problemId: string;
  problemSlug: string;
  priorAttempts: number;
}

type Phase = 'idle' | 'streaming' | 'complete' | 'error';

export function EvaluationSection({ problemId, problemSlug, priorAttempts }: EvaluationSectionProps) {
  const [explanation, setExplanation] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [evaluation, setEvaluation] = useState<PartialEvaluation>({});
  const [error, setError] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(priorAttempts);

  function handleEdit(value: string) {
    setExplanation(value);
    // Editing after a completed evaluation clears the stale result
    // (.claude/rules/frontend.md).
    if (phase === 'complete' || phase === 'error') {
      setPhase('idle');
      setEvaluation({});
      setError(null);
      setRetryAfter(null);
    }
  }

  async function evaluate() {
    setPhase('streaming');
    setEvaluation({});
    setError(null);
    setRetryAfter(null);

    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem_id: problemId, explanation }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        if (res.status === 429) {
          setRetryAfter(Number(body?.details?.retryAfter) || 3600);
          setPhase('idle');
          return;
        }
        setError(body?.error ?? 'The evaluation could not start. Please try again.');
        setPhase('error');
        return;
      }

      let settled = false;
      await readNdjsonStream(res, (chunk) => {
        switch (chunk.type) {
          case 'verdict':
            setEvaluation((e) => ({ ...e, verdict: chunk.value }));
            break;
          case 'commentary':
            setEvaluation((e) => ({ ...e, commentary: chunk.value }));
            break;
          case 'correctness':
            setEvaluation((e) => ({ ...e, correctness: chunk.value }));
            break;
          case 'edge_cases':
            setEvaluation((e) => ({ ...e, edgeCases: chunk.value }));
            break;
          case 'complexity':
            setEvaluation((e) => ({ ...e, complexity: chunk.value }));
            break;
          case 'scores':
            setEvaluation((e) => ({ ...e, scores: chunk.value }));
            break;
          case 'followup_questions':
            setEvaluation((e) => ({ ...e, followupQuestions: chunk.value }));
            break;
          case 'done':
            settled = true;
            setEvaluation((e) => ({ ...e, evaluationId: chunk.evaluation_id }));
            setAttempts((n) => n + 1);
            setPhase('complete');
            break;
          case 'error':
            settled = true;
            setError(chunk.error);
            setPhase('error');
            break;
        }
      });

      if (!settled) {
        setError('The connection dropped mid-evaluation. Whatever arrived is shown below.');
        setPhase('error');
      }
    } catch {
      setError('Network hiccup — the evaluation did not complete. Please try again.');
      setPhase('error');
    }
  }

  function reset() {
    setExplanation('');
    setPhase('idle');
    setEvaluation({});
    setError(null);
    setRetryAfter(null);
  }

  const hasPartialContent = Boolean(evaluation.verdict || evaluation.commentary);
  const showResult = phase === 'streaming' || phase === 'complete' || (phase === 'error' && hasPartialContent);
  const showCounterexample =
    phase === 'complete' &&
    evaluation.evaluationId &&
    (evaluation.verdict === 'partial' || evaluation.verdict === 'incorrect');

  return (
    <div className="space-y-4">
      {attempts > 0 && (
        <p className="text-xs text-muted-foreground">
          {attempts} previous attempt{attempts === 1 ? '' : 's'} on this problem
        </p>
      )}

      <ExplanationInput
        value={explanation}
        onChange={handleEdit}
        onSubmit={evaluate}
        disabled={phase === 'streaming'}
      />

      {retryAfter !== null && <RateLimitNotice retryAfter={retryAfter} />}

      {phase === 'error' && !hasPartialContent && error && (
        <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {error}{' '}
          <button onClick={evaluate} className="font-semibold underline underline-offset-2">
            Try again
          </button>
        </div>
      )}

      {showResult && (
        <EvaluationResult
          evaluation={evaluation}
          streaming={phase === 'streaming'}
          footer={
            phase === 'error' && hasPartialContent && error ? (
              <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
                {error}{' '}
                <button onClick={evaluate} className="font-semibold underline underline-offset-2">
                  Try again
                </button>
              </div>
            ) : undefined
          }
        />
      )}

      {phase === 'complete' &&
        evaluation.evaluationId &&
        evaluation.followupQuestions &&
        evaluation.followupQuestions.length > 0 &&
        evaluation.verdict &&
        evaluation.scores && (
          <InterviewPanel
            evaluationId={evaluation.evaluationId}
            questions={evaluation.followupQuestions}
            initialVerdict={evaluation.verdict}
            initialScore={evaluation.scores.total}
          />
        )}

      {showCounterexample && evaluation.evaluationId && (
        <CounterexampleCard evaluationId={evaluation.evaluationId} />
      )}

      {phase === 'complete' && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <ApproachReveal slug={problemSlug} />
          <Button variant="ghost" size="sm" onClick={reset}>
            Start a fresh attempt
          </Button>
        </div>
      )}
    </div>
  );
}
