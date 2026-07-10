# Architecture — Competitive Vibing

## Overview

Competitive Vibing is a Next.js monolith deployed on Vercel. There is no separate backend service. API routes act as a BFF (Backend for Frontend) layer, calling Supabase for data and Groq for AI evaluation.

---

## System Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                     Client Browser / Mobile                   │
│          Next.js App Router (React, Tailwind, shadcn/ui)      │
│          NextAuth.js session (Google OAuth)                   │
└───────────────────────┬──────────────────────────────────────┘
                        │ HTTPS
┌───────────────────────▼──────────────────────────────────────┐
│                  Vercel Edge / Node.js Runtime                │
│                  Next.js API Routes (BFF layer)               │
│                                                               │
│  POST /api/evaluate  ──────────────────────────────────────── ┼──► Groq API
│  GET  /api/problems                                           │    llama-3.3-70b-versatile
│  GET  /api/problems/[slug]                                    │    (streaming JSON)
│  GET  /api/history                                            │
│  GET  /api/history/[id]                                       │
│  ANY  /api/auth/[...nextauth]  ─────────────────────────────┐ │
└───────────────────────┬──────────────────────────────────────┘
                        │                               │
┌───────────────────────▼───────────────────────────────▼──────┐
│                        Supabase (PostgreSQL)                  │
│   Tables: users, problems, evaluations, rate_limits           │
│   Row-Level Security on all tables                            │
│   NextAuth adapter stores sessions here                       │
└──────────────────────────────────────────────────────────────┘
```

---

## Services

### Client (Next.js App Router)

- Server Components fetch data directly from Supabase or API routes during SSR
- Client Components handle interactivity: explanation input, streaming evaluation display, filter state
- No client-side data fetching library in V1 — use `fetch` + React state for evaluate; native Next.js caching for problem data

### API Routes (BFF)

| Route | Runtime | Notes |
|-------|---------|-------|
| `/api/evaluate` | Node.js | Must be Node (not Edge) — uses `ReadableStream` with Groq streaming |
| `/api/problems` | Edge | Read-only, cache-friendly |
| `/api/problems/[slug]` | Edge | Read-only, cache-friendly |
| `/api/history` | Node.js | Requires auth session |
| `/api/auth/[...nextauth]` | Node.js | NextAuth requirement |

### Supabase

- PostgreSQL database with RLS
- NextAuth v5 Supabase adapter for session management
- Admin access via `SUPABASE_SERVICE_ROLE_KEY` in server-only scripts (seed, migrations)
- Client access via `SUPABASE_ANON_KEY` with RLS enforcement

### Groq API

- OpenAI-compatible API (`/chat/completions`)
- Model: `meta-llama/llama-4-scout-17b-16e-instruct` (default, env-overridable via `GROQ_MODEL`). Must support `json_schema` structured outputs — `llama-3.3-70b-versatile` does not, and `gpt-oss-120b` does but has only 8k TPM on the free tier (too small for one full request); llama-4-scout has 30k TPM.
- `response_format: { type: "json_schema", json_schema: { ... } }` enforces structured output. Because this yields a single JSON blob, the call is a normal (non-streamed) completion; the client-facing streaming is the route re-emitting parsed fields as NDJSON (see `docs/prompts/evaluate-system.md`).
- Reasoning models (`gpt-oss-*`) additionally take a `reasoning_effort` knob; `lib/groq.ts` sets it automatically and skips it for non-reasoning models.
- Called only from server routes (`/api/evaluate`, `/api/interview/finalize`, `/api/counterexample`) and the seed script — never from the client.

---

## Data Flow: Evaluation Request

```
User taps "Evaluate"
  │
  ▼
Client POST /api/evaluate { problem_id, explanation }
  │
  ├─ 1. Verify session (NextAuth)
  ├─ 2. Validate input (Zod)
  ├─ 3. Check rate limit (Supabase rate_limits table)
  ├─ 4. Fetch problem context from Supabase
  ├─ 5. Build Groq prompt (system + user messages)
  ├─ 6. Stream Groq response → pipe to client as NDJSON chunks
  │       chunk: { type: "verdict", value: "partial" }
  │       chunk: { type: "commentary", delta: "Your approach..." }
  │       chunk: { type: "edge_cases", value: ["empty array"] }
  │       chunk: { type: "complexity", value: { time: "O(n)", space: "O(1)" } }
  │       chunk: { type: "done", evaluation_id: "uuid" }
  └─ 7. After stream ends: persist full evaluation to Supabase
         (fire-and-forget with error logging)
  │
  ▼
Client receives chunks, updates UI progressively
```

---

## Database Schema

```sql
-- Users (managed by NextAuth Supabase adapter)
users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  name          TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  preferences   JSONB DEFAULT '{}'
)

-- Problems (seeded by AI generation script)
problems (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              TEXT UNIQUE NOT NULL,
  title             TEXT NOT NULL,
  difficulty        TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  topics            TEXT[],
  statement         TEXT NOT NULL,          -- markdown
  examples          JSONB NOT NULL,         -- [{ input, output, explanation }]
  constraints       TEXT[],
  expected_approach JSONB,                  -- internal: used in AI system prompt
  created_at        TIMESTAMPTZ DEFAULT now()
)

-- Evaluations
evaluations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES users(id) ON DELETE CASCADE,
  problem_id        UUID REFERENCES problems(id),
  explanation       TEXT NOT NULL,
  verdict           TEXT CHECK (verdict IN ('correct', 'partial', 'incorrect')),
  score             SMALLINT,
  edge_cases_missed TEXT[],
  complexity        JSONB,                  -- { time, space, explanation }
  ai_commentary     TEXT,
  full_response     JSONB,                  -- complete AI output, for debugging
  tokens_used       INT,
  created_at        TIMESTAMPTZ DEFAULT now()
)

-- Rate limits
rate_limits (
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  window_start TIMESTAMPTZ NOT NULL,
  count       SMALLINT DEFAULT 0,
  PRIMARY KEY (user_id, window_start)
)

-- Indexes
CREATE INDEX ON evaluations(user_id, problem_id);
CREATE INDEX ON evaluations(user_id, created_at DESC);
CREATE INDEX ON problems(difficulty);
CREATE INDEX ON problems USING GIN(topics);
```

---

## Key Architectural Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Monolith vs microservices | Monolith (Next.js) | Solo developer, V1 scope, easier to deploy |
| Separate backend vs BFF | BFF (API routes) | No need for a separate server; Vercel handles scaling |
| Database | Supabase (Postgres) | Managed, RLS built-in, NextAuth adapter available |
| Auth | NextAuth v5 + Google | Standard, battle-tested, minimal setup |
| AI provider | Groq | Free tier, fast, OpenAI-compat, streaming + JSON schema |
| State management | Local + URL | No global state needed in V1; avoid premature complexity |
| CSS | Tailwind + shadcn/ui | Consistent design tokens, accessible primitives |
