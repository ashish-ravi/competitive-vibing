# Priorities — the ranked list

One ordered list across every planning document (`backlog.md`, `roadmap.md`, `prd.md`,
`architecture.md`, `.claude/rules/`). `backlog.md` says *what* is left and groups it by
version; this file says *what to do next*, as one sequence. Work top-down.

Bracketed numbers like **[B12]** refer to item numbers in `backlog.md`.

## How this is ordered

Four judgements drive the ranking, in this order:

1. **Can a stranger use it at all?** The app is feature-rich and has never been opened by
   anyone outside the two of you. Anything that blocks a cold user outranks every feature.
2. **What is dangerous to leave?** Leaked credentials and silent failures compound. They get
   worse with users, not better.
3. **Would we know if it broke?** There is no error tracking and no test that the AI still
   grades correctly. The PRD sets "≥ 85% verdict correctness" as a success metric and nothing
   measures it. A product whose core value could degrade unnoticed is fragile regardless of
   how many features it has.
4. **Retention before acquisition.** Bringing people to an app they don't return to wastes
   the traffic. Streak and habit features rank above sharing features, which rank above new
   capabilities.

The consequence: **the first fourteen items are almost all unglamorous**, and several take
minutes. That is deliberate. The product is further along than the operations around it.

---

## Tier 0 — This week. Nothing else matters until these are done.

| # | Item | Why it's first | Effort |
|---|------|----------------|--------|
| 1 | **Set `CRON_SECRET` in Vercel** [B1] | The keep-alive cron is written, deployed and returning 401 without it. Until it's set, the database still pauses after ~7 idle days and sign-in dies — exactly the failure of 2026-09-17. Five minutes to close a known, already-experienced outage. | 5 min |
| 2 | **Rotate Google, Supabase and Groq keys** [B2] | They were committed to a tracked file once. The Supabase service-role key bypasses RLS entirely — it is the keys to everything. Rotating is cheap now and impossible to undo later. | 15 min |
| 3 | **Push and confirm CI + deploy are green** | Several commits (redesign, caching, headers, account deletion) are local only. CI has never actually run. Confirm the workflow passes and Vercel deploys before building anything on top. | 15 min |
| 4 | **Privacy policy + terms pages** [B3] | Legally required once real users exist, and a hard prerequisite for item 5. Also unblocks both app stores later. | 1 h |
| 5 | **Submit Google OAuth for verification** [B4] | Until Google verifies the app, every non-test user sees a scary "unverified app" warning at sign-in. This is the single biggest barrier to a stranger ever reaching the product, and it has review latency — start it early so it's not the thing you wait on. | 1 h + wait |

## Tier 1 — Before you tell anyone it exists

| # | Item | Why here | Effort |
|---|------|----------|--------|
| 6 | **Error tracking (Sentry)** [B6] | Right now a stranger hitting a 500 is invisible to you. Every item below produces better feedback if this exists first. The PRD's "≥ 99% crash-free sessions" metric is unmeasurable without it. | 1 h |
| 7 | **Evaluation regression suite** [B26] | The highest-value engineering work in the project. `docs/prompts/examples.md` exists but nothing runs it. Groq deprecates models regularly; a prompt tweak can silently degrade grading. If the AI starts grading badly, the product is worthless and nobody would notice. Also the only way to verify the PRD's ≥ 85% accuracy target. | 1 day |
| 8 | **Unit tests for pure logic** [B31] | `computeStreak`, `evaluationXp`, `levelFromXp`, `computeBadges`, `pickNext` — all pure, all untested, all easy. Streak and XP bugs are the kind users notice and resent. Wire `npm test` into the existing CI. | 4 h |
| 9 | **Upgrade Supabase off the free tier** [B5] | The cron is a workaround for a platform limitation. Paid removes pausing, raises limits, adds backups. Do it before real user data exists, not after. | 10 min |
| 10 | **Real-device mobile test** | Non-negotiable #1 in `CLAUDE.md` is "mobile first", the PRD names iPhone 14 and Pixel 8, and the redesign was verified only in a headless browser at 390px. Open it on an actual phone, sign in, solve one problem end to end. | 1 h |
| 11 | **Write the smoke-test checklist** | `roadmap.md` M7 says "Smoke test checklist (see `CLAUDE.md`) passes" — that checklist was never written. Ten lines: sign in, list, solve, interview, counterexample, history, profile, leaderboard, sign out, delete account. Run it before every deploy. | 30 min |
| 12 | **Groq cost and limit plan** [B7] | The free tier caps tokens per minute per model. Roughly ten concurrent users will hit it, and the failure is user-visible mid-stream. Decide now: pay, or add fallback [B30]. Cheaper to plan than to discover during a launch. | research |

## Tier 2 — First month: make people come back

Ordered by return per hour of work.

