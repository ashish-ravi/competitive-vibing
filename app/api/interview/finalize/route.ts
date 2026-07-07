import { jsonError, requireSession } from '@/lib/api';
import { GroqUnavailableError } from '@/lib/groq';
import { getEvaluationRow } from '@/lib/history';
import { finalizeInterview } from '@/lib/interview';
import { consumeRateLimit } from '@/lib/rate-limit';
import { evaluationIdSchema, interviewFinalResultSchema } from '@/lib/schemas';
import { ndjsonResponse, sleep, CHUNK_STAGGER_MS, type EmitFn } from '@/lib/stream';
import type { InterviewFinalResult } from '@/lib/schemas';

export const runtime = 'nodejs';
export const maxDuration = 60;

async function emitFinalChunks(emit: EmitFn, result: InterviewFinalResult): Promise<void> {
  await emit({ type: 'final_verdict', value: result.final_verdict });
  await sleep(CHUNK_STAGGER_MS);
  await emit({ type: 'question_assessments', value: result.question_assessments });
  await sleep(CHUNK_STAGGER_MS);
  await emit({ type: 'final_commentary', value: result.final_commentary });
  await sleep(CHUNK_STAGGER_MS);
  await emit({ type: 'final_score', value: result.final_score, delta_reason: result.score_delta_reason });
  await sleep(CHUNK_STAGGER_MS);
  await emit({ type: 'interview_done' });
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

  // Idempotent replay: re-serve the stored result without an AI call or
  // rate-limit charge.
  if (evaluation.interview_status === 'complete' && evaluation.final_assessment) {
    const stored = interviewFinalResultSchema.safeParse(evaluation.final_assessment);
    if (stored.success) {
      return ndjsonResponse(async (emit) => {
        await emitFinalChunks(emit, stored.data);
      });
    }
  }

  const questions = evaluation.followup_questions ?? [];
  const turns = evaluation.interview_turns ?? [];
  if (questions.length === 0 || turns.length < questions.length) {
    return jsonError(400, 'VALIDATION_ERROR', 'All interview questions must be answered first', {
      answered: turns.length,
      total: questions.length,
    });
  }

  // Finalize runs one Groq call — costs 1 evaluation-unit.
  const limit = await consumeRateLimit(userId);
  if (!limit.allowed) {
    return jsonError(429, 'RATE_LIMITED', 'Rate limit exceeded', { retryAfter: limit.retryAfter });
  }

  return ndjsonResponse(async (emit) => {
    await emit({ type: 'status', value: 'assessing' });

    try {
      const { result } = await finalizeInterview(evaluation);
      await emitFinalChunks(emit, result);
    } catch (err) {
      if (err instanceof GroqUnavailableError) {
        console.error(
          `POST /api/interview/finalize: Groq unavailable (status ${err.status}) user=${userId} evaluation=${evaluation.id}`
        );
        await emit({
          type: 'error',
          error: 'The AI interviewer is unavailable right now. Your answers are saved — try again in a minute.',
          code: 'AI_UNAVAILABLE',
        });
        return;
      }
      throw err;
    }
  });
}
