import { jsonError, requireSession } from '@/lib/api';
import { GroqUnavailableError } from '@/lib/groq';
import { getFullProblemById } from '@/lib/problems';
import { consumeRateLimit } from '@/lib/rate-limit';
import { runEvaluation, persistEvaluation } from '@/lib/evaluation';
import { emitEvaluationChunks, ndjsonResponse } from '@/lib/stream';
import { evaluateRequestSchema } from '@/lib/schemas';

// Node runtime: ReadableStream re-emit + Groq call (docs/architecture.md)
export const runtime = 'nodejs';
export const maxDuration = 60;

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
  const parsed = evaluateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, 'VALIDATION_ERROR', 'Validation failed', parsed.error.flatten());
  }

  const limit = await consumeRateLimit(userId);
  if (!limit.allowed) {
    return jsonError(429, 'RATE_LIMITED', 'Rate limit exceeded', {
      retryAfter: limit.retryAfter,
    });
  }

  const problem = await getFullProblemById(parsed.data.problem_id);
  if (!problem) return jsonError(404, 'NOT_FOUND', 'Problem not found');

  const explanation = parsed.data.explanation;

  return ndjsonResponse(async (emit) => {
    // First chunk goes out immediately so the client shows progress <200ms.
    await emit({ type: 'status', value: 'evaluating' });

    let evaluation;
    let tokensUsed;
    try {
      ({ evaluation, tokensUsed } = await runEvaluation(problem, explanation));
    } catch (err) {
      if (err instanceof GroqUnavailableError) {
        console.error(
          `POST /api/evaluate: Groq unavailable (status ${err.status}) user=${userId} problem=${problem.id}`
        );
        await emit({
          type: 'error',
          error: 'The AI evaluator is unavailable right now. Please try again in a minute.',
          code: 'AI_UNAVAILABLE',
        });
        return;
      }
      throw err;
    }

    let evaluationId: string;
    try {
      evaluationId = await persistEvaluation({
        userId,
        problemId: problem.id,
        explanation,
        evaluation,
        tokensUsed,
      });
    } catch (err) {
      console.error(`POST /api/evaluate: persist failed user=${userId} problem=${problem.id}:`, err);
      await emit({
        type: 'error',
        error: 'Your evaluation finished but could not be saved. Please try again.',
        code: 'INTERNAL_ERROR',
      });
      return;
    }

    await emitEvaluationChunks(emit, evaluation, evaluationId);
  });
}
