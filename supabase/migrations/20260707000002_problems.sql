-- Problems table (spec: docs/architecture.md)
-- expected_approach is the internal grading key: used in AI prompts,
-- never returned by any API route (enforced by explicit column selection
-- in lib/db.ts — PROBLEM_PUBLIC_COLUMNS).

CREATE TABLE public.problems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  topics text[] NOT NULL DEFAULT '{}',
  statement text NOT NULL,
  examples jsonb NOT NULL DEFAULT '[]'::jsonb,
  constraints text[] NOT NULL DEFAULT '{}',
  expected_approach jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX problems_difficulty_idx ON public.problems (difficulty);
CREATE INDEX problems_topics_idx ON public.problems USING gin (topics);

ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;

-- Read-only for authenticated users; writes only via service role (seed script).
CREATE POLICY "authenticated users can read problems"
  ON public.problems FOR SELECT
  TO authenticated
  USING (true);
