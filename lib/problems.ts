import { cache } from 'react';
import {
  getServiceDb,
  PROBLEM_LIST_COLUMNS,
  PROBLEM_PUBLIC_COLUMNS,
  type Difficulty,
  type ProblemListItem,
  type ProblemRow,
  type PublicProblem,
} from '@/lib/db';

export interface ProblemFilters {
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export const DIFFICULTY_RANK: Record<Difficulty, number> = { easy: 0, medium: 1, hard: 2 };

/** Easy → medium → hard, then by title. */
export function canonicalOrder(
  a: Pick<ProblemListItem, 'difficulty' | 'title'>,
  b: Pick<ProblemListItem, 'difficulty' | 'title'>
): number {
  return DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty] || a.title.localeCompare(b.title);
}

/**
 * The whole bank, light columns, canonical order. Wrapped in React `cache`
 * so the several stats helpers that need it during one request share a
 * single query instead of each fetching their own copy.
 */
export const listAllProblems = cache(async (): Promise<ProblemListItem[]> => {
  const db = getServiceDb();
  const { data, error } = await db.from('problems').select(PROBLEM_LIST_COLUMNS);
  if (error) throw new Error(`Failed to list problems: ${error.message}`);
  return ((data ?? []) as unknown as ProblemListItem[]).sort(canonicalOrder);
});

/** List problems for browse/table views — light columns only. */
export async function listProblems(filters: ProblemFilters = {}): Promise<ProblemListItem[]> {
  if (!filters.difficulty && !filters.topic) return listAllProblems();

  const db = getServiceDb();
  let query = db
    .from('problems')
    .select(PROBLEM_LIST_COLUMNS)
    .order('difficulty', { ascending: true })
    .order('title', { ascending: true });

  if (filters.difficulty) query = query.eq('difficulty', filters.difficulty);
  if (filters.topic) query = query.contains('topics', [filters.topic]);

  const { data, error } = await query;
  if (error) throw new Error(`Failed to list problems: ${error.message}`);
  return (data ?? []) as unknown as ProblemListItem[];
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
