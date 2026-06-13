# AI Evaluation Rules

## Purpose

This rubric governs how the AI judges a user's natural-language or pseudocode explanation of an algorithm. It is used both for the Groq system prompt (see `docs/prompts/evaluate-system.md`) and as a reference for verifying evaluation quality.

---

## What Is Being Evaluated

The user writes a free-form explanation of how they would solve a programming problem. They may use:
- Plain English ("I would use a hash map to track counts...")
- Pseudocode ("for each element, if seen before, return true")
- A mix of both

The AI must evaluate the **thinking**, not the syntax or code quality.

---

## Evaluation Dimensions

### 1. Correctness (40 points)

Does the described approach actually solve the problem as stated?

| Score | Meaning |
|-------|---------|
| 36–40 | Approach is correct and complete for all stated constraints |
| 24–35 | Core insight is right but misses one key step or has a fixable logical gap |
| 12–23 | Partially correct — right direction but wrong or incomplete for most inputs |
| 0–11 | Fundamentally incorrect approach |

Correctness is judged against the problem's `expected_approach` field (stored in the DB), but the AI must use judgment — there can be multiple valid approaches.

### 2. Edge Case Coverage (30 points)

Did the user mention or implicitly handle the relevant edge cases?

Common edge cases to check (problem-dependent):
- Empty input (empty array, empty string, null)
- Single element
- All identical elements
- Maximum constraints (very large N)
- Negative numbers (if relevant)
- Duplicate values
- Already sorted / reversed input (for sorting problems)

| Score | Meaning |
|-------|---------|
| 27–30 | Proactively addresses all relevant edge cases |
| 18–26 | Addresses most; misses 1–2 minor ones |
| 9–17 | Misses several important edge cases |
| 0–8 | No meaningful edge case consideration |

### 3. Complexity Analysis (20 points)

Did the user state or imply the correct time and space complexity?

| Score | Meaning |
|-------|---------|
| 18–20 | Correct time AND space complexity explicitly stated |
| 12–17 | One correct, one missing or wrong |
| 6–11 | Complexity mentioned but incorrect |
| 0–5 | No complexity mentioned |

If the user doesn't mention complexity, the AI should state what the correct complexity for their described approach would be — not penalize heavily, but note it.

### 4. Clarity & Precision (10 points)

Is the explanation clear enough that an interviewer could follow it without guessing?

| Score | Meaning |
|-------|---------|
| 9–10 | Clear, logical, unambiguous |
| 6–8 | Mostly clear; minor gaps |
| 3–5 | Requires significant inference to understand |
| 0–2 | Too vague to evaluate |

---

## Verdict Thresholds

| Total Score | Verdict |
|-------------|---------|
| 80–100 | `correct` |
| 50–79 | `partial` |
| 0–49 | `incorrect` |

---

## Output Schema

The AI must return JSON matching this schema (enforced via Groq JSON schema mode):

```json
{
  "verdict": "correct" | "partial" | "incorrect",
  "score": 0-100,
  "correctness": {
    "score": 0-40,
    "explanation": "string (1-2 sentences)"
  },
  "edge_cases": {
    "score": 0-30,
    "missed": ["string", "..."],
    "explanation": "string (1-2 sentences)"
  },
  "complexity": {
    "score": 0-20,
    "time": "O(...)",
    "space": "O(...)",
    "explanation": "string (1 sentence)"
  },
  "clarity": {
    "score": 0-10
  },
  "commentary": "string (2-3 sentences, encouraging tone)"
}
```

---

## Tone Guidelines

- **Never say:** "wrong," "failed," "bad," "incorrect approach" (use verdict field for that, keep commentary constructive)
- **Always say:** "Your approach handles X well..." before pointing out gaps
- Commentary should answer: "If this were a real interview, what would an interviewer think?"
- If the approach is fully correct: say so clearly and enthusiastically, don't pad with caveats

---

## What NOT to Evaluate

- Grammar or spelling in the user's explanation
- Whether the user used the "best" known approach (only if theirs is correct)
- Code style or language-specific idioms
- Whether they could have used a fancier algorithm (e.g., don't penalize O(n log n) if the problem doesn't require O(n))
