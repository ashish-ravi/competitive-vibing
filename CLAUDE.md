# AlgoExplain — CLAUDE.md

## What This App Is

AlgoExplain is a mobile-first web app for coding interview practice. Users read a problem, explain their algorithm in natural language or pseudocode, and an AI evaluates their approach — checking correctness, edge cases, and complexity — without ever running code.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| UI | React + Tailwind CSS + shadcn/ui |
| Auth | NextAuth.js v5 (Google OAuth) |
| Database | Supabase (PostgreSQL + Row-Level Security) |
| AI | Groq API — `llama-3.3-70b-versatile` |
| Deployment | Vercel |
| Language | TypeScript (strict mode) |

---

## Repo Structure

```
/
├── app/                        # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx                # Dashboard / problem list
│   ├── problems/[slug]/
│   │   └── page.tsx            # Problem detail + explanation input
│   ├── history/
│   │   └── page.tsx
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── problems/route.ts
│       ├── problems/[slug]/route.ts
│       ├── evaluate/route.ts   # Streaming Groq evaluation (+ follow-up questions)
│       ├── history/route.ts
│       ├── history/[id]/route.ts
│       ├── interview/answer/route.ts    # Socratic interviewer: record answer (no AI call)
│       ├── interview/finalize/route.ts  # Socratic interviewer: streaming final assessment
│       └── counterexample/route.ts      # Counterexample engine: generate → verify → stream
├── components/                 # Shared UI components
├── lib/
│   ├── db.ts                   # Supabase client
│   ├── auth.ts                 # NextAuth config
│   └── groq.ts                 # Groq API wrapper
├── supabase/
│   └── migrations/             # SQL migration files (run in order)
├── docs/                       # PRD, architecture, roadmap, prompts
└── .claude/
    └── rules/                  # Claude Code behavioral rules
```

---

## Key Commands

```bash
# Development
npm run dev

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Run Supabase migrations (local)
npx supabase db push

# Seed problems (AI-generated via Groq)
npx tsx scripts/seed-problems.ts

# Deploy (Vercel auto-deploys on push to main)
git push origin main
```

---

## Environment Variables

```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GROQ_API_KEY=
```

---

## Frontend Design

Use the **21st.dev Magic MCP** plugin when building or refining UI components. It provides access to a library of beautiful, production-ready React + Tailwind components. Prefer components from this plugin over building from scratch when a suitable one exists — it keeps the visual quality high and reduces custom CSS.

To use it: invoke the `21st_magic_component_builder` tool with a description of the component you need.

---

## Workflow for Claude Code

- Work milestone by milestone (see `docs/roadmap.md`)
- Each milestone = a reviewable PR or commit batch
- Read `docs/prd.md` for scope boundaries before adding features
- Follow rules in `.claude/rules/` — they are non-negotiable
- Use streaming for all AI responses (never buffer the full response)
- Never write raw SQL outside of `lib/db.ts` or `supabase/migrations/`
- Always validate user input at the API route boundary
- Always check mobile layout — this is a mobile-first app

---

## Non-Negotiables

1. **Mobile first.** Every UI decision must work on a 390px viewport first. Test on mobile before marking done.
2. **Streaming AI responses.** The evaluate endpoint must stream chunks, never batch.
3. **No code execution.** The app evaluates natural language — it never runs user code. Do not add a code runner.
4. **Auth required everywhere.** Every API route (except `/api/auth/*`) must verify the session and return 401 if missing.
5. **Structured AI output.** The Groq call must use `response_format: { type: "json_schema" }`. Never parse free-form text.
6. **Rate limiting.** Evaluate endpoint enforces per-user limits (10 evaluations/hour). See `.claude/rules/security.md`.
7. **No scope creep.** V1 scope is defined in `docs/prd.md`. Do not implement V2 features until V1 ships.
