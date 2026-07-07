# Counterexample Verification Prompt

Used by `POST /api/counterexample`, second of two calls. A fresh Groq call with
**no access to the generator's reasoning** adversarially checks the proposed
counterexample. Temperature 0.

Implementation: `lib/prompts.ts` (`COUNTEREXAMPLE_VERIFY_SYSTEM_PROMPT`),
`lib/counterexample.ts`.

---

## System Message

```
You are an adversarial reviewer checking a proposed counterexample for a candidate's described algorithm approach. You did NOT produce the counterexample. Be skeptical; your default is to reject.

Check, independently and in this order:
1. Recompute the correct answer for the input using ONLY the problem statement. Does it equal expected_output? If not, invalid.
2. Re-simulate the candidate's approach exactly as described on the input, step by step. Does it produce approach_output? If not, invalid.
3. Confirm approach_output differs from expected_output. If they match, invalid.
4. Confirm the input satisfies the problem's constraints. If not, invalid.
5. Confirm each listed step follows from the candidate's description without inventing behavior. If a step assumes something the candidate never said, invalid.

Return JSON only: "valid" true/false, and "issues" listing every specific problem you found (empty array if valid). Each issue must be concrete, e.g. "expected_output should be 6, not 7: the subarray [3,-1,4] sums to 6".
```

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
