'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CounterexampleSteps } from '@/components/CounterexampleSteps';
import { RateLimitNotice } from '@/components/RateLimitNotice';
import { StreamingCursor } from '@/components/StreamingCursor';
import { readNdjsonStream } from '@/lib/stream';
import type { Counterexample, CounterexampleStep } from '@/lib/db';

interface CounterexampleCardProps {
  evaluationId: string;
  /** Pre-loaded result (history page) — renders read-only, no fetch button. */
  stored?: Counterexample | null;
}

type Phase = 'idle' | 'generating' | 'verifying' | 'complete' | 'unavailable' | 'error';

interface StreamedState {
  input?: { input: string; expected_output: string; approach_output: string };
  steps: CounterexampleStep[];
  whyItBreaks?: string;
}

function VerifiedBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
      title="This counterexample passed an independent AI verification pass: the expected output was recomputed from the problem statement and your approach was re-simulated from scratch."
    >
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
      verified
    </span>
  );
}

function ComparisonRow({
  input,
}: {
  input: { input: string; expected_output: string; approach_output: string };
}) {
  return (
    <div className="space-y-2">
      <p className="break-words rounded-md bg-muted px-3 py-2 font-mono text-sm">{input.input}</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 dark:border-emerald-900 dark:bg-emerald-950">
          <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
            Correct answer
          </p>
          <p className="break-words font-mono text-sm text-emerald-900 dark:text-emerald-200">
            {input.expected_output}
          </p>
        </div>
        <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 dark:border-red-900 dark:bg-red-950">
          <p className="text-xs font-medium text-red-800 dark:text-red-300">Your approach returns</p>
          <p className="break-words font-mono text-sm text-red-900 dark:text-red-200">
            {input.approach_output}
          </p>
        </div>
      </div>
    </div>
  );
}

export function CounterexampleCard({ evaluationId, stored }: CounterexampleCardProps) {
  const [phase, setPhase] = useState<Phase>(stored ? 'complete' : 'idle');
  const [state, setState] = useState<StreamedState>(
    stored
      ? {
          input: {
            input: stored.input,
            expected_output: stored.expected_output,
            approach_output: stored.approach_output,
          },
          steps: stored.steps,
          whyItBreaks: stored.why_it_breaks,
        }
      : { steps: [] }
  );
  const [message, setMessage] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  async function run() {
    setPhase('generating');
    setMessage(null);
    setRetryAfter(null);
    setState({ steps: [] });

    try {
      const res = await fetch('/api/counterexample', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evaluation_id: evaluationId }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        if (res.status === 429) {
          setRetryAfter(Number(body?.details?.retryAfter) || 3600);
          setPhase('error');
          return;
        }
        setMessage(body?.error ?? 'The counterexample could not be generated. Please try again.');
        setPhase('error');
        return;
      }

      let settled = false;
      await readNdjsonStream(res, (chunk) => {
        switch (chunk.type) {
          case 'status':
            setPhase(chunk.value === 'verifying' ? 'verifying' : 'generating');
            break;
          case 'counterexample_input':
            setState((s) => ({ ...s, input: chunk.value }));
            break;
          case 'counterexample_step':
            setState((s) => ({ ...s, steps: [...s.steps, chunk.value] }));
            break;
          case 'why_it_breaks':
            setState((s) => ({ ...s, whyItBreaks: chunk.value }));
            break;
          case 'counterexample_done':
            settled = true;
            setPhase('complete');
            break;
          case 'counterexample_unavailable':
            settled = true;
            setMessage(chunk.value);
            setPhase('unavailable');
            break;
          case 'error':
            settled = true;
            setMessage(chunk.error);
            setPhase('error');
            break;
        }
      });

      if (!settled) {
        setMessage('The connection dropped. Please try again.');
        setPhase('error');
      }
    } catch {
      setMessage('Network hiccup — please try again.');
      setPhase('error');
    }
  }

  if (phase === 'idle') {
    return (
      <Card>
        <CardContent className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Want proof?</p>
            <p className="text-sm text-muted-foreground">
              See a concrete input where your approach breaks, traced step by step.
            </p>
          </div>
          <Button onClick={run} variant="outline" className="shrink-0">
            Show me where it breaks
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">Counterexample</CardTitle>
        {phase === 'complete' && <VerifiedBadge />}
      </CardHeader>
      <CardContent className="space-y-4">
        {(phase === 'generating' || phase === 'verifying') && !state.input && (
          <p className="text-sm text-muted-foreground">
            {phase === 'generating'
              ? 'Constructing a failing input for your approach'
              : 'Verifying the counterexample independently'}
            <StreamingCursor />
          </p>
        )}

        {state.input && <ComparisonRow input={state.input} />}
        <CounterexampleSteps steps={state.steps} />

        {state.whyItBreaks && (
          <div className="rounded-md border-l-4 border-primary bg-muted/50 px-3 py-2 text-sm">
            {state.whyItBreaks}
          </div>
        )}

        {phase === 'unavailable' && message && (
          <p className="text-sm text-muted-foreground">{message}</p>
        )}

        {phase === 'error' && message && (
          <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            {message}{' '}
            <button onClick={run} className="font-semibold underline underline-offset-2">
              Try again
            </button>
          </div>
        )}
        {retryAfter !== null && <RateLimitNotice retryAfter={retryAfter} />}
      </CardContent>
    </Card>
  );
}
