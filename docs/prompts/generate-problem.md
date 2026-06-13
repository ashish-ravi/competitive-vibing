# Problem Generation Prompt

Used by `scripts/seed-problems.ts` to generate problems via Groq.

---

## Generation System Message

```
You are a technical interview problem designer creating high-quality algorithm practice problems.

Each problem must:
- Be solvable with a known algorithm pattern (hash map, two pointers, sliding window, BFS/DFS, DP, binary search, etc.)
- Have a clear, unambiguous problem statement
- Include 2–3 concrete examples with inputs, outputs, and brief explanation
- Include specific constraints (input size, value ranges, edge case definitions)
- Have a well-defined expected approach that a senior engineer would consider canonical

Do not create problems that:
- Require language-specific APIs
- Depend on mathematical number theory beyond basic modular arithmetic
- Are ambiguous about whether duplicates or negative numbers are allowed
- Have multiple significantly different optimal approaches (pick the simpler one as canonical)

Return valid JSON only. No commentary outside the JSON.
```

---

## Generation User Message Template

```
Generate a {{difficulty}} algorithm problem on the topic of {{topic}}.

The problem must not be identical to these already-generated slugs: {{existing_slugs}}.

Return a JSON object matching this schema exactly.
```

---

## Generation JSON Schema

```json
{
  "type": "object",
  "properties": {
    "title": { "type": "string" },
    "slug": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$",
      "description": "URL-safe identifier, e.g. 'two-sum'"
    },
    "difficulty": {
      "type": "string",
      "enum": ["easy", "medium", "hard"]
    },
    "topics": {
      "type": "array",
      "items": { "type": "string" },
      "minItems": 1,
      "maxItems": 3
    },
    "statement": {
      "type": "string",
      "description": "Full problem statement in markdown. Include what to return, not just what to find."
    },
    "examples": {
      "type": "array",
      "minItems": 2,
      "maxItems": 3,
      "items": {
        "type": "object",
        "properties": {
          "input": { "type": "string" },
          "output": { "type": "string" },
          "explanation": { "type": "string" }
        },
        "required": ["input", "output", "explanation"],
        "additionalProperties": false
      }
    },
    "constraints": {
      "type": "array",
      "minItems": 2,
      "items": { "type": "string" },
      "description": "e.g. ['1 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9']"
    },
    "expected_approach": {
      "type": "object",
      "properties": {
        "summary": { "type": "string", "description": "1–2 sentence description of the canonical approach" },
        "algorithm": { "type": "string", "enum": ["hash-map", "two-pointers", "sliding-window", "bfs", "dfs", "dynamic-programming", "binary-search", "sorting", "stack", "heap", "greedy", "recursion", "other"] },
        "time_complexity": { "type": "string" },
        "space_complexity": { "type": "string" },
        "key_insight": { "type": "string", "description": "The non-obvious realization that unlocks the solution" },
        "critical_edge_cases": {
          "type": "array",
          "items": { "type": "string" },
          "description": "Edge cases that must be handled correctly"
        }
      },
      "required": ["summary", "algorithm", "time_complexity", "space_complexity", "key_insight", "critical_edge_cases"],
      "additionalProperties": false
    }
  },
  "required": ["title", "slug", "difficulty", "topics", "statement", "examples", "constraints", "expected_approach"],
  "additionalProperties": false
}
```

---

## Self-Verification Pass

After generating each problem, run a second Groq call to verify quality:

### Verification System Message

```
You are a senior engineer reviewing a programming problem for quality. Check:
1. Is the problem statement unambiguous?
2. Are the examples correct (do the outputs match the stated problem)?
3. Are the constraints realistic and consistent with the expected approach?
4. Is the expected_approach actually correct and optimal?
5. Are the critical_edge_cases genuine and relevant?

Return JSON: { "pass": boolean, "issues": string[] }
```

Only insert the problem if `pass: true`. Log `issues` for problems that fail.

---

## Seed Script Problem Distribution

Seed 20 problems with this distribution:

| Difficulty | Count | Topics |
|-----------|-------|--------|
| Easy | 8 | arrays (3), strings (2), hash-map (2), two-pointers (1) |
| Medium | 9 | arrays (2), trees (2), dynamic-programming (2), graphs (1), sliding-window (2) |
| Hard | 3 | dynamic-programming (1), graphs (1), binary-search (1) |
