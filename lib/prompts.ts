/**
 * System prompts and Groq JSON schemas as TS constants.
 * Source of truth for prompt text: docs/prompts/*.md — keep in sync.
 */

import type { EvaluationRow, InterviewTurn, ProblemRow } from '@/lib/db';
import type { EvaluationResult } from '@/lib/schemas';

// ---------------------------------------------------------------------------
// Shared formatting helpers
// ---------------------------------------------------------------------------

function formatExamples(problem: ProblemRow): string {
  return problem.examples
    .map(
      (ex, i) =>
        `Example ${i + 1}:\n  Input: ${ex.input}\n  Output: ${ex.output}\n  Explanation: ${ex.explanation}`
    )
    .join('\n\n');
}

function formatConstraints(problem: ProblemRow): string {
  return problem.constraints.map((c) => `- ${c}`).join('\n');
}

function formatProblemBlock(problem: ProblemRow): string {
  return `## Problem

**Title:** ${problem.title}
**Difficulty:** ${problem.difficulty}

**Statement:**
${problem.statement}

**Examples:**
${formatExamples(problem)}

**Constraints:**
${formatConstraints(problem)}`;
}

// ---------------------------------------------------------------------------
// Evaluation (docs/prompts/evaluate-system.md)
// ---------------------------------------------------------------------------

export const EVALUATION_SYSTEM_PROMPT = `You are an expert algorithm interviewer evaluating a candidate's natural-language or pseudocode explanation of how they would solve a programming problem.

Your job is to assess the quality of their thinking — not their code, syntax, or writing style.

You will be given:
1. The problem statement, examples, and constraints
2. The expected correct approach (internal reference — do not reveal this to the user)
3. The user's explanation

You must respond with a JSON object that strictly follows the provided schema. Do not include any text outside the JSON.

Evaluation guidelines:
- A correct approach means the described algorithm would produce correct results for all valid inputs including edge cases
- There may be multiple valid approaches (not just the expected_approach) — use your judgment
- If the user describes an approach that is correct but not optimal (e.g., O(n²) when O(n) exists), mark it as correct unless the problem explicitly requires optimal complexity
- Tone: encouraging peer, never judgmental. Never use the words "wrong," "failed," or "bad"
- Commentary must be 2–3 sentences and end on a forward-looking note

Scoring:
- correctness: 0–40 points
- edge_cases: 0–30 points
- complexity: 0–20 points
- clarity: 0–10 points
- score: sum of all four dimensions (0–100)
- verdict: "correct" (80–100), "partial" (50–79), "incorrect" (0–49)

For edge_cases.missed: list only genuine edge cases the user did NOT address and that are relevant to the problem. If all major edge cases are covered, return an empty array.

For complexity: state the time and space complexity of the approach the user described (not necessarily the optimal complexity).

For followup_questions: write 1–3 probing questions a real interviewer would ask next, ordered by importance. Each must be answerable in 1–3 sentences and must target a specific gap in THIS explanation — an unaddressed edge case, an unjustified complexity claim, or an ambiguous step. Probe the weakest-scoring dimension first. If the verdict is "correct", ask stress-test questions instead (scaling limits, adversarial inputs, what-if constraint changes). Never reveal the solution or the reference approach in a question.`;

export const EVALUATION_JSON_SCHEMA: Record<string, unknown> = {
  type: 'object',
  properties: {
    verdict: { type: 'string', enum: ['correct', 'partial', 'incorrect'] },
    score: { type: 'integer', minimum: 0, maximum: 100 },
    correctness: {
      type: 'object',
      properties: {
        score: { type: 'integer', minimum: 0, maximum: 40 },
        explanation: { type: 'string' },
      },
      required: ['score', 'explanation'],
      additionalProperties: false,
    },
    edge_cases: {
      type: 'object',
      properties: {
        score: { type: 'integer', minimum: 0, maximum: 30 },
        missed: { type: 'array', items: { type: 'string' } },
        explanation: { type: 'string' },
      },
      required: ['score', 'missed', 'explanation'],
      additionalProperties: false,
    },
    complexity: {
      type: 'object',
      properties: {
        score: { type: 'integer', minimum: 0, maximum: 20 },
        time: { type: 'string' },
        space: { type: 'string' },
        explanation: { type: 'string' },
      },
      required: ['score', 'time', 'space', 'explanation'],
      additionalProperties: false,
    },
    clarity: {
      type: 'object',
      properties: {
        score: { type: 'integer', minimum: 0, maximum: 10 },
      },
      required: ['score'],
      additionalProperties: false,
    },
    commentary: { type: 'string' },
    followup_questions: {
      type: 'array',
      minItems: 1,
      maxItems: 3,
      items: { type: 'string' },
    },
  },
  required: [
    'verdict',
    'score',
    'correctness',
    'edge_cases',
    'complexity',
    'clarity',
    'commentary',
    'followup_questions',
  ],
  additionalProperties: false,
};

