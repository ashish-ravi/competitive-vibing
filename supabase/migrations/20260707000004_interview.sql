-- Socratic AI Interviewer: extends evaluations (1:1 with an evaluation,
-- max 3 turns, so JSONB columns beat a join table and history stays a
-- single-table query under the existing RLS policy).

ALTER TABLE public.evaluations
  ADD COLUMN followup_questions jsonb,
  ADD COLUMN interview_turns jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN interview_status text NOT NULL DEFAULT 'none'
    CHECK (interview_status IN ('none', 'active', 'complete')),
  ADD COLUMN final_verdict text
    CHECK (final_verdict IN ('correct', 'partial', 'incorrect')),
  ADD COLUMN final_score smallint
    CHECK (final_score BETWEEN 0 AND 100),
  ADD COLUMN final_assessment jsonb;

COMMENT ON COLUMN public.evaluations.followup_questions IS
  'Array of 1-3 interviewer follow-up questions generated with the initial evaluation';
COMMENT ON COLUMN public.evaluations.interview_turns IS
  'Array of { index, question, answer, answered_at }';
