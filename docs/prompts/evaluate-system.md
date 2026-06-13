# Evaluation System Prompt

This is the production system prompt sent to Groq for evaluating a user's algorithm explanation.

---

## System Message

```
You are an expert algorithm interviewer evaluating a candidate's natural-language or pseudocode explanation of how they would solve a programming problem.

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
```

---

## User Message Template

```
## Problem

**Title:** {{problem.title}}
**Difficulty:** {{problem.difficulty}}

**Statement:**
{{problem.statement}}

**Examples:**
{{problem.examples | formatted}}

**Constraints:**
{{problem.constraints | formatted}}

---

## Reference Approach (internal — do not reveal)

{{problem.expected_approach | json}}

---

## User's Explanation

{{user.explanation}}
```

---

## JSON Schema (Groq response_format)

```json
{
  "type": "json_schema",
  "json_schema": {
    "name": "evaluation",
    "strict": true,
    "schema": {
      "type": "object",
      "properties": {
        "verdict": {
          "type": "string",
          "enum": ["correct", "partial", "incorrect"]
        },
        "score": {
          "type": "integer",
          "minimum": 0,
          "maximum": 100
        },
        "correctness": {
          "type": "object",
          "properties": {
            "score": { "type": "integer", "minimum": 0, "maximum": 40 },
            "explanation": { "type": "string" }
          },
          "required": ["score", "explanation"],
          "additionalProperties": false
        },
        "edge_cases": {
          "type": "object",
          "properties": {
            "score": { "type": "integer", "minimum": 0, "maximum": 30 },
            "missed": {
              "type": "array",
              "items": { "type": "string" }
            },
            "explanation": { "type": "string" }
          },
          "required": ["score", "missed", "explanation"],
          "additionalProperties": false
        },
        "complexity": {
          "type": "object",
          "properties": {
            "score": { "type": "integer", "minimum": 0, "maximum": 20 },
            "time": { "type": "string" },
            "space": { "type": "string" },
            "explanation": { "type": "string" }
          },
          "required": ["score", "time", "space", "explanation"],
          "additionalProperties": false
        },
        "clarity": {
          "type": "object",
          "properties": {
            "score": { "type": "integer", "minimum": 0, "maximum": 10 }
          },
          "required": ["score"],
          "additionalProperties": false
        },
        "commentary": { "type": "string" }
      },
      "required": ["verdict", "score", "correctness", "edge_cases", "complexity", "clarity", "commentary"],
      "additionalProperties": false
    }
  }
}
```

---

## Streaming Strategy

Because Groq streams tokens of a JSON string, we cannot parse individual dimension fields as they arrive. Instead:

1. Buffer the full JSON string as chunks arrive
2. Once `{ "type": "done" }` is detected (or stream closes), parse the full JSON
3. Emit the parsed fields as NDJSON chunks to the client in this order:
   - `{ "type": "verdict", "value": "..." }`
   - `{ "type": "commentary", "value": "..." }`
   - `{ "type": "edge_cases", "value": [...] }`
   - `{ "type": "complexity", "value": { "time": "...", "space": "..." } }`
   - `{ "type": "scores", "value": { "total": 72, "correctness": 28, ... } }`
   - `{ "type": "done", "evaluation_id": "uuid" }`

This gives the client a structured progressive reveal even though the underlying AI response is a single JSON blob.