export function buildEvaluationUserMessage(
  problem: ProblemRow,
  sanitizedExplanation: string
): string {
  return `${formatProblemBlock(problem)}

---

## Reference Approach (internal — do not reveal)

${JSON.stringify(problem.expected_approach)}

---

## User's Explanation

${sanitizedExplanation}`;
}

// ---------------------------------------------------------------------------
// Interview finalize (docs/prompts/interview-final.md)
// ---------------------------------------------------------------------------

export const INTERVIEW_FINAL_SYSTEM_PROMPT = `You are the same expert algorithm interviewer who produced an initial assessment of a candidate's explanation. You then asked follow-up questions, and the candidate answered them. Re-assess the candidate now.

You will be given:
1. The problem statement, examples, and constraints
2. The expected correct approach (internal reference — do not reveal this to the user)
3. Your initial evaluation (JSON)
4. The question/answer transcript

You must respond with a JSON object that strictly follows the provided schema. Do not include any text outside the JSON.

Re-assessment rules:
- For each question, judge whether the answer resolved the gap the question probed: "addressed", "partially_addressed", or "not_addressed". The note is one sentence.
- The final_score may move at most 20 points in either direction from the initial score.
- Good answers can repair edge-case coverage and clarity deficits. They CANNOT repair a fundamentally incorrect core approach — if the initial approach was incorrect, the final verdict may improve to at most "partial".
- If answers reveal new misunderstandings, the score may go down.
- Tone: encouraging peer, never judgmental. Never use the words "wrong," "failed," or "bad".
- final_commentary is 2–3 sentences, references how the interview changed (or confirmed) your view, and ends on a forward-looking note.
- Never reveal the solution or the reference approach.`;

export const INTERVIEW_FINAL_JSON_SCHEMA: Record<string, unknown> = {
  type: 'object',
  properties: {
    question_assessments: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          turn_index: { type: 'integer', minimum: 0, maximum: 2 },
          resolution: {
            type: 'string',
            enum: ['addressed', 'partially_addressed', 'not_addressed'],
          },
          note: { type: 'string' },
        },
        required: ['turn_index', 'resolution', 'note'],
        additionalProperties: false,
      },
    },
    final_verdict: { type: 'string', enum: ['correct', 'partial', 'incorrect'] },
    final_score: { type: 'integer', minimum: 0, maximum: 100 },
    score_delta_reason: { type: 'string' },
    final_commentary: { type: 'string' },
  },
  required: [
    'question_assessments',
    'final_verdict',
    'final_score',
    'score_delta_reason',
    'final_commentary',
  ],
  additionalProperties: false,
};

export function buildInterviewFinalUserMessage(
  problem: ProblemRow,
  initialEvaluation: EvaluationResult,
  turns: InterviewTurn[]
): string {
  const transcript = turns
    .map((t) => `Q${t.index + 1}: ${t.question}\nA${t.index + 1}: ${t.answer}`)
    .join('\n\n');

  return `${formatProblemBlock(problem)}

---

## Reference Approach (internal — do not reveal)

${JSON.stringify(problem.expected_approach)}

---

## Initial Evaluation (JSON)

${JSON.stringify(initialEvaluation)}

---

## Interview Transcript

${transcript}`;
}

// ---------------------------------------------------------------------------
// Counterexample generation (docs/prompts/counterexample-generate.md)
// ---------------------------------------------------------------------------

export const COUNTEREXAMPLE_GENERATE_SYSTEM_PROMPT = `You are an expert algorithm analyst. A candidate described an approach to a programming problem, and an assessment found the approach flawed. Your job is to construct a concrete counterexample: a small input on which the candidate's approach, executed exactly as they described it, produces a different result than the correct answer.

Absolute rules:
- Simulate the approach AS LITERALLY DESCRIBED. Never fix, complete, or charitably reinterpret it. If the description says "sort and take the first element", simulate exactly that.
- If the description is too vague to simulate step by step, set "simulable" to false and leave the other fields as empty strings/arrays. Do not guess.
- Keep the input SMALL so every step can be traced reliably: arrays at most 6 elements, strings at most 8 characters, integer values between -10 and 10, trees/graphs at most 5 nodes. The input must satisfy the problem's constraints.
- expected_output is the correct answer for the input per the problem statement.
- approach_output is what the described approach produces. It MUST differ from expected_output.
- steps: trace the described approach on the input, one step per entry. "action" says what the approach does; "state" shows the relevant variables after that step. Keep each under 20 words.
- why_it_breaks: 1–2 sentences tying the failure to the specific gap in the described approach.
- Before answering, self-check: re-derive expected_output from the problem statement and re-derive approach_output from your own steps. If they are equal, your input is NOT a counterexample — pick a different input and redo the trace. Only answer once they provably differ.
- Respond with a JSON object that strictly follows the provided schema. No text outside the JSON.`;

