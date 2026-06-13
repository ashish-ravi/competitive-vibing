# Security Rules

## Authentication & Session

- Every API route (except `/api/auth/*`) must verify the session server-side via `auth()` from NextAuth v5.
- Return `401` immediately if session is missing or expired — before any DB query or AI call.
- Session tokens are managed by NextAuth + Supabase adapter. Never store session data in `localStorage` or cookies manually.
- `NEXTAUTH_SECRET` must be a 32+ byte random string. Rotate it only during a planned maintenance window (invalidates all sessions).

---

## Token & Key Handling

- All secrets live in environment variables. Never hardcode API keys, DB URLs, or secrets anywhere in the codebase.
- Never log environment variable values, even in debug output.
- `SUPABASE_SERVICE_ROLE_KEY` is only used server-side (in API routes and scripts). Never expose it to the client bundle.
- `SUPABASE_ANON_KEY` is safe to expose client-side but grants only RLS-restricted access.
- Groq API key (`GROQ_API_KEY`) is server-side only — the evaluate endpoint proxies the call, never exposing the key to the client.

---

## Rate Limiting

- The `/api/evaluate` endpoint enforces per-user rate limiting: **10 evaluations per hour**.
- Implementation: use a `rate_limits` table in Supabase or an in-memory counter backed by Vercel KV.
- On limit hit: return `429` with `{ error: "Rate limit exceeded", code: "RATE_LIMITED", retryAfter: <seconds> }`.
- Do not expose the exact counter value in the response — only `retryAfter`.
- The problem list and history endpoints are read-only and not rate-limited in V1 (revisit if abuse appears).

---

## Prompt Injection Precautions

- The user's explanation is untrusted input. It must be sanitized before being included in the AI prompt.
- Sanitization steps (in `lib/groq.ts`):
  1. Truncate to 1500 characters max (already enforced at validation layer — add a second truncation as defense-in-depth).
  2. Strip `<`, `>` characters to prevent XML/HTML injection into structured prompts.
  3. Do NOT allow the user input to modify the system prompt. User text appears only in a clearly delimited user message block.
- The system prompt and problem context must appear in the `system` role. User explanation must appear in the `user` role. Never concatenate them into a single string.
- Use Groq's JSON schema mode to constrain output — this limits damage if the model is successfully prompted to produce unexpected text.

---

## PII Handling

- The only PII stored is: user email, name, avatar URL (from Google OAuth).
- Evaluations store the user's explanation text. This is considered PII-adjacent — handle with care.
- Do not log user explanation text server-side (it may contain personal problem-solving notes).
- Do not include user email or name in AI prompts.
- On user deletion (future feature): cascade-delete evaluations via `ON DELETE CASCADE` FK constraint.

---

## Input Validation

- All `POST`/`PUT` body fields are validated with Zod at the API route before any processing.
- Problem slug in URL params is validated as alphanumeric + hyphens, max 100 chars.
- Never use user-supplied strings in raw SQL. Use Supabase's parameterized query API only.
- File uploads are not supported in V1 — if a request includes a file, reject it with `400`.

---

## Supabase Row-Level Security

- RLS is enabled on all tables from day one. Never disable it.
- Users may only read/write their own evaluations. Policy:
  ```sql
  CREATE POLICY "users own their evaluations"
    ON evaluations
    USING (user_id = auth.uid());
  ```
- Problems table is read-only for all authenticated users. No user can insert/update problems via the client.
- Admin operations (seeding problems) use the service role key in server-only scripts.

---

## Dependency & Supply Chain

- Keep dependencies minimal. Do not add a new npm package without a clear reason.
- Pin major versions in `package.json`. Run `npm audit` before each milestone deployment.
- No client-side analytics or tracking SDKs in V1 (avoids GDPR surface area).
