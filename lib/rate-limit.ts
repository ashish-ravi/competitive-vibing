import { getServiceDb } from '@/lib/db';

export const EVALUATIONS_PER_HOUR = 10;

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the window resets. 0 when allowed. */
  retryAfter: number;
}

/**
 * Consume one evaluation-unit from the user's hourly budget (10/hour).
 * Units are spent by: initial evaluation, interview finalize, counterexample.
 * Interview answers are free (no AI call). Atomic via Postgres function.
 */
export async function consumeRateLimit(userId: string): Promise<RateLimitResult> {
  const db = getServiceDb();
  const { data, error } = await db.rpc('consume_rate_limit', {
    p_user_id: userId,
    p_limit: EVALUATIONS_PER_HOUR,
  });

  if (error) throw new Error(`Rate limit check failed: ${error.message}`);

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error('Rate limit check returned no result');
  return { allowed: Boolean(row.allowed), retryAfter: Number(row.retry_after) || 0 };
}
