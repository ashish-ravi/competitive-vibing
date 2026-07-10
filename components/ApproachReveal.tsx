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
      setState({ phase: 'error', message: 'Network hiccup — please try again.' });
    }
  }

  if (state.phase === 'loaded') {
    const a = state.approach;
    return (
      <Card className="border-glow/40">
        <CardHeader className="pb-2">
          <CardTitle className="prompt-heading font-display text-base">a strong approach</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="leading-relaxed">{a.summary}</p>
          <div className="rounded-md border-l-4 border-glow bg-muted/50 px-3 py-2">
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              key insight
            </span>
            <p className="mt-0.5 leading-relaxed">{a.key_insight}</p>
          </div>
          <p className="flex flex-wrap gap-3 font-mono text-xs text-muted-foreground">
            <span>#{a.algorithm}</span>
            <span>time {a.time_complexity}</span>
            <span>space {a.space_complexity}</span>
          </p>
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
        <p className="text-xs text-muted-foreground">{state.message}</p>
      )}
    </div>
  );
}
