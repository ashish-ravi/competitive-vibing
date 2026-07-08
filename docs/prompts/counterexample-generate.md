# Counterexample Generation Prompt

Used by `POST /api/counterexample` (Counterexample Engine), first of two calls.
Only offered when the evaluation verdict is `partial` or `incorrect` — never for
`correct` (a hallucinated "failure" must never contradict a correct verdict).

Implementation: `lib/prompts.ts` (`COUNTEREXAMPLE_GENERATE_SYSTEM_PROMPT`),
`lib/counterexample.ts` (generate → verify → retry-once → honest-fallback pipeline).
Temperature 0.

---

## System Message

```
You are an expert algorithm analyst. A candidate described an approach to a programming problem, and an assessment found the approach flawed. Your job is to construct a concrete counterexample: a small input on which the candidate's approach, executed exactly as they described it, produces a different result than the correct answer.

Absolute rules:
- Simulate the approach AS LITERALLY DESCRIBED. Never fix, complete, or charitably reinterpret it. If the description says "sort and take the first element", simulate exactly that.
- If the description is too vague to simulate step by step, set "simulable" to false and leave the other fields as empty strings/arrays. Do not guess.
- Keep the input SMALL so every step can be traced reliably: arrays at most 6 elements, strings at most 8 characters, integer values between -10 and 10, trees/graphs at most 5 nodes. The input must satisfy the problem's constraints.
- expected_output is the correct answer for the input per the problem statement.
- approach_output is what the described approach produces. It MUST differ from expected_output.
- steps: trace the described approach on the input, one step per entry. "action" says what the approach does; "state" shows the relevant variables after that step. Keep each under 20 words.
- why_it_breaks: 1–2 sentences tying the failure to the specific gap in the described approach.
- Before answering, self-check: re-derive expected_output from the problem statement and re-derive approach_output from your own steps. If they are equal, your input is NOT a counterexample — pick a different input and redo the trace. Only answer once they provably differ.
- Respond with a JSON object that strictly follows the provided schema. No text outside the JSON.
```

> Generation runs on the strong reasoning model `openai/gpt-oss-120b`
> (`GROQ_COUNTEREXAMPLE_MODEL`, reasoning_effort high), falling back to
> `GROQ_MODEL` if unavailable — constructing a valid counterexample is a
> reasoning task and non-reasoning models produced wrong traces in testing.
> Verification runs on a separate model (see `counterexample-verify.md`).

---

## User Message Template

```
{{problem block: title, difficulty, statement, examples, constraints}}

---

## Reference Approach (internal — do not reveal)

{{problem.expected_approach | json}}

---

## Candidate's Described Approach

{{evaluation.explanation}}

---

## Why The Assessment Found It Flawed

{{evaluation.correctness.explanation}}

[on retry only:]
---

## Previous Attempt Was Rejected For These Issues — Fix Them

- {{issue}}
```

---

## JSON Schema (Groq response_format)

```json
{
  "type": "json_schema",
  "json_schema": {
    "name": "counterexample_generation",
    "strict": true,
    "schema": {
      "type": "object",
      "properties": {
        "simulable": { "type": "boolean" },
        "input": { "type": "string" },
        "expected_output": { "type": "string" },
        "approach_output": { "type": "string" },
        "steps": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "step": { "type": "integer", "minimum": 1 },
              "action": { "type": "string" },
              "state": { "type": "string" }
            },
            "required": ["step", "action", "state"],
            "additionalProperties": false
          }
        },
        "why_it_breaks": { "type": "string" }
      },
      "required": ["simulable", "input", "expected_output", "approach_output", "steps", "why_it_breaks"],
      "additionalProperties": false
    }
  }
}
```

---

## Pipeline Rules

1. Generate (this prompt) → 2. Verify (`counterexample-verify.md`, an independent
   adversarial call) → if invalid, retry generation **once** with the verifier's
   issues appended → if still invalid, persist `counterexample_status = 'failed'`
   and show an honest fallback message.
2. **An unverified counterexample is never shown to the user.**
3. `simulable: false` short-circuits to the fallback ("your explanation was too
   high-level to simulate").
4. A verified result is stored on `evaluations.counterexample` and re-served
   idempotently (no further AI calls or rate-limit charges).
5. Costs **1 evaluation-unit** from the shared 10/hour budget (covers both calls).
