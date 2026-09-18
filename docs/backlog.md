# Backlog — future versions

Everything not yet built, grouped by version. `roadmap.md` is the historical plan and records
what shipped; this file is the forward-looking list and is the one to edit as work lands.
Open items from `roadmap.md` V1.1/V2 have been folded in here.

**For what to do next, read [`priorities.md`](priorities.md)** — it ranks every item below
into one ordered sequence. This file is the catalogue; that one is the plan.

Effort estimates assume one person who already knows the codebase.

**Status as of 2026-09-18:** V1 and most of V2 shipped — 150-problem bank, streaming
evaluation, Socratic interviewer, verified counterexample engine, XP/levels/streaks/badges,
Explore roadmap, opt-in leaderboard, Apple-HIG redesign, per-request query caching, README,
CI, security headers, account deletion, keep-alive cron.

---

## V2.1 — Launch readiness

Blockers before strangers can use the app. Mostly account admin, not code.

| # | Item | Why | Effort |
|---|---|---|---|
| 1 | **Set `CRON_SECRET` in Vercel** | Without it `/api/cron/keepalive` returns 401 and a free-tier Supabase project still pauses after ~7 idle days — the cause of the sign-in "Server error" on 2026-09-17. Generate with `openssl rand -hex 32`. | 5 min |
| 2 | **Rotate Google, Supabase and Groq keys** | They were pasted into a tracked file once. Assume they leaked. | 15 min |
| 3 | **Privacy policy + terms pages** | Required by Google OAuth verification, both app stores, and Australian privacy law once there are real users. Content: what's collected (Google name, email, avatar, explanation text), why, how to delete. | 1 h |
| 4 | **Submit Google OAuth consent screen for verification** | Until Google verifies the app, anyone outside the test-user list sees an "unverified app" warning at sign-in. Needs item 3 first. | 1 h + review wait |
| 5 | **Upgrade Supabase off the free tier** | The cron is a workaround. Paid removes pausing, raises limits, adds backups. | 10 min |
| 6 | **Error tracking (Sentry or similar)** | Right now a stranger hitting a 500 is invisible — nothing reports it. | 1 h |
| 7 | **Groq cost plan** | The free tier caps tokens per minute per model (30k on Scout, 8k on gpt-oss-120b). Roughly ten concurrent users will hit it. Decide: pay Groq, or add a fallback provider and queue. | research |

---

## V2.2 — Retention and growth

Small, high-leverage features. Each one is independently shippable.

| # | Item | What | Effort |
|---|---|---|---|
| 8 | **Show the previous attempt on retry** | "Try this problem again" currently opens a blank input. Show the last explanation and its verdict alongside so people improve a draft instead of restarting from nothing. | 2 h |
| 9 | **Problem of the day** | One suggested problem per day on the dashboard, same for everyone, seeded by date. The cheapest reliable driver of streaks. | 3 h |
| 10 | **Shareable result card** | An og:image of "Two Sum · Correct · 92/100" generated with Satori/`next/og`, plus a share button. This is the growth loop — every share is an advert that costs nothing. | 4 h |
| 11 | **Streak reminder email** | "You're on day 6 — keep it alive" at a fixed local hour. Resend free tier + a Vercel cron. Must include an unsubscribe link and a preference in Profile. | 4 h |
| 12 | **First-run onboarding** | Ask one question on first sign-in (interview in 2 weeks / 3 months / just practising) and let the Explore roadmap start at the matching stage. Skippable. | 4 h |
| 13 | **Flag this evaluation** | A button storing `{evaluation_id, reason}` for review. The only way to find bad AI grades at scale. Was V1.1. | 2 h |
| 14 | **Basic analytics** | Evaluation counts, verdict distribution, DAU, topic popularity — as SQL queries against existing tables, no third-party SDK (keeps the GDPR surface at zero). Was V1.1. | 3 h |
| 15 | **Problem sets / playlists** | "Top 30 FAANG", "DP crash course". A `problem_sets` table plus a join table; the UI is a variant of the existing topic view. Was V2. | 1 day |

