-- Counterexample Engine: stores the verified failing input + walkthrough
-- for evaluations with a partial/incorrect verdict.

ALTER TABLE public.evaluations
  ADD COLUMN counterexample jsonb,
  ADD COLUMN counterexample_status text NOT NULL DEFAULT 'none'
    CHECK (counterexample_status IN ('none', 'pending', 'verified', 'failed'));

COMMENT ON COLUMN public.evaluations.counterexample IS
  '{ input, expected_output, approach_output, steps[{step,action,state}], why_it_breaks, verified, attempts, model }';
