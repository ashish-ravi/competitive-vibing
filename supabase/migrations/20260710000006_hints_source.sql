-- V2: progressive hints + source attribution on problems.
-- hints: ["nudge", "bigger nudge", "almost the approach"] — revealed one at a
-- time in the UI, generated and verified at import time.
-- source: { canon, canon_url, note } — which public canon list the problem
-- concept came from; statements themselves are original.

ALTER TABLE public.problems
  ADD COLUMN hints jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN source jsonb;

NOTIFY pgrst, 'reload schema';
