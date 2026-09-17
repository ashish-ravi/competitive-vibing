'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Approach {
  summary: string;
  algorithm: string;
  time_complexity: string;
  space_complexity: string;
  key_insight: string;
}

/**
 * Post-evaluation payoff: compare notes with a strong approach.
 * The server only serves it once you have at least one attempt on the problem.
 */
export function ApproachReveal({ slug }: { slug: string }) {
  const [state, setState] = useState<
    | { phase: 'idle' }
    | { phase: 'loading' }
    | { phase: 'error'; message: string }
    | { phase: 'loaded'; approach: Approach }
  >({ phase: 'idle' });

  async function reveal() {
    setState({ phase: 'loading' });
    try {
      const res = await fetch(`/api/problems/${slug}/approach`);
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setState({
          phase: 'error',
          message: body?.error ?? 'Could not load the approach. Please try again.',
        });
        return;
      }
      setState({ phase: 'loaded', approach: body.data as Approach });
    } catch {
      setState({ phase: 'error', message: 'Could not load the approach. Check your connection and try again.' });
    }
  }

  if (state.phase === 'loaded') {
    const a = state.approach;
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-[22px]">A strong approach</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-[17px] leading-relaxed">{a.summary}</p>
          <div className="rounded-xl bg-secondary px-4 py-3">
            <p className="text-[12px] font-semibold text-muted-foreground">Key insight</p>
            <p className="mt-0.5 text-[15px] leading-relaxed">{a.key_insight}</p>
          </div>
          <dl className="flex flex-wrap gap-x-6 gap-y-1 text-[14px]">
            <div className="flex gap-2">
              <dt className="text-muted-foreground">Technique</dt>
              <dd>{a.algorithm}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-muted-foreground">Time</dt>
              <dd className="font-mono">{a.time_complexity}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-muted-foreground">Space</dt>
              <dd className="font-mono">{a.space_complexity}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={reveal}
        disabled={state.phase === 'loading'}
      >
        {state.phase === 'loading' ? 'Loading…' : 'Compare with a strong approach'}
      </Button>
      {state.phase === 'error' && (
        <p className="text-[13px] text-muted-foreground">{state.message}</p>
      )}
    </div>
  );
}
