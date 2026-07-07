import { getServiceDb, type EvaluationRow } from '@/lib/db';

export const HISTORY_PAGE_SIZE = 20;

/** Evaluation list item joined with public problem fields for display. */
export interface HistoryItem
  extends Pick<
    EvaluationRow,
    | 'id'
    | 'problem_id'
    | 'verdict'
    | 'score'
    | 'created_at'
    | 'interview_status'
    | 'final_verdict'
    | 'final_score'
    | 'counterexample_status'
  > {
  problem: { slug: string; title: string; difficulty: string } | null;
}

export async function listHistory(
  userId: string,
  page: number
): Promise<{ items: HistoryItem[]; hasMore: boolean }> {
  const db = getServiceDb();
  const from = (page - 1) * HISTORY_PAGE_SIZE;
  // Fetch one extra row to detect whether another page exists.
  const { data, error } = await db
    .from('evaluations')
    .select(
      'id, problem_id, verdict, score, created_at, interview_status, final_verdict, final_score, counterexample_status, problem:problems(slug, title, difficulty)'
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, from + HISTORY_PAGE_SIZE);

  if (error) throw new Error(`Failed to list history: ${error.message}`);

  const rows = (data ?? []) as unknown as HistoryItem[];
  return {
    items: rows.slice(0, HISTORY_PAGE_SIZE),
    hasMore: rows.length > HISTORY_PAGE_SIZE,
  };
}

export interface HistoryDetail extends EvaluationRow {
  problem: { slug: string; title: string; difficulty: string } | null;
}

/**
 * Fetch one evaluation with ownership info. Callers must return 403 when
 * the row exists but belongs to another user.
 */
export async function getEvaluationDetail(id: string): Promise<HistoryDetail | null> {
  const db = getServiceDb();
  const { data, error } = await db
    .from('evaluations')
    .select('*, problem:problems(slug, title, difficulty)')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch evaluation: ${error.message}`);
  return data as unknown as HistoryDetail | null;
}

/** Full evaluation row (no join), for interview/counterexample services. */
export async function getEvaluationRow(id: string): Promise<EvaluationRow | null> {
  const db = getServiceDb();
  const { data, error } = await db.from('evaluations').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(`Failed to fetch evaluation: ${error.message}`);
  return data as EvaluationRow | null;
}

export async function countAttempts(userId: string, problemId: string): Promise<number> {
  const db = getServiceDb();
  const { count, error } = await db
    .from('evaluations')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('problem_id', problemId);

  if (error) throw new Error(`Failed to count attempts: ${error.message}`);
  return count ?? 0;
}
