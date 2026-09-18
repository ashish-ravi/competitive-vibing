# Roadmap — Competitive Vibing

> **Status (Sept 2026):** V1 M1–M6 shipped. V2 shipped: streaks, XP, badges, 150-problem bank, hints, strong-approach reveal, opt-in leaderboard, Explore roadmap, plus two signature features not in the original plan — the Socratic interviewer and the verified counterexample engine.
>
> **This file is the historical plan.** Everything still to build lives in
> [`backlog.md`](backlog.md), including the unticked boxes below — don't plan from this file.

## V1 — Core Product (~6 weeks)

Goal: A working, deployable app where users can log in, read problems, explain their approach, and get AI feedback. No polish features.

### M1 — Foundation (Days 1–3)
- [x] `npx create-next-app` with TypeScript + Tailwind + App Router
- [x] shadcn/ui installed and configured
- [x] NextAuth v5 + Google OAuth + Supabase adapter working
- [x] Supabase project created, `users` table + RLS policies
- [x] Authenticated session accessible in API routes and Server Components
- [x] Basic layout: nav with user avatar, mobile-responsive shell
- [x] Deploy to Vercel (CI auto-deploy from `main`)

Milestone done when: you can log in with Google on mobile and see your avatar in the nav.

---

### M2 — Problem Bank (Days 4–8)
- [x] `problems` table + migration
- [x] Problem seed script (`scripts/seed-problems.ts`) using Groq to generate 20 problems
  - Each problem: title, slug, difficulty, topics, statement, examples, constraints, expected_approach
  - Seed script self-verifies: asks Groq to critique each generated problem before inserting
- [x] `GET /api/problems` — list with topic + difficulty filter
- [x] `GET /api/problems/[slug]` — single problem detail
- [x] Problem list page: card grid, filter chips, loading skeleton
- [x] Problem detail page: statement rendered as markdown, examples, constraints

Milestone done when: you can browse and read problems on mobile.

---

### M3 — Evaluation (Days 9–11)
- [x] `evaluations` table + `rate_limits` table + migrations
- [x] `POST /api/evaluate` — non-streaming version first (easier to debug)
  - Session check, Zod validation, rate limit check, Groq call, DB persist, return result
- [x] System prompt finalized (see `docs/prompts/evaluate-system.md`)
- [x] Groq JSON schema mode enforcing evaluation output shape
- [x] `ExplanationInput` component: textarea, char counter, submit button
- [x] `EvaluationResult` component: displays verdict, edge cases, complexity, commentary
- [x] Wire up problem detail page with input + result

Milestone done when: submitting an explanation returns a real evaluation displayed on screen.

---

### M4 — Streaming (Days 12–14)
- [x] Convert `/api/evaluate` to streaming (ReadableStream, NDJSON chunks)
- [x] Client-side stream reader: parse chunks, update UI incrementally
- [x] Streaming cursor animation while AI is generating
- [x] Graceful handling of mid-stream errors

Milestone done when: evaluation text appears word-by-word on mobile, not all at once.

---

### M5 — History (Days 15–16)
- [x] `GET /api/history` — user's past evaluations (paginated, 20 per page)
- [x] `GET /api/history/[id]` — single evaluation detail
- [x] History page: evaluations grouped by problem, with verdict badge
- [x] Problem detail page shows count of prior attempts
- [x] "Try again" button pre-fills nothing (fresh attempt)

Milestone done when: past evaluations are visible and browsable.

---

### M6 — Polish (Days 17–18)
- [x] Dark mode (respect OS preference, no flash)
- [x] All loading states → skeleton UI (not spinners)
- [x] All error states → inline error with next action
- [x] Empty states: first-time user sees example evaluation
- [x] 429 rate limit message inline in evaluation panel
- [x] Mobile keyboard UX: evaluate button stays accessible when keyboard is open
- [x] `loading.tsx` and `error.tsx` for all pages

Milestone done when: the app feels complete on a real iPhone with no layout issues.

---

### M7 — Ship (Day 19)
- [ ] Vercel production environment variables set
- [ ] Supabase production DB seeded (20 problems)
- [ ] Smoke test checklist (see `CLAUDE.md`) passes
- [ ] Custom domain (optional)
- [ ] Google OAuth consent screen submitted for review

---

## V1.1 — Stability & Quality (~2 weeks post-launch)

- [ ] Manual review pass on AI-generated problems — fix any incorrect expected_approaches
- [ ] User "flag this evaluation" button (store flags in DB for review)
- [ ] Basic analytics: evaluation count, verdict distribution (no third-party SDK — just DB queries)
- [ ] Fix top bugs from real users

---

## V2 — Growth Features (~8–12 weeks post-V1.1)

### Engagement
- [x] Streak system (days practiced consecutively)
- [x] XP points per evaluation (weighted by difficulty and verdict)
- [x] Badges for milestones (10 problems, first "correct", etc.)

### Content
- [x] 50 → 150 problems (expand seed coverage, add harder problems)
- [ ] Problem sets / playlists (e.g., "Top 30 FAANG", "DP Crash Course")
- [ ] Spaced repetition: surface problems you got wrong at increasing intervals

### Discovery
- [x] Hint system: 1–3 progressive hints before evaluation
- [x] "Show me a correct explanation" after evaluation (for learning)
- [x] Opt-in leaderboard (problems mastered, streak)

### Sharing
- [ ] Share evaluation result as an og:image card (generated via Satori)
- [ ] Export evaluation history as PDF

### Infrastructure
- [ ] User-submitted problems (with moderation queue)
- [ ] Vercel KV for rate limiting (replace Supabase-based counter)
- [ ] E2E tests with Playwright
