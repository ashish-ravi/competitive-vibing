import {
  getServiceDb,
  PROBLEM_PUBLIC_COLUMNS,
  type ProblemRow,
  type PublicProblem,
} from '@/lib/db';

export interface ProblemFilters {
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

/** List problems for the client — never includes expected_approach. */
export async function listProblems(filters: ProblemFilters = {}): Promise<PublicProblem[]> {
  const db = getServiceDb();
  let query = db
    .from('problems')
    .select(PROBLEM_PUBLIC_COLUMNS)
    .order('difficulty', { ascending: true })
    .order('title', { ascending: true });

  if (filters.difficulty) query = query.eq('difficulty', filters.difficulty);
  if (filters.topic) query = query.contains('topics', [filters.topic]);

  const { data, error } = await query;
  if (error) throw new Error(`Failed to list problems: ${error.message}`);
  return (data ?? []) as unknown as PublicProblem[];
}

/** Fetch one problem for the client — never includes expected_approach. */
export async function getPublicProblemBySlug(slug: string): Promise<PublicProblem | null> {
  const db = getServiceDb();
  const { data, error } = await db
    .from('problems')
    .select(PROBLEM_PUBLIC_COLUMNS)
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw new Error(`Failed to fetch problem: ${error.message}`);
  return data as unknown as PublicProblem | null;
}

/** Full problem row including expected_approach — server/AI use only. */
export async function getFullProblemById(id: string): Promise<ProblemRow | null> {
  const db = getServiceDb();
  const { data, error } = await db.from('problems').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(`Failed to fetch problem: ${error.message}`);
  return data as ProblemRow | null;
}

/** Distinct topic list for filter chips. */
export async function listTopics(): Promise<string[]> {
  const db = getServiceDb();
  const { data, error } = await db.from('problems').select('topics');
  if (error) throw new Error(`Failed to list topics: ${error.message}`);
  const all = new Set<string>();
  for (const row of data ?? []) {
    for (const t of (row.topics as string[]) ?? []) all.add(t);
  }
  return [...all].sort();
}
