# Competitive Vibing

Interview prep for the thinking part. You read a problem, explain your algorithm in plain
English or pseudocode, and an AI interviewer grades the approach — correctness, edge cases,
complexity, clarity — then asks the follow-up questions a real interview would. No code is
ever run.

**Live:** deployed on Vercel from `main`.

## What it does

- **150 problems** from the Blind 75 / NeetCode 150 canon, rewritten as original statements
  with three progressive hints each.
- **Streaming evaluation** against a fixed rubric (40 correctness / 30 edge cases /
  20 complexity / 10 clarity) with a verdict of correct, partial, or needs work.
- **Socratic interview** — two or three follow-up questions after the evaluation; the final
  assessment can move the score up or down, like a real interview.
- **Counterexample engine** — for a flawed approach, an independently verified input where it
  breaks, traced step by step. Never shown unless a second model confirms it.
- **Progress** — XP, levels, streaks (solve days only), badges, per-topic progress, a roadmap
  from beginner to interview-ready, and an opt-in leaderboard.

## Stack

Next.js 14 (App Router, TypeScript strict) · Tailwind · NextAuth v5 (Google) ·
Supabase Postgres with RLS · Groq (Llama 4 Scout for grading, gpt-oss for counterexamples) ·
Vercel.

## Local setup

Prerequisites: Node 20+, a Supabase project, a Google OAuth client, a Groq API key.

```bash
git clone <repo> && cd competitive-vibing
npm install
cp .env.example .env.local        # fill in every value
```

**Google OAuth** — in Google Cloud console create an OAuth client (Web application) and add
`http://localhost:3000/api/auth/callback/google` as an authorised redirect URI. Add your
production URL the same way.

**Supabase** — create a project, then run every file in `supabase/migrations/` in order in
the SQL editor (or `npx supabase db push`). Two things the migrations need that the dashboard
must expose:

1. Settings → API → *Exposed schemas*: add `next_auth`.
2. If sign-in later returns "Server error", run `supabase/fix_grants.sql` — it repairs the
   `next_auth` grants and reloads PostgREST.

**Free tier note:** Supabase pauses free projects after about a week of inactivity, which
breaks sign-in. The daily cron in `vercel.json` (`/api/cron/keepalive`) keeps it awake once
`CRON_SECRET` is set in Vercel; on a paid plan it's unnecessary.

**Problem bank**

```bash
npm run import            # builds all 150 problems via Groq (~20 min on the free tier)
npm run import -- --fresh # wipe and rebuild
```

**Run**

```bash
npm run dev               # http://localhost:3000
npx tsc --noEmit          # type check
npm run lint
npm run build
```

## Project layout

```
app/                  routes (App Router); every page has loading.tsx + error.tsx
  api/                JSON + NDJSON streaming endpoints; all session-gated except /api/auth
  dev-preview/        signed-out visual harness with fake data (404s in production)
components/           UI; components/ui holds the primitives (Button, Card, Badge…)
lib/                  auth, db, groq, prompts, schemas, evaluation, interview,
                      counterexample, stats (XP/streak/badges/leaderboard), roadmap
scripts/              import-problems.ts (problem bank), _shots.mjs (Playwright screenshots)
supabase/migrations/  schema, RLS policies, the atomic rate-limit function
docs/                 PRD, architecture, prompts, roadmap (history), backlog (what's next)
.claude/rules/        non-negotiable engineering rules (auth, validation, streaming, mobile)
```

## Screenshot QA

```bash
npx next dev -p 3100
node scripts/_shots.mjs ./shots     # dashboard, menu, roadmap, problem page; light + dark
```

`/dev-preview?view=roadmap|drawer|problem|cards` renders the signed-in chrome without OAuth.

## Rate limits and cost

Each user gets 10 AI units per hour, enforced atomically in Postgres (`consume_rate_limit`).
An evaluation, a final interview assessment, and a counterexample each cost one unit;
recording an interview answer is free. Groq's free tier caps tokens per minute per model,
which is why grading, counterexample generation, and verification use three different models.

## Security

- Only Google name, email and avatar are stored. Explanations are stored per user and
  never logged.
- Every table has RLS. The service-role key is used only server-side, behind a session check.
- User text is truncated and stripped of angle brackets before reaching a prompt, and only
  ever appears in the `user` role. Model output is constrained by JSON schema.
- Security headers (CSP, HSTS, frame denial) are set in `next.config.mjs`.
- Accounts can be deleted from the Profile page; deletion cascades to every evaluation.

## What's next

- [`docs/priorities.md`](docs/priorities.md) — **start here.** Every outstanding item ranked
  into one ordered sequence, with the reasoning and a two-week plan.
- [`docs/backlog.md`](docs/backlog.md) — the full catalogue, grouped by version: launch
  blockers, feature versions, the mobile app plan, AI-quality work, codebase cleanups.
- [`docs/roadmap.md`](docs/roadmap.md) — history; what shipped and when.

## Contributing

Read `CLAUDE.md` and `.claude/rules/` first — they define the non-negotiables (mobile-first,
streaming, no code execution, auth on every route, structured AI output). CI runs type-check,
lint and build on every push.
