import { getServiceDb, type EvaluationRow, type InterviewTurn, type Verdict } from '@/lib/db';
import { groqJson, sanitizeUserText } from '@/lib/groq';
import {
  INTERVIEW_FINAL_JSON_SCHEMA,
  INTERVIEW_FINAL_SYSTEM_PROMPT,
  buildInterviewFinalUserMessage,
} from '@/lib/prompts';
import { getFullProblemById } from '@/lib/problems';
import {
  evaluationResultSchema,
  interviewFinalResultSchema,
  type InterviewFinalResult,
} from '@/lib/schemas';
import { MAX_ANSWER_CHARS } from '@/lib/schemas';

/** Answers are only accepted while the evaluation is fresh. */
export const INTERVIEW_WINDOW_MINUTES = 30;

/** The interview can move the score at most this far from the initial score. */
export const MAX_SCORE_DELTA = 20;

export type AnswerOutcome =
  | { ok: true; answered: number; remaining: number }
  | { ok: false; status: 400 | 404 | 403; code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'FORBIDDEN'; message: string };

export function isInterviewExpired(evaluation: EvaluationRow): boolean {
  const ageMs = Date.now() - new Date(evaluation.created_at).getTime();
  return ageMs > INTERVIEW_WINDOW_MINUTES * 60_000;
}

/**
 * Record one answer. Validates that the turn is the next unanswered question
 * for this evaluation. No AI call — not rate limited.
 */
export async function recordAnswer(
  evaluation: EvaluationRow,
  turnIndex: number,
  answer: string
): Promise<AnswerOutcome> {
  if (evaluation.interview_status === 'complete') {
    return { ok: false, status: 400, code: 'VALIDATION_ERROR', message: 'This interview is already complete' };
  }
  if (isInterviewExpired(evaluation)) {
    return {
      ok: false,
      status: 400,
      code: 'VALIDATION_ERROR',
      message: `Interviews must be completed within ${INTERVIEW_WINDOW_MINUTES} minutes of the evaluation`,
    };
  }

  const questions = evaluation.followup_questions ?? [];
  const turns = evaluation.interview_turns ?? [];
  if (questions.length === 0) {
    return { ok: false, status: 400, code: 'VALIDATION_ERROR', message: 'This evaluation has no interview questions' };
  }
  if (turnIndex !== turns.length || turnIndex >= questions.length) {
    return {
      ok: false,
      status: 400,
      code: 'VALIDATION_ERROR',
      message: `Expected an answer to question ${turns.length + 1}`,
    };
  }

  const question = questions[turnIndex];
  if (!question) {
    return { ok: false, status: 400, code: 'VALIDATION_ERROR', message: 'No such question' };
  }

  const newTurn: InterviewTurn = {
    index: turnIndex,
    question,
    answer: sanitizeUserText(answer, MAX_ANSWER_CHARS),
    answered_at: new Date().toISOString(),
  };

  const db = getServiceDb();
  const { error } = await db
    .from('evaluations')
    .update({
      interview_turns: [...turns, newTurn],
      interview_status: 'active',
    })
    .eq('id', evaluation.id)
    // Guard against concurrent double-submit of the same turn.
    .eq('interview_status', evaluation.interview_status);

  if (error) throw new Error(`Failed to record answer: ${error.message}`);

  return { ok: true, answered: turns.length + 1, remaining: questions.length - turns.length - 1 };
}

export interface FinalizedInterview {
  result: InterviewFinalResult;
  clamped: boolean;
}

/**
 * Run the single finalize Groq call and persist the adjusted assessment.
 * The final score is clamped server-side to ±MAX_SCORE_DELTA of the initial
 * score, and an initially-incorrect approach can improve to at most 'partial'
 * (defense against a non-compliant model — mirrors the prompt rules).
 */
export async function finalizeInterview(evaluation: EvaluationRow): Promise<FinalizedInterview> {
  const problem = await getFullProblemById(evaluation.problem_id);
  if (!problem) throw new Error(`Problem ${evaluation.problem_id} missing for evaluation ${evaluation.id}`);

  const initialEvaluation = evaluationResultSchema.parse(evaluation.full_response);

  const { data } = await groqJson<unknown>({
    system: INTERVIEW_FINAL_SYSTEM_PROMPT,
    user: buildInterviewFinalUserMessage(problem, initialEvaluation, evaluation.interview_turns),
    schemaName: 'interview_final',
    schema: INTERVIEW_FINAL_JSON_SCHEMA,
    temperature: 0.2,
  });

  const parsed = interviewFinalResultSchema.parse(data);

  const low = Math.max(0, evaluation.score - MAX_SCORE_DELTA);
  const high = Math.min(100, evaluation.score + MAX_SCORE_DELTA);
  let finalScore = Math.min(high, Math.max(low, parsed.final_score));

  let finalVerdict: Verdict = finalScore >= 80 ? 'correct' : finalScore >= 50 ? 'partial' : 'incorrect';
  if (evaluation.verdict === 'incorrect' && finalVerdict === 'correct') {
    finalVerdict = 'partial';
    finalScore = Math.min(finalScore, 79);
  }

  const clamped = finalScore !== parsed.final_score || finalVerdict !== parsed.final_verdict;
  const result: InterviewFinalResult = { ...parsed, final_score: finalScore, final_verdict: finalVerdict };

  const db = getServiceDb();
  const { error } = await db
    .from('evaluations')
    .update({
      interview_status: 'complete',
      final_verdict: finalVerdict,
      final_score: finalScore,
      final_assessment: result,
    })
    .eq('id', evaluation.id);

  if (error) throw new Error(`Failed to persist interview result: ${error.message}`);

  return { result, clamped };
}
