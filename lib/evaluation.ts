import { getServiceDb, type ProblemRow } from '@/lib/db';
import { groqJson, sanitizeUserText } from '@/lib/groq';
import {
  EVALUATION_JSON_SCHEMA,
  EVALUATION_SYSTEM_PROMPT,
  buildEvaluationUserMessage,
} from '@/lib/prompts';
import { evaluationResultSchema, type EvaluationResult } from '@/lib/schemas';

/**
 * Run the Groq evaluation for a user's explanation of a problem.
 * Enforces score/verdict consistency server-side: the total is recomputed
 * from the dimension scores and the verdict from the rubric thresholds
 * (.claude/rules/ai-evaluation.md), regardless of what the model claimed.
 */
export async function runEvaluation(
  problem: ProblemRow,
  explanation: string
): Promise<{ evaluation: EvaluationResult; tokensUsed: number | null }> {
  const sanitized = sanitizeUserText(explanation);

  const { data, tokensUsed } = await groqJson<unknown>({
    system: EVALUATION_SYSTEM_PROMPT,
    user: buildEvaluationUserMessage(problem, sanitized),
    schemaName: 'evaluation',
    schema: EVALUATION_JSON_SCHEMA,
    temperature: 0.2,
  });

  const parsed = evaluationResultSchema.parse(data);

  const total =
    parsed.correctness.score +
    parsed.edge_cases.score +
    parsed.complexity.score +
    parsed.clarity.score;
  const verdict = total >= 80 ? 'correct' : total >= 50 ? 'partial' : 'incorrect';

  return {
    evaluation: { ...parsed, score: total, verdict },
    tokensUsed,
  };
}

/** Persist a completed evaluation. Returns the new row id. */
export async function persistEvaluation(params: {
  userId: string;
  problemId: string;
  explanation: string;
  evaluation: EvaluationResult;
  tokensUsed: number | null;
}): Promise<string> {
  const db = getServiceDb();
  const { evaluation } = params;

  const { data, error } = await db
    .from('evaluations')
    .insert({
      user_id: params.userId,
      problem_id: params.problemId,
      explanation: params.explanation,
      verdict: evaluation.verdict,
      score: evaluation.score,
      edge_cases_missed: evaluation.edge_cases.missed,
      complexity: {
        time: evaluation.complexity.time,
        space: evaluation.complexity.space,
        explanation: evaluation.complexity.explanation,
      },
      ai_commentary: evaluation.commentary,
      full_response: evaluation,
      tokens_used: params.tokensUsed,
      followup_questions: evaluation.followup_questions,
    })
    .select('id')
    .single();

  if (error) throw new Error(`Failed to persist evaluation: ${error.message}`);
  return data.id as string;
}
