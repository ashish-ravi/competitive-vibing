# Product Rules

## Core Purpose

AlgoExplain helps users practice **explaining** algorithms, not coding them. The value is AI feedback on thinking quality, not syntax. Every product decision must reinforce this.

---

## UX Rules

- **Explanation input is the hero element.** It must be large, readable, and keyboard-friendly on mobile. Minimum 6 visible rows on any viewport. Never shrink it to fit other UI.
- **Evaluation result is the payoff.** It should appear progressively (streamed) so users feel momentum. Never show a generic spinner for more than 200ms without partial content appearing.
- **One action per screen.** The problem detail page has one CTA: "Evaluate." History, retry, and next problem are secondary actions that appear after evaluation completes.
- **No dead ends.** Every error state must offer a concrete next action (try again, go back, reload).
- **Empty states must teach.** First-time users with no history should see example evaluations, not a blank page.

---

## Mobile-First Constraints

- Design for 390px width first. Widen from there.
- Never rely on hover states for primary interactions.
- Touch targets: minimum 44×44px. Buttons, filter chips, and list items must all meet this.
- Virtual keyboard awareness: when the keyboard is open, the evaluate button must remain accessible. Use `dvh` not `vh`. Pin the submit button above the keyboard using a sticky footer.
- No horizontal scrolling anywhere.
- Font size: minimum 16px for input fields (prevents iOS auto-zoom).

---

## AI Feedback Style

The AI evaluation must be:

- **Specific, not generic.** "You missed the empty array case" not "consider edge cases."
- **Educational, not judgmental.** Tone is always that of a knowledgeable peer, never a grader. Avoid words like "wrong," "failed," "bad."
- **Concise.** Each section (correctness, edge cases, complexity, commentary) must fit in a mobile viewport without scrolling. Commentary ≤ 3 sentences.
- **Honest.** If the approach is correct, say so clearly. Don't pad with unnecessary caveats.
- **Consistent.** Same problem + similar explanations should produce similar evaluations. The rubric in `.claude/rules/ai-evaluation.md` governs this.

---

## What This App Is Not

- Not a code runner or code editor
- Not a tutorial platform (no video, no step-by-step walkthroughs)
- Not a social network (leaderboard is V2 and opt-in)
- Not a hiring platform (no recruiter features in V1 or V2)
