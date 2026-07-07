/**
 * Newline-delimited JSON streaming, shared by server routes and client readers.
 * Strategy (docs/prompts/evaluate-system.md): the AI response is a single JSON
 * blob, so routes buffer it, parse it, then re-emit fields as ordered NDJSON
 * chunks for a progressive client reveal.
 */

import type { InterviewFinalResult, EvaluationResult } from '@/lib/schemas';
import type { CounterexampleStep, Verdict } from '@/lib/db';

// ---------------------------------------------------------------------------
// Chunk types
// ---------------------------------------------------------------------------

export type StreamChunk =
  // shared
  | { type: 'status'; value: string }
  | { type: 'error'; error: string; code: string; retryAfter?: number }
  // evaluate
  | { type: 'verdict'; value: Verdict }
  | { type: 'commentary'; value: string }
  | { type: 'correctness'; value: { explanation: string } }
  | { type: 'edge_cases'; value: { missed: string[]; explanation: string } }
  | { type: 'complexity'; value: { time: string; space: string; explanation: string } }
  | {
      type: 'scores';
      value: { total: number; correctness: number; edge_cases: number; complexity: number; clarity: number };
    }
  | { type: 'followup_questions'; value: string[] }
  | { type: 'done'; evaluation_id: string }
  // interview finalize
  | { type: 'final_verdict'; value: Verdict }
  | { type: 'question_assessments'; value: InterviewFinalResult['question_assessments'] }
  | { type: 'final_commentary'; value: string }
  | { type: 'final_score'; value: number; delta_reason: string }
  | { type: 'interview_done' }
  // counterexample
  | { type: 'counterexample_input'; value: { input: string; expected_output: string; approach_output: string } }
  | { type: 'counterexample_step'; value: CounterexampleStep }
  | { type: 'why_it_breaks'; value: string }
  | { type: 'counterexample_done' }
  | { type: 'counterexample_unavailable'; value: string };

export type EmitFn = (chunk: StreamChunk) => Promise<void>;

// ---------------------------------------------------------------------------
// Server: build an NDJSON streaming Response
// ---------------------------------------------------------------------------

/** Small stagger between re-emitted chunks so the reveal reads as progressive. */
export const CHUNK_STAGGER_MS = 120;

export function ndjsonResponse(
  handler: (emit: EmitFn) => Promise<void>
): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit: EmitFn = async (chunk) => {
        controller.enqueue(encoder.encode(JSON.stringify(chunk) + '\n'));
      };
      try {
        await handler(emit);
      } catch (err) {
        // Handlers map their own known errors to error chunks; this is the
        // last-resort net so the client never hangs on an aborted stream.
        console.error('NDJSON stream handler failed:', err);
        try {
          await emit({
            type: 'error',
            error: 'Something went sideways mid-evaluation. Please try again.',
            code: 'INTERNAL_ERROR',
          });
        } catch {
          // controller already closed/errored
        }
      } finally {
        try {
          controller.close();
        } catch {
          // already closed
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Emit the parsed evaluation as ordered chunks (spec order, then followups). */
export async function emitEvaluationChunks(
  emit: EmitFn,
  evaluation: EvaluationResult,
  evaluationId: string
): Promise<void> {
  const ordered: StreamChunk[] = [
    { type: 'verdict', value: evaluation.verdict },
    { type: 'commentary', value: evaluation.commentary },
    { type: 'correctness', value: { explanation: evaluation.correctness.explanation } },
    {
      type: 'edge_cases',
      value: { missed: evaluation.edge_cases.missed, explanation: evaluation.edge_cases.explanation },
    },
    {
      type: 'complexity',
      value: {
        time: evaluation.complexity.time,
        space: evaluation.complexity.space,
        explanation: evaluation.complexity.explanation,
      },
    },
    {
      type: 'scores',
      value: {
        total: evaluation.score,
        correctness: evaluation.correctness.score,
        edge_cases: evaluation.edge_cases.score,
        complexity: evaluation.complexity.score,
        clarity: evaluation.clarity.score,
      },
    },
    { type: 'followup_questions', value: evaluation.followup_questions },
    { type: 'done', evaluation_id: evaluationId },
  ];

  for (const chunk of ordered) {
    await emit(chunk);
    if (chunk.type !== 'done') await sleep(CHUNK_STAGGER_MS);
  }
}

// ---------------------------------------------------------------------------
// Client: read an NDJSON response incrementally
// ---------------------------------------------------------------------------

export async function readNdjsonStream(
  response: Response,
  onChunk: (chunk: StreamChunk) => void
): Promise<void> {
  if (!response.body) throw new Error('Response has no body');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIndex = buffer.indexOf('\n');
    while (newlineIndex !== -1) {
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);
      if (line) {
        try {
          onChunk(JSON.parse(line) as StreamChunk);
        } catch {
          // skip malformed line rather than killing the whole stream
        }
      }
      newlineIndex = buffer.indexOf('\n');
    }
  }

  const tail = buffer.trim();
  if (tail) {
    try {
      onChunk(JSON.parse(tail) as StreamChunk);
    } catch {
      // ignore malformed tail
    }
  }
}
