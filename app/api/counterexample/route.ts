import { jsonError, requireSession } from '@/lib/api';
import { GroqUnavailableError } from '@/lib/groq';
import {
  generateVerifiedCounterexample,
  persistCounterexample,
} from '@/lib/counterexample';
import { getEvaluationRow } from '@/lib/history';
import { getFullProblemById } from '@/lib/problems';
import { consumeRateLimit } from '@/lib/rate-limit';
import { evaluationIdSchema } from '@/lib/schemas';
import { ndjsonResponse, sleep, CHUNK_STAGGER_MS, type EmitFn } from '@/lib/stream';
import type { Counterexample } from '@/lib/db';

export const runtime = 'nodejs';
export const maxDuration = 60;

async function emitCounterexampleChunks(emit: EmitFn, ce: Counterexample): Promise<void> {
  await emit({
    type: 'counterexample_input',
    value: {
      input: ce.input,
      expected_output: ce.expected_output,
      approach_output: ce.approach_output,
    },
  });
  for (const step of ce.steps) {
    await sleep(CHUNK_STAGGER_MS);
    await emit({ type: 'counterexample_step', value: step });
  }
  await sleep(CHUNK_STAGGER_MS);
  await emit({ type: 'why_it_breaks', value: ce.why_it_breaks });
  await emit({ type: 'counterexample_done' });
}

export async function POST(request: Request) {
  const gate = await requireSession();
  if (gate.response) return gate.response;
  const userId = gate.userId;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, 'VALIDATION_ERROR', 'Validation failed', { body: 'Invalid JSON' });
  }
  const parsed = evaluationIdSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, 'VALIDATION_ERROR', 'Validation failed', parsed.error.flatten());
  }

  const evaluation = await getEvaluationRow(parsed.data.evaluation_id);
  if (!evaluation) return jsonError(404, 'NOT_FOUND', 'Evaluation not found');
  if (evaluation.user_id !== userId) {
    return jsonError(403, 'FORBIDDEN', 'This evaluation belongs to another user');
  }

  // Only offered when the assessment found a flaw — never contradict a
  // 'correct' verdict with a hallucinated "failure".
  if (evaluation.verdict === 'correct') {
    return jsonError(400, 'VALIDATION_ERROR', 'Counterexamples are only available for partial or incorrect verdicts');
  }

  // Idempotent replay of a verified result — no AI call, no rate-limit charge.
  if (evaluation.counterexample_status === 'verified' && evaluation.counterexample) {
    const stored = evaluation.counterexample;
    return ndjsonResponse(async (emit) => {
      await emitCounterexampleChunks(emit, stored);
    });
  }

  if (evaluation.counterexample_status === 'pending') {
    return jsonError(400, 'VALIDATION_ERROR', 'A counterexample is already being generated for this evaluation');
  }

  const problem = await getFullProblemById(evaluation.problem_id);
  if (!problem) return jsonError(404, 'NOT_FOUND', 'Problem not found');

  // Two Groq calls (generate + verify) — costs 1 evaluation-unit.
  const limit = await consumeRateLimit(userId);
  if (!limit.allowed) {
    return jsonError(429, 'RATE_LIMITED', 'Rate limit exceeded', { retryAfter: limit.retryAfter });
  }

  return ndjsonResponse(async (emit) => {
    try {
      const outcome = await generateVerifiedCounterexample(problem, evaluation, (phase) =>
        emit({ type: 'status', value: phase })
      );
      await persistCounterexample(evaluation.id, outcome);

      if (outcome.status === 'verified') {
        await emitCounterexampleChunks(emit, outcome.counterexample);
      } else {
        await emit({ type: 'counterexample_unavailable', value: outcome.reason });
      }
    } catch (err) {
      if (err instanceof GroqUnavailableError) {
        console.error(
          `POST /api/counterexample: Groq unavailable (status ${err.status}) user=${userId} evaluation=${evaluation.id}`
        );
        await emit({
          type: 'error',
          error: 'The AI analyst is unavailable right now. Please try again in a minute.',
          code: 'AI_UNAVAILABLE',
        });
        return;
      }
      throw err;
    }
  });
}
