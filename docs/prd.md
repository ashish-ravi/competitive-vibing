# Product Requirements Document — AlgoExplain

## Problem Statement

Developers preparing for coding interviews struggle to validate their algorithmic thinking before committing to code. Existing platforms (LeetCode, HackerRank) grade code, not thought. Users need a way to sanity-check their approach — catch logical gaps, missed edge cases, and complexity mistakes — before they ever open an editor.

---

## Target User

**Primary:** Software engineers (0–8 years experience) actively preparing for technical interviews at mid-to-large tech companies.

**Secondary:** CS students preparing for internship interviews.

**Not targeted (V1):** Competitive programmers, hiring managers, bootcamp instructors.

---

## Core User Need

> "I think I know how to solve this problem. Is my thinking correct, and what am I missing?"

---

## V1 Requirements

### Must Have

| # | Requirement |
|---|-------------|
| R1 | User can sign in with Google |
| R2 | User can browse a list of 20–50 problems, filterable by topic and difficulty |
| R3 | User can read a problem statement with examples and constraints |
| R4 | User can type a natural language or pseudocode explanation (max 1500 chars) |
| R5 | User receives a streamed AI evaluation: correctness verdict, missed edge cases, complexity, commentary |
| R6 | Evaluation is saved and viewable in a history page |
| R7 | User can re-attempt the same problem multiple times |
| R8 | App is fully usable on mobile (iOS Safari, Android Chrome) |
| R9 | Dark mode support |

### Must Not Have (V1)

- Code editor or code execution
- User-submitted problems
- Hints or progressive disclosure
- Gamification (streaks, XP, badges)
- Social features (sharing, leaderboards)
- Paid tier or subscription

---

## Acceptance Criteria

### R5 — AI Evaluation (most critical)

An evaluation is acceptable if:
- It correctly identifies a correct approach as correct ≥ 90% of the time
- It correctly identifies a wrong approach as wrong or partial ≥ 85% of the time
- It correctly names at least one genuinely missed edge case when one exists
- It states the correct time and space complexity for the described approach
- It completes within 8 seconds (time to last chunk)
- It never reveals the "solution" — it guides, never gives away

An evaluation is **not acceptable** if:
- It grades a correct approach as incorrect
- It makes up edge cases that don't apply to the problem
- It is inconsistent on the same input run twice

---

## Scope Boundaries

**In scope:**
- Classic algorithm problems: arrays, strings, hash maps, trees, graphs, sorting, dynamic programming, recursion, binary search, two pointers, sliding window
- English-only explanations
- Single-step problems (not multi-part)

**Out of scope:**
- System design problems
- SQL or database design problems
- Math/probability problems
- Non-English explanations

---

## Success Metrics (V1)

| Metric | Target |
|--------|--------|
| Evaluation accuracy (spot-check sample) | ≥ 85% verdict correctness |
| Time to first evaluation chunk | ≤ 2 seconds |
| Mobile usability (manual test, real device) | No blocking issues on iPhone 14 / Pixel 8 |
| Crash-free sessions | ≥ 99% |
| Problems seeded at launch | ≥ 20 |
