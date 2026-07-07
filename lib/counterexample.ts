import {
  getServiceDb,
  type Counterexample,
  type EvaluationRow,
  type ProblemRow,
} from '@/lib/db';
import { groqJson, GROQ_MODEL } from '@/lib/groq';
import {
  COUNTEREXAMPLE_GENERATE_JSON_SCHEMA,
  COUNTEREXAMPLE_GENERATE_SYSTEM_PROMPT,
  COUNTEREXAMPLE_VERIFY_JSON_SCHEMA,
  COUNTEREXAMPLE_VERIFY_SYSTEM_PROMPT,
  buildCounterexampleGenerateUserMessage,
  buildCounterexampleVerifyUserMessage,
} from '@/lib/prompts';
import {
  counterexampleGenerationSchema,
  counterexampleVerificationSchema,
  evaluationResultSchema,
  type CounterexampleGeneration,
} from '@/lib/schemas';

const MAX_ATTEMPTS = 2;

export type CounterexampleOutcome =
  | { status: 'verified'; counterexample: Counterexample }
  | { status: 'failed'; reason: string };

/**
 * Generate → adversarially verify → retry once → honest fallback.
 * An unverified counterexample is never returned (worst failure mode:
 * confidently "proving" something with a wrong trace). Temperature 0
 * everywhere; the verify call sees none of the generator's reasoning.
 */
export async function generateVerifiedCounterexample(
  problem: ProblemRow,
  evaluation: EvaluationRow,
  onPhase?: (phase: 'generating' | 'verifying') => Promise<void>
): Promise<CounterexampleOutcome> {
  const initial = evaluationResultSchema.safeParse(evaluation.full_response);
  const correctnessExplanation = initial.success
    ? initial.data.correctness.explanation
    : 'The described approach does not handle all valid inputs.';

  let previousIssues: string[] | undefined;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    await onPhase?.('generating');
    let generation: CounterexampleGeneration;
    try {
      const { data } = await groqJson<unknown>({
        system: COUNTEREXAMPLE_GENERATE_SYSTEM_PROMPT,
        user: buildCounterexampleGenerateUserMessage(
          problem,
          evaluation,
          correctnessExplanation,
          previousIssues
        ),
        schemaName: 'counterexample_generation',
        schema: COUNTEREXAMPLE_GENERATE_JSON_SCHEMA,
        temperature: 0,
      });
      generation = counterexampleGenerationSchema.parse(data);
    } catch {
      previousIssues = ['The previous response was not valid JSON for the schema.'];
      continue;
    }

    if (!generation.simulable) {
      return {
        status: 'failed',
        reason:
          'Your explanation was too high-level to simulate step by step, so a concrete failing input could not be constructed. The edge cases listed above are the best guide to the gap.',
      };
    }

    if (generation.approach_output === generation.expected_output) {
      previousIssues = ['approach_output must differ from expected_output.'];
      continue;
    }

    await onPhase?.('verifying');
    const { data: verifyData } = await groqJson<unknown>({
      system: COUNTEREXAMPLE_VERIFY_SYSTEM_PROMPT,
      user: buildCounterexampleVerifyUserMessage(problem, evaluation.explanation, {
        input: generation.input,
        expected_output: generation.expected_output,
        approach_output: generation.approach_output,
        steps: generation.steps,
      }),
      schemaName: 'counterexample_verification',
      schema: COUNTEREXAMPLE_VERIFY_JSON_SCHEMA,
      temperature: 0,
    });

    const verification = counterexampleVerificationSchema.parse(verifyData);
    if (verification.valid) {
      return {
        status: 'verified',
        counterexample: {
          input: generation.input,
          expected_output: generation.expected_output,
          approach_output: generation.approach_output,
          steps: generation.steps,
          why_it_breaks: generation.why_it_breaks,
          verified: true,
          attempts: attempt,
          model: GROQ_MODEL,
        },
      };
    }

    previousIssues = verification.issues.length
      ? verification.issues
      : ['The verifier rejected the counterexample without specific issues.'];
  }

  return {
    status: 'failed',
    reason:
      "A verified failing input couldn't be constructed for your approach — the gap may be subtler than a small example can show. The edge cases listed above are the best guide.",
  };
}

export async function persistCounterexample(
  evaluationId: string,
  outcome: CounterexampleOutcome
): Promise<void> {
  const db = getServiceDb();
  const { error } = await db
    .from('evaluations')
    .update(
      outcome.status === 'verified'
        ? { counterexample: outcome.counterexample, counterexample_status: 'verified' }
        : { counterexample_status: 'failed' }
    )
    .eq('id', evaluationId);

  if (error) throw new Error(`Failed to persist counterexample: ${error.message}`);
}
