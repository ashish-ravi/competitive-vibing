'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FinalAssessmentCard } from '@/components/FinalAssessmentCard';
import { InterviewTurn, type TurnResolution } from '@/components/InterviewTurn';
import { RateLimitNotice } from '@/components/RateLimitNotice';
import { readNdjsonStream } from '@/lib/stream';
import { MAX_ANSWER_CHARS } from '@/lib/schemas';
import type { Verdict } from '@/lib/db';

interface InterviewPanelProps {
  evaluationId: string;
  questions: string[];
  initialVerdict: Verdict;
  initialScore: number;
}

type Phase = 'invite' | 'answering' | 'submitting' | 'finalizing' | 'complete' | 'error';

interface FinalState {
  verdict?: Verdict;
  score?: number;
  deltaReason?: string;
  commentary?: string;
  assessments?: { turn_index: number; resolution: TurnResolution; note: string }[];
}

export function InterviewPanel({
  evaluationId,
  questions,
  initialVerdict,
  initialScore,
}: InterviewPanelProps) {
  const [phase, setPhase] = useState<Phase>('invite');
  const [answers, setAnswers] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [final, setFinal] = useState<FinalState>({});
  const [error, setError] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  const currentIndex = answers.length;
  const allAnswered = currentIndex >= questions.length;

  async function finalize() {
    setPhase('finalizing');
    setError(null);
    setRetryAfter(null);
    try {
      const res = await fetch('/api/interview/finalize', {
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
        setError(body?.error ?? 'The final assessment could not start. Please try again.');
        setPhase('error');
        return;
      }

      let settled = false;
      await readNdjsonStream(res, (chunk) => {
        switch (chunk.type) {
          case 'final_verdict':
            setFinal((f) => ({ ...f, verdict: chunk.value }));
            break;
          case 'question_assessments':
            setFinal((f) => ({ ...f, assessments: chunk.value }));
            break;
          case 'final_commentary':
            setFinal((f) => ({ ...f, commentary: chunk.value }));
            break;
          case 'final_score':
            setFinal((f) => ({ ...f, score: chunk.value, deltaReason: chunk.delta_reason }));
            break;
          case 'interview_done':
            settled = true;
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
        setError('The assessment ended unexpectedly. Your answers are saved — try again.');
        setPhase('error');
      }
    } catch {
      setError('The connection dropped mid-assessment. Your answers are saved — try again.');
      setPhase('error');
    }
  }

  async function submitAnswer() {
    const answer = draft.trim();
    if (!answer) return;
    setPhase('submitting');
    setError(null);
    try {
      const res = await fetch('/api/interview/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluation_id: evaluationId,
          turn_index: currentIndex,
          answer,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? 'Your answer could not be saved. Please try again.');
        setPhase('answering');
        return;
      }
      const nextAnswers = [...answers, answer];
      setAnswers(nextAnswers);
      setDraft('');
      if (nextAnswers.length >= questions.length) {
        await finalize();
      } else {
        setPhase('answering');
      }
    } catch {
      setError('Network hiccup — your answer was not saved. Please try again.');
      setPhase('answering');
    }
  }

  if (questions.length === 0) return null;

  if (phase === 'invite') {
    return (
      <Card>
        <CardContent className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Continue as an interview?</p>
            <p className="text-sm text-muted-foreground">
              Answer {questions.length} follow-up question{questions.length === 1 ? '' : 's'} and
              get a final assessment — like the real thing.
            </p>
          </div>
          <Button onClick={() => setPhase('answering')} className="shrink-0">
            Start interview
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Interview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.slice(0, Math.min(currentIndex + 1, questions.length)).map((q, i) => (
            <InterviewTurn
              key={i}
              question={q}
              answer={answers[i]}
              assessment={final.assessments?.find((a) => a.turn_index === i)}
            />
          ))}

          {!allAnswered && (phase === 'answering' || phase === 'submitting') && (
            <div className="space-y-2">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value.slice(0, MAX_ANSWER_CHARS))}
                placeholder="Answer in 1–3 sentences…"
                rows={3}
                disabled={phase === 'submitting'}
                maxLength={MAX_ANSWER_CHARS}
              />
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs tabular-nums text-muted-foreground">
                  {MAX_ANSWER_CHARS - draft.length} characters left
                </span>
                <Button
                  onClick={submitAnswer}
                  disabled={phase === 'submitting' || draft.trim().length === 0}
                  size="sm"
                >
                  {phase === 'submitting'
                    ? 'Sending…'
                    : currentIndex + 1 === questions.length
                      ? 'Send & get final assessment'
                      : 'Send answer'}
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
              {error}{' '}
              {allAnswered && (
                <button onClick={finalize} className="font-semibold underline underline-offset-2">
                  Retry assessment
                </button>
              )}
            </div>
          )}
          {retryAfter !== null && <RateLimitNotice retryAfter={retryAfter} />}
        </CardContent>
      </Card>

      {(phase === 'finalizing' || phase === 'complete') && (
        <FinalAssessmentCard
          initialVerdict={initialVerdict}
          initialScore={initialScore}
          finalVerdict={final.verdict}
          finalScore={final.score}
          deltaReason={final.deltaReason}
          commentary={final.commentary}
          streaming={phase === 'finalizing'}
        />
      )}
    </div>
  );
}
