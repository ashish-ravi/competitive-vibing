import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Difficulty = 'easy' | 'medium' | 'hard';
export type Verdict = 'correct' | 'partial' | 'incorrect';
export type InterviewStatus = 'none' | 'active' | 'complete';
export type CounterexampleStatus = 'none' | 'pending' | 'verified' | 'failed';

export interface ProblemExample {
  input: string;
  output: string;
  explanation: string;
}

export interface ExpectedApproach {
  summary: string;
  algorithm: string;
  time_complexity: string;
  space_complexity: string;
  key_insight: string;
  critical_edge_cases: string[];
}

export interface ProblemSource {
  canon: string;
  canon_url: string;
  note: string;
}

export interface ProblemRow {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  topics: string[];
  statement: string;
  examples: ProblemExample[];
  constraints: string[];
  expected_approach: ExpectedApproach;
  hints: string[];
  source: ProblemSource | null;
  created_at: string;
}

/** Problem shape safe to send to the client — never includes expected_approach. */
export type PublicProblem = Omit<ProblemRow, 'expected_approach'>;

/** Lightweight shape for list/table views — no statement/hints payload. */
export type ProblemListItem = Pick<
  ProblemRow,
  'id' | 'slug' | 'title' | 'difficulty' | 'topics' | 'created_at'
>;

export interface InterviewTurn {
  index: number;
  question: string;
  answer: string;
  answered_at: string;
}

export interface CounterexampleStep {
  step: number;
  action: string;
  state: string;
}

export interface Counterexample {
  input: string;
  expected_output: string;
  approach_output: string;
  steps: CounterexampleStep[];
  why_it_breaks: string;
  verified: boolean;
  attempts: number;
  model: string;
}

export interface EvaluationRow {
  id: string;
  user_id: string;
  problem_id: string;
  explanation: string;
  verdict: Verdict;
  score: number;
  edge_cases_missed: string[];
  complexity: { time: string; space: string; explanation: string };
  ai_commentary: string;
  full_response: Json;
  tokens_used: number | null;
  created_at: string;
  followup_questions: string[] | null;
  interview_turns: InterviewTurn[];
  interview_status: InterviewStatus;
  final_verdict: Verdict | null;
  final_score: number | null;
  final_assessment: Json | null;
  counterexample: Counterexample | null;
  counterexample_status: CounterexampleStatus;
}

export interface RateLimitRow {
  user_id: string;
  window_start: string;
  count: number;
}

/**
 * Explicit column list for problem reads that go to the client.
 * expected_approach is intentionally absent — it is the grading key.
 * (hints ARE client-visible: the UI reveals them progressively.)
 */
export const PROBLEM_PUBLIC_COLUMNS =
  'id, slug, title, difficulty, topics, statement, examples, constraints, hints, source, created_at';

/** Columns for list/table views — skips the heavy statement/hints payload. */
export const PROBLEM_LIST_COLUMNS = 'id, slug, title, difficulty, topics, created_at';

let serviceClient: SupabaseClient | null = null;

/**
 * Service-role Supabase client. Server-side only — bypasses RLS.
 * All access is gated by NextAuth session checks in the API routes;
 * RLS remains enabled on every table as defense-in-depth against
 * anon-key access paths.
 */
export function getServiceDb(): SupabaseClient {
  if (typeof window !== 'undefined') {
    throw new Error('getServiceDb must never be called from client code');
  }
  if (!serviceClient) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
    }
    serviceClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return serviceClient;
}
