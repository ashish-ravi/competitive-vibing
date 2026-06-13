# Frontend Rules

## Component Patterns

- Use **shadcn/ui** for all primitive components (Button, Card, Badge, Textarea, Dialog, Skeleton). Do not build custom primitives from scratch.
- Compose components from primitives; don't reach for a third-party library for something shadcn/ui already covers.
- Components live in `components/`. Name them PascalCase. Each component is one file.
- Co-locate component-specific types in the same file as the component (no separate `types.ts` per component).
- Use `cn()` (from `lib/utils.ts`) for conditional class merging, never string interpolation.

---

## Routing

- Use Next.js App Router. Pages are `app/**/page.tsx`.
- Route segments: `app/page.tsx` (dashboard), `app/problems/[slug]/page.tsx` (problem detail), `app/history/page.tsx`.
- Use `loading.tsx` alongside every page that fetches data — show skeleton UI, not a generic spinner.
- Use `error.tsx` alongside every page — never let an unhandled promise rejection produce a blank screen.
- Server Components for data fetching. Client Components only when you need interactivity, hooks, or browser APIs. Mark with `"use client"` explicitly.

---

## State Management

- No global state library (no Redux, Zustand, Jotai) in V1. Server state via React Query or Next.js cache is sufficient.
- Evaluation state (pending / streaming / complete / error) is local component state in `ExplanationInput.tsx` + `EvaluationResult.tsx`.
- Auth state comes from `useSession()` (NextAuth). Never store user info in a separate state store.
- URL is the source of truth for filters (topic, difficulty). Use `useSearchParams` + `router.replace`.

---

## Form Behavior

- `ExplanationInput` is a controlled `<textarea>` with a character counter (max 1500 chars).
- Disable the Evaluate button while a submission is in flight — never allow double-submit.
- Clear the evaluation result when the user edits their explanation after a completed evaluation.
- Show a "You've reached the rate limit" message inline (not a toast) if the API returns 429.

---

## Responsive Rules

- Breakpoints: `sm` = 640px, `md` = 768px, `lg` = 1024px. The app layout shifts at `md`.
- Mobile (< md): single column. Problem detail and evaluation panel stack vertically.
- Desktop (≥ md): two-column split — problem statement left, explanation + result right.
- Tailwind classes: mobile-first (`text-sm md:text-base`, not the reverse).
- Images/avatars: always use `next/image` with explicit `width` and `height`.

---

## Dark Mode

- Use Tailwind's `class` dark mode strategy (`darkMode: 'class'` in `tailwind.config.ts`).
- Default: respect OS preference via `<html class="dark">` set in `layout.tsx` with a script tag (no flash).
- All color tokens must have explicit dark variants. Never use `gray-900` without `dark:gray-100`.

---

## Streaming UI

- The evaluate endpoint streams newline-delimited JSON chunks. Parse with `ReadableStream` + `TextDecoder`.
- As chunks arrive, update component state incrementally — do not buffer and render all at once.
- Show a pulsing cursor at the end of streaming text until `{ "type": "done" }` is received.
- If the stream errors mid-flight, show whatever partial content arrived + an inline error notice.
