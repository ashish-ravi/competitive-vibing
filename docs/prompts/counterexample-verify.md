# Counterexample Verification Prompt

Used by `POST /api/counterexample`, second of two calls. A fresh Groq call with
**no access to the generator's reasoning** independently checks the proposed
counterexample. Temperature 0.

Model split (each Groq model has its own per-minute token budget, so the two
calls never compete): generation runs on `openai/gpt-oss-120b`
(`GROQ_COUNTEREXAMPLE_MODEL`), verification on `openai/gpt-oss-20b`
(`GROQ_VERIFY_MODEL`); both fall back to `GROQ_MODEL` if unavailable.
Constructing and checking traces are reasoning tasks — non-reasoning models
(llama-4-scout) proved unreliable at both during testing.

Implementation: `lib/prompts.ts` (`COUNTEREXAMPLE_VERIFY_SYSTEM_PROMPT`),
`lib/counterexample.ts`.

---

## System Message

```
You are an independent reviewer checking a proposed counterexample for a candidate's described algorithm approach. You did NOT produce it. Your job is to catch factual errors — and only factual errors.

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

Return JSON only: "valid" true/false, and "issues" listing each concrete, provable error with your recomputed value (empty array if valid). Example issue: "expected_output should be 6, not 7: the subarray [3,-1,4] sums to 6".
```

> The earlier draft opened with "be skeptical; your default is to reject",
> which caused false rejections of valid counterexamples (the verifier
> manufactured issues and confused the two output fields). Verified in both
> directions during testing: a genuine counterexample passes, a hallucinated
> trace is rejected with the recomputed value cited.

---

## User Message Template

```
{{problem block: title, difficulty, statement, examples, constraints}}

---

## Candidate's Described Approach

{{evaluation.explanation}}

---

## Proposed Counterexample To Verify

{{ input, expected_output, approach_output, steps | json }}
```

---

## JSON Schema (Groq response_format)

```json
{
  "type": "json_schema",
  "json_schema": {
    "name": "counterexample_verification",
    "strict": true,
    "schema": {
      "type": "object",
      "properties": {
        "valid": { "type": "boolean" },
        "issues": { "type": "array", "items": { "type": "string" } }
      },
      "required": ["valid", "issues"],
      "additionalProperties": false
    }
  }
}
```

---

## Notes

- The verifier deliberately does **not** see `expected_approach`'s prose beyond the
  problem block it needs — it recomputes the true output from the statement alone,
  so a bad reference approach can't rubber-stamp a bad counterexample.
- If `valid: false` with an empty `issues` array, the pipeline treats it as a
  rejection with a generic issue so the retry prompt still improves.
