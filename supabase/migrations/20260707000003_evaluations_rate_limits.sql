-- Evaluations + rate limits (spec: docs/architecture.md, .claude/rules/security.md)

CREATE TABLE public.evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  problem_id uuid NOT NULL REFERENCES public.problems(id),
  explanation text NOT NULL,
  verdict text NOT NULL CHECK (verdict IN ('correct', 'partial', 'incorrect')),
  score smallint NOT NULL CHECK (score BETWEEN 0 AND 100),
  edge_cases_missed text[] NOT NULL DEFAULT '{}',
  complexity jsonb NOT NULL,
  ai_commentary text NOT NULL,
  full_response jsonb NOT NULL,
  tokens_used int,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX evaluations_user_problem_idx ON public.evaluations (user_id, problem_id);
CREATE INDEX evaluations_user_created_idx ON public.evaluations (user_id, created_at DESC);

ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users own their evaluations"
  ON public.evaluations
  USING (user_id = next_auth.uid());

--
-- Rate limits: fixed hourly windows, 10 evaluation-units/hour/user.
-- Service-role access only — no RLS policies means anon/authenticated
-- roles cannot touch it while RLS is enabled.
--
CREATE TABLE public.rate_limits (
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  window_start timestamptz NOT NULL,
  count smallint NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, window_start)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Atomic consume: upsert-increment in one statement so concurrent requests
-- cannot both pass the check-then-increment gap.
CREATE OR REPLACE FUNCTION public.consume_rate_limit(p_user_id uuid, p_limit int)
RETURNS TABLE (allowed boolean, retry_after int)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_window timestamptz := date_trunc('hour', now());
  v_count smallint;
BEGIN
  INSERT INTO public.rate_limits (user_id, window_start, count)
  VALUES (p_user_id, v_window, 1)
  ON CONFLICT (user_id, window_start)
  DO UPDATE SET count = public.rate_limits.count + 1
  RETURNING public.rate_limits.count INTO v_count;

  IF v_count > p_limit THEN
    RETURN QUERY SELECT
      false,
      GREATEST(1, EXTRACT(EPOCH FROM (v_window + interval '1 hour' - now()))::int);
  ELSE
    RETURN QUERY SELECT true, 0;
  END IF;
END;
$$;
