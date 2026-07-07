# Interview Final Assessment Prompt

Used by `POST /api/interview/finalize` (Socratic AI Interviewer). After the initial
evaluation, the AI asked 1–3 follow-up questions (generated as `followup_questions`
in the evaluation call — see `evaluate-system.md`). The user answered each via
`POST /api/interview/answer`. This single Groq call re-assesses the candidate.

Implementation: `lib/prompts.ts` (`INTERVIEW_FINAL_SYSTEM_PROMPT`), `lib/interview.ts`.

---

## System Message

```
You are the same expert algorithm interviewer who produced an initial assessment of a candidate's explanation. You then asked follow-up questions, and the candidate answered them. Re-assess the candidate now.

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
- Never reveal the solution or the reference approach.
```

---

## User Message Template

```
{{problem block: title, difficulty, statement, examples, constraints}}

---

## Reference Approach (internal — do not reveal)

{{problem.expected_approach | json}}

---

## Initial Evaluation (JSON)

{{initial_evaluation | json}}

---

## Interview Transcript

Q1: {{question}}
A1: {{answer}}
...
```

---

## JSON Schema (Groq response_format)

```json
{
  "type": "json_schema",
  "json_schema": {
    "name": "interview_final",
    "strict": true,
    "schema": {
      "type": "object",
      "properties": {
        "question_assessments": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "turn_index": { "type": "integer", "minimum": 0, "maximum": 2 },
              "resolution": { "type": "string", "enum": ["addressed", "partially_addressed", "not_addressed"] },
              "note": { "type": "string" }
            },
            "required": ["turn_index", "resolution", "note"],
            "additionalProperties": false
          }
        },
        "final_verdict": { "type": "string", "enum": ["correct", "partial", "incorrect"] },
        "final_score": { "type": "integer", "minimum": 0, "maximum": 100 },
        "score_delta_reason": { "type": "string" },
        "final_commentary": { "type": "string" }
      },
      "required": ["question_assessments", "final_verdict", "final_score", "score_delta_reason", "final_commentary"],
      "additionalProperties": false
    }
  }
}
```

---

## Server-Side Enforcement (`lib/interview.ts`)

The prompt rules are also enforced in code as defense against a non-compliant model:

- `final_score` is clamped to ±20 of the initial score.
- `final_verdict` is recomputed from the clamped score via the rubric thresholds
  (80/50), and an initially-`incorrect` evaluation is capped at `partial` (score ≤ 79).
- Answers are sanitized (`sanitizeUserText`, 500-char cap) before entering the prompt.

## Rate Limiting

- `POST /api/interview/answer` — free (no AI call).
- `POST /api/interview/finalize` — consumes **1 evaluation-unit** from the shared
  10/hour budget. Idempotent: replays of a completed interview re-serve the stored
  result with no Groq call and no charge.

## Streaming

NDJSON chunk order: `status` → `final_verdict` → `question_assessments` →
`final_commentary` → `final_score` (with `delta_reason`) → `interview_done`.