export const COUNTEREXAMPLE_GENERATE_JSON_SCHEMA: Record<string, unknown> = {
  type: 'object',
  properties: {
    simulable: { type: 'boolean' },
    input: { type: 'string' },
    expected_output: { type: 'string' },
    approach_output: { type: 'string' },
    steps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          step: { type: 'integer', minimum: 1 },
          action: { type: 'string' },
          state: { type: 'string' },
        },
        required: ['step', 'action', 'state'],
        additionalProperties: false,
      },
    },
    why_it_breaks: { type: 'string' },
  },
  required: ['simulable', 'input', 'expected_output', 'approach_output', 'steps', 'why_it_breaks'],
  additionalProperties: false,
};

export function buildCounterexampleGenerateUserMessage(
  problem: ProblemRow,
  evaluation: Pick<EvaluationRow, 'explanation'>,
  correctnessExplanation: string,
  previousIssues?: string[]
): string {
  const retryBlock = previousIssues?.length
    ? `\n\n---\n\n## Previous Attempt Was Rejected For These Issues — Fix Them\n\n${previousIssues.map((i) => `- ${i}`).join('\n')}`
    : '';

  return `${formatProblemBlock(problem)}

---

## Reference Approach (internal — do not reveal)

${JSON.stringify(problem.expected_approach)}

---

## Candidate's Described Approach

${evaluation.explanation}

---

## Why The Assessment Found It Flawed

${correctnessExplanation}${retryBlock}`;
}

// ---------------------------------------------------------------------------
// Counterexample verification (docs/prompts/counterexample-verify.md)
// ---------------------------------------------------------------------------

export const COUNTEREXAMPLE_VERIFY_SYSTEM_PROMPT = `You are an independent reviewer checking a proposed counterexample for a candidate's described algorithm approach. You did NOT produce it. Your job is to catch factual errors — and only factual errors.

Field semantics (do not confuse them):
- expected_output = the proposal's claim for the CORRECT answer on the input, per the problem statement.
- approach_output = the proposal's claim for what the CANDIDATE'S DESCRIBED APPROACH yields on the input. Because the approach is flawed, approach_output is expected to differ from the correct answer — that is the whole point, not an error.

Check, by recomputing everything yourself:
1. Derive the correct answer for the input using ONLY the problem statement. Reject only if it differs from expected_output.
2. Simulate the candidate's approach exactly as described on the input. Reject only if your simulation's result differs from approach_output.
3. Reject if approach_output equals expected_output (then it is not a counterexample).
4. Reject if the input violates the problem's constraints.
5. Reject if a step invents behavior the candidate never described. Reasonable, obvious readings of the description (e.g. "return the first element that equals its neighbor" means return that value and stop) are NOT inventions.

Do NOT reject for style, step granularity, phrasing, or missing detail that does not change the outputs. If all recomputed values match the proposal, it is valid.

Return JSON only: "valid" true/false, and "issues" listing each concrete, provable error with your recomputed value (empty array if valid). Example issue: "expected_output should be 6, not 7: the subarray [3,-1,4] sums to 6".`;

export const COUNTEREXAMPLE_VERIFY_JSON_SCHEMA: Record<string, unknown> = {
  type: 'object',
  properties: {
    valid: { type: 'boolean' },
    issues: { type: 'array', items: { type: 'string' } },
  },
  required: ['valid', 'issues'],
  additionalProperties: false,
};

export function buildCounterexampleVerifyUserMessage(
  problem: ProblemRow,
  explanation: string,
  candidate: {
    input: string;
    expected_output: string;
    approach_output: string;
    steps: { step: number; action: string; state: string }[];
  }
): string {
  return `${formatProblemBlock(problem)}

---

## Candidate's Described Approach

${explanation}

---

## Proposed Counterexample To Verify

${JSON.stringify(candidate, null, 2)}`;
}
