import { z } from 'zod';

// ---------------------------------------------------------------------------
// Request validation (API route boundary)
// ---------------------------------------------------------------------------

export const MAX_EXPLANATION_CHARS = 1500;
export const MAX_ANSWER_CHARS = 500;

export const slugSchema = z
  .string()
  .regex(/^[a-z0-9-]{1,100}$/, 'Invalid slug');

export const problemsQuerySchema = z.object({
  topic: z.string().min(1).max(50).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
});

export const evaluateRequestSchema = z.object({
  problem_id: z.string().uuid(),
  explanation: z.string().min(20).max(MAX_EXPLANATION_CHARS),
});

export const historyQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
});

export const interviewAnswerSchema = z.object({
  evaluation_id: z.string().uuid(),
  turn_index: z.number().int().min(0).max(2),
  answer: z.string().min(1).max(MAX_ANSWER_CHARS),
});

export const evaluationIdSchema = z.object({
  evaluation_id: z.string().uuid(),
});

// ---------------------------------------------------------------------------
// AI output validation (defense-in-depth on top of Groq json_schema mode)
// ---------------------------------------------------------------------------

export const verdictSchema = z.enum(['correct', 'partial', 'incorrect']);

export const evaluationResultSchema = z.object({
  verdict: verdictSchema,
  score: z.number().int().min(0).max(100),
  correctness: z.object({
    score: z.number().int().min(0).max(40),
    explanation: z.string(),
  }),
  edge_cases: z.object({
    score: z.number().int().min(0).max(30),
    missed: z.array(z.string()),
    explanation: z.string(),
  }),
  complexity: z.object({
    score: z.number().int().min(0).max(20),
    time: z.string(),
    space: z.string(),
    explanation: z.string(),
  }),
  clarity: z.object({
    score: z.number().int().min(0).max(10),
  }),
  commentary: z.string(),
  followup_questions: z.array(z.string()).min(1).max(3),
});

export type EvaluationResult = z.infer<typeof evaluationResultSchema>;

export const interviewFinalResultSchema = z.object({
  question_assessments: z.array(
    z.object({
      turn_index: z.number().int().min(0).max(2),
      resolution: z.enum(['addressed', 'partially_addressed', 'not_addressed']),
      note: z.string(),
    })
  ),
  final_verdict: verdictSchema,
  final_score: z.number().int().min(0).max(100),
  score_delta_reason: z.string(),
  final_commentary: z.string(),
});

export type InterviewFinalResult = z.infer<typeof interviewFinalResultSchema>;

export const counterexampleGenerationSchema = z.object({
  simulable: z.boolean(),
  input: z.string(),
  expected_output: z.string(),
  approach_output: z.string(),
  steps: z.array(
    z.object({
      step: z.number().int().min(1),
      action: z.string(),
      state: z.string(),
    })
  ),
  why_it_breaks: z.string(),
});

export type CounterexampleGeneration = z.infer<typeof counterexampleGenerationSchema>;

export const counterexampleVerificationSchema = z.object({
  valid: z.boolean(),
  issues: z.array(z.string()),
});

export type CounterexampleVerification = z.infer<typeof counterexampleVerificationSchema>;
