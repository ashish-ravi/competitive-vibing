# Backend Rules

## API Conventions

- All API routes live in `app/api/*/route.ts`.
- Every route handler exports named functions: `GET`, `POST`, `PUT`, `DELETE` — no default export.
- Respond with `NextResponse.json(body, { status })`. Never use raw `Response` for JSON.
- All success responses wrap data: `{ data: ... }`.
- All error responses use the standard error shape (see Error Shapes below).
- Route handlers are thin: validate input → call a service function → return response. Business logic belongs in `lib/`, not in route handlers.

---

## Auth Handling

- Every route (except `/api/auth/*`) must begin with a session check:
  ```ts
  const session = await auth(); // NextAuth v5
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  ```
- Never trust client-provided `user_id`. Always derive it from `session.user.id`.
- Use Supabase Row-Level Security as a second layer, but do not rely on it as the only auth check.

---

## Validation

- Validate all request bodies with **Zod** before using any field.
- Invalid input → `400` with `{ error: 'Validation failed', details: ZodError.flatten() }`.
- Never pass unvalidated user input to the database or to the AI prompt.
- Max lengths: explanation text = 1500 chars, problem slug = 100 chars.

---

## Error Shapes

All errors follow this shape:

```json
{
  "error": "Human-readable message",
  "code": "MACHINE_READABLE_CODE",
  "details": {}
}
```

Standard codes:

| HTTP | Code | When |
|------|------|------|
| 400 | `VALIDATION_ERROR` | Invalid input |
| 401 | `UNAUTHORIZED` | Missing/invalid session |
| 403 | `FORBIDDEN` | Valid session, wrong resource |
| 404 | `NOT_FOUND` | Resource doesn't exist |
| 429 | `RATE_LIMITED` | Per-user rate limit hit |
| 500 | `INTERNAL_ERROR` | Unhandled exception |
| 503 | `AI_UNAVAILABLE` | Groq API unreachable |

---

## Database Access

- All DB access goes through `lib/db.ts` which exports a typed Supabase client.
- Use parameterized queries only. Never interpolate user input into query strings.
- Every table has Row-Level Security enabled. Policies are defined in migrations, not in application code.
- Migrations live in `supabase/migrations/` and are named `YYYYMMDDHHMMSS_description.sql`.
- Never alter a column in production — add a nullable column, migrate data, then drop the old one.

---

## Evaluate Route Specifics

- Route: `POST /api/evaluate`
- Returns a `ReadableStream` of newline-delimited JSON chunks.
- Before calling Groq: check per-user rate limit (10 evaluations/hour, enforced in Redis or Supabase counter).
- After stream completes: persist the full evaluation to `evaluations` table (do not persist per-chunk).
- If Groq returns a non-200: return `503` immediately with `AI_UNAVAILABLE`.
- Token limit for user explanation input: 500 tokens (trim at the service layer, not the UI layer).

---

## Logging

- Use `console.error` for server-side errors with enough context to debug (user ID, problem ID, error message).
- Never log the full AI prompt or user explanation (PII / potential injection content).
- Never log session tokens, API keys, or anything in `process.env`.