| # | Item | Why here | Effort |
|---|------|----------|--------|
| 13 | **Show the previous attempt on retry** [B8] | The cheapest real improvement in the backlog. "Try again" currently opens a blank box, which throws away the user's own best material and makes retrying feel like punishment. Two hours. | 2 h |
| 14 | **Problem of the day** [B9] | The single most reliable driver of daily return, and you already have streaks, solve-day tracking and a calendar to reward it. Habit infrastructure without a daily reason to show up is half-built. | 3 h |
| 15 | **First-run onboarding** [B12] | A cold user currently lands on 150 problems with no idea where to start. Explore exists but isn't the entry point. One question ("interview in 2 weeks / 3 months / just practising") makes the first five minutes coherent. | 4 h |
| 16 | **Flag this evaluation** [B13] | The only way to find bad AI grades at scale. Pairs with item 7: the regression suite catches known failures, flags surface unknown ones. | 2 h |
| 17 | **Streak reminder email** [B11] | Closes the habit loop that items 14 and 15 open. Deliberately after them — a reminder to return to an app with nothing new is annoying, not sticky. | 4 h |
| 18 | **Basic analytics** [B14] | Verdict distribution, DAU, topic popularity, drop-off — plain SQL, no third-party SDK. Without it, every decision below this line is a guess. | 3 h |
| 19 | **Shareable result card** [B10] | The growth loop: every share is free advertising, and a scored verdict is genuinely worth posting. Ranked *after* retention on purpose — sending traffic to an app people don't return to burns the traffic. | 4 h |
| 20 | **Manual review of the problem bank** [B29] | All 150 `expected_approach` values are AI-written and self-verified, never human-checked. They are the grading key: a wrong one produces confidently wrong feedback. Spot-check 20 and extrapolate. | 1 day |
| 21 | **Raise the character limit for hard problems** [B28] | 1,500 characters is genuinely tight for DP and graph explanations, so the app penalises exactly the users doing the hardest work. Two hours. | 2 h |

## Tier 3 — Become something competitors aren't

Only once people return reliably. Ordered by differentiation per unit of effort.

| # | Item | Why this order | Effort |
|---|------|----------------|--------|
| 22 | **Confidence calibration** [B16] | The strongest idea in the backlog. One extra tap before evaluating, and over time it teaches a real interview skill nobody else teaches. Highest differentiation-to-effort ratio in the project. | 1 day |
| 23 | **Spaced repetition** [B18] | Turns a practice tool into a learning system, and gives the daily loop a reason that survives after the novelty wears off. The data (partial and incorrect verdicts with dates) already exists. | 2 days |
| 24 | **Interviewer personas** [B21] | Pure prompt work on files that already exist. Large perceived variety for one day of effort. | 1 day |
| 25 | **Skill radar** [B19] | Makes existing data legible; answers "what should I work on?" without new infrastructure. | 1 day |
| 26 | **Find the flaw** [B17] | A genuinely new game mode, and the counterexample engine already produces the material. Ranked below the above because it needs new UI, not just new framing. | 2 days |
| 27 | **Voice mode** [B20] | Closest thing to a real interview, and Groq Whisper is on the same API key. High value, but real complexity: permissions, recording UI, transcription errors. | 2 days |
| 28 | **Mock interview session** [B22] | The natural capstone once personas and voice exist — a timed multi-problem run with one report. Deliberately last in this tier: it composes the others. | 3 days |

## Tier 4 — Expand the platform

| # | Item | Why here | Effort |
|---|------|----------|--------|
| 29 | **Mobile app foundation** [B, V4] | The monorepo split, Bearer auth and Sign in with Apple. Worth starting once the web product retains users — not before, or you'll port a product that's still changing. Note the store prerequisites have their own latency. | 1.5 wk |
| 30 | **Mobile app core loop and ship** [B, V4] | The remaining phases. A real commitment; treat as its own project. | 5–7 wk |
| 31 | **Split `lib/stats.ts`** [B33] | 524 lines and growing. Do it when it next fights you, not on a schedule. | 2 h |
| 32 | **Delete dead code** [B34] | `scripts/seed-problems.ts`, `npm run seed`, `listTopics()` and their doc references. Thirty minutes of clarity for whoever reads this next. | 30 min |
| 33 | **E2E tests** [B32] | Playwright is already installed and `/dev-preview` already renders the signed-in chrome. Worth it once the UI stops changing weekly. | 1 day |
| 34 | **Leaderboard at scale** [B35] | Cached for 60 s, which holds to a few hundred users. Revisit when analytics (item 18) shows you're approaching that, not before. | 1 day |
| 35 | **Model fallback** [B30] | Depends on what item 12 concludes. If you pay Groq, this may never be needed. | 1 day |

---

## Deliberately not near the top

Not bad ideas — wrong time. Each has a condition that should promote it.

| Item | Why it waits | Promote when |
|------|--------------|--------------|
| **Algorithm cinema** [B23] | Four days for delight on a feature users reach only after failing. Beautiful, not load-bearing. | Counterexamples prove popular in analytics |
| **Custom problems** [B24] | Opens a moderation burden and a prompt-injection surface on day one. | Users ask for it more than once |
| **Problem sets / playlists** [B15] | Explore and topics already solve discovery. Adds a table and UI for a problem you've solved twice. | Analytics shows people hunting for structure |
| **Export history as PDF** [B25] | Nobody has asked. Assumes a use case that may not exist. | Someone asks |
| **Vercel KV rate limiting** [B36] | The Postgres function is correct and atomic. This is optimisation without measurement. | Analytics shows rate-limit latency matters |
| **Keyboard logo swap** | Blocked on two PNG files that don't exist on disk. Fifteen minutes once they do. | You save the files |
| **Theme toggle removal** | Apple's guidance says follow the system; the toggle works fine. Pure judgement, zero user impact. | Never, unless it bothers you |

---

## If you only have two weeks

Days 1–2: items 1–5 (the five-minute fixes plus the policy pages, so OAuth review starts
running in the background). Days 3–5: items 6, 7, 8 — you'll know when things break and
when grading drifts. Day 6: items 9, 10, 11. Week 2: items 13, 14, 15, 16 — a cold user gets
a coherent first session and a reason to come back tomorrow.

That ordering leaves the product with no new features and a far better chance of surviving
contact with real users, which is the correct trade at this stage.