---

## V3 — Signature differentiators

The features no competitor ships. This is where the product stops being "LeetCode but
explaining" and becomes its own thing.

| # | Item | What | Effort |
|---|---|---|---|
| 16 | **Confidence calibration** | Before evaluating, ask "How confident are you? 1–5". Over time show whether the user is systematically over- or under-confident versus their actual scores. Calibration is a real interview skill and nobody teaches it. | 1 day |
| 17 | **Find the flaw** | Invert the format: show a *wrong* explanation, ask the user to spot the bug, grade the diagnosis. The counterexample engine already produces the material — flawed approaches with verified failing inputs. | 2 days |
| 18 | **Spaced repetition** | Resurface problems graded partial or incorrect at 1, 3, 7, 21 days. Needs a `reviews` table and a "Due today" strip on the dashboard. Was V2. | 2 days |
| 19 | **Skill radar** | A radar chart of per-topic mastery on Profile, with the weakest three topics called out. The data already exists in `getUserStats`. | 1 day |
| 20 | **Voice mode** | Explain out loud; transcribe with Groq Whisper (same API key, fast, cheap). Real interviews are spoken — this is the closest simulation available without a human. | 2 days |
| 21 | **Interviewer personas** | Same rubric, different voice for the follow-up questions: friendly FAANG, terse startup CTO, academic. Pure prompt work on `docs/prompts/`. | 1 day |
| 22 | **Mock interview session** | A timed 45-minute run of 2–3 problems with one final report. Every piece exists; this is an orchestration page plus a `sessions` table. | 3 days |
| 23 | **Algorithm cinema** | Animate the counterexample trace step by step instead of listing it. High effort, high delight — the steps are already structured data. | 4 days |
| 24 | **Custom problems** | Paste your own problem statement; the AI writes the expected approach and hints. Opens the tool to any prep material, including company-specific questions. Needs a moderation path if shared. Was V2 ("user-submitted problems"). | 3 days |
| 25 | **Export history as PDF** | A record of practice to attach to applications. Was V2. | 1 day |

---

## V4 — Mobile app (iOS + Android)

Full plan given separately; the summary. **Approach: Expo (React Native)** in a monorepo —
native feel, one TypeScript codebase for both stores, shares types, Zod schemas and the
NDJSON parser with the web app. Not Capacitor (Apple rejects website wrappers under
guideline 4.2), not Swift + Kotlin (two codebases, two new languages).

**Structure:** `apps/web` (today's Next.js app, unchanged), `apps/mobile` (Expo Router),
`packages/shared` (schemas, types, stream parsing, XP/level maths).

**Backend work it needs first:**

- **Bearer auth.** Native apps have no NextAuth cookie. Add `POST /api/mobile/session`: the
  app sends a Google ID token, the server verifies it against Google's public keys, finds the
  user through `next_auth.accounts` (so web progress carries over), and returns a short-lived
  access token plus refresh token stored in `expo-secure-store`. Then teach
  `requireSession()` to accept `Authorization: Bearer …` as well as the cookie.
- **Sign in with Apple.** App Store rule 4.8 requires it wherever Google login is offered.
  Needs an Apple provider on web too, plus account linking by email.
- **Account deletion** — already shipped, and required by rule 5.1.1(v).
- Streaming works as-is: Expo's `expo/fetch` supports streamed responses.

**App shape:** tab bar (Library · Explore · Leaderboard · Profile), system appearance with no
in-app toggle, haptic feedback on verdict, offline-cached problem list, evaluate button
pinned above the keyboard.

**Phases:** groundwork 1–1.5 wk → core loop 2 wk → interview + counterexample 1 wk →
progress screens 1–1.5 wk → polish 1 wk → store submission 1–2 wk.

**Costs:** Apple Developer US$99/yr (organisation enrolment needs an ABN/D-U-N-S), Google
Play US$25 once (new personal accounts must run a 12-tester closed test for 14 days), EAS
free tier to start.

**Later:** push notifications for streaks, a home-screen streak widget.

---

## Ongoing — AI quality

The product is only as good as the grading. None of this is optional long-term.

| # | Item | What | Effort |
|---|---|---|---|
| 26 | **Evaluation regression suite** | `docs/prompts/examples.md` exists but nothing runs it. A script that sends ~20 known explanations (10 sound, 10 flawed) and asserts the verdicts would catch prompt regressions and silent model changes. **The most important missing test in the project.** | 1 day |
| 27 | **Consistency check** | The rubric promises "same explanation → similar score". Send one explanation three times and log the variance; if it exceeds ±8 points, lower the temperature. | 3 h |
| 28 | **Raise the character limit for hard problems** | 1,500 characters (`MAX_EXPLANATION_CHARS`) is tight for DP and graph problems. Consider 2,500 when `difficulty === 'hard'`. | 2 h |
| 29 | **Manual review of the problem bank** | Spot-check `expected_approach` on a sample of the 150 imported problems; they were AI-written and self-verified, not human-reviewed. Was V1.1. | 1 day |
| 30 | **Model fallback** | When Groq rate-limits or errors, currently the user just sees a failure. A second provider or a queue would keep the app usable. | 1 day |

---

## Ongoing — codebase health

Nothing here is urgent; all of it gets harder the longer it waits.

| # | Item | What | Effort |
|---|---|---|---|
| 31 | **Unit tests for pure logic** | `computeStreak`, `evaluationXp`, `levelFromXp`, `computeBadges`, `pickNext`, `readNdjsonStream`. All pure functions, all currently untested, all easy. Add `npm test` (Vitest) and wire it into CI. | 4 h |
| 32 | **E2E tests** | Playwright is already a dependency and `/dev-preview` already renders the signed-in chrome. Cover: sign-in redirect, submit an explanation, see a streamed verdict. Was V2. | 1 day |
| 33 | **Split `lib/stats.ts`** | 524 lines doing XP, streaks, badges, statuses, resume, leaderboard and solve days. Split into `xp.ts`, `streak.ts`, `badges.ts`, `leaderboard.ts` before it grows further. | 2 h |
| 34 | **Delete dead code** | `scripts/seed-problems.ts` (the legacy 20-problem seeder, superseded by `import-problems.ts`) and its `npm run seed` script; `listTopics()` in `lib/problems.ts` has no callers. Remove the references in `CLAUDE.md` and `docs/prompts/generate-problem.md` too. | 30 min |
| 35 | **Leaderboard at scale** | Currently loads every evaluation of every opted-in user and aggregates in JavaScript; cached 60 s, which holds to a few hundred users. Beyond that, move to a SQL view or a stored `xp` column updated per evaluation. | 1 day |
| 36 | **Rate limiting via Vercel KV** | The Postgres `consume_rate_limit` function is correct and atomic; KV would be faster and take load off the database. Only worth it under real traffic. Was V2. | 4 h |

---

## Loose ends

- **Keyboard "CODE" logos.** Light and dark versions were designed but never saved to disk.
  Save them as `logo-light-src.png` and `logo-dark-src.png` in the repo root and the
  theme-aware logo swap plus favicon is a 15-minute job.
- **Theme toggle.** Apple's guidance is to follow the system appearance and drop the in-app
  toggle (`dark-mode.md` → Best practices). The toggle works fine; this is a judgement call.
- **Business writing.** The brag document, the LinkedIn launch post and the Australian
  startup-setup notes were all written in chat and never saved. Worth putting in `docs/` so
  they survive.
- **Dependency audit.** Run `npm audit` before each deployment milestone, per
  `.claude/rules/security.md`.
