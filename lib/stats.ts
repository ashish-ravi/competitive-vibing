import { getServiceDb, type Difficulty, type Verdict } from '@/lib/db';

// ---------------------------------------------------------------------------
// Topic display names
// ---------------------------------------------------------------------------

export const TOPIC_LABELS: Record<string, string> = {
  'arrays-hashing': 'Arrays & Hashing',
  'two-pointers': 'Two Pointers',
  'sliding-window': 'Sliding Window',
  stack: 'Stack',
  'binary-search': 'Binary Search',
  'linked-list': 'Linked List',
  trees: 'Trees',
  tries: 'Tries',
  heap: 'Heap / Priority Queue',
  backtracking: 'Backtracking',
  graphs: 'Graphs',
  'advanced-graphs': 'Advanced Graphs',
  'dp-1d': 'Dynamic Programming I',
  'dp-2d': 'Dynamic Programming II',
  greedy: 'Greedy',
  intervals: 'Intervals',
  'math-geometry': 'Math & Geometry',
  'bit-manipulation': 'Bit Manipulation',
  // V1 seed topics (still valid if present)
  arrays: 'Arrays',
  strings: 'Strings',
  'hash-map': 'Hash Map',
  'dynamic-programming': 'Dynamic Programming',
};

export function topicLabel(topic: string): string {
  return (
    TOPIC_LABELS[topic] ??
    topic.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

// ---------------------------------------------------------------------------
// XP model (roadmap: weighted by difficulty and verdict)
// ---------------------------------------------------------------------------

const XP_BASE: Record<Difficulty, number> = { easy: 10, medium: 25, hard: 40 };
const XP_MULTIPLIER: Record<Verdict, number> = { correct: 1, partial: 0.4, incorrect: 0.1 };
const XP_INTERVIEW_BONUS = 5;

export function evaluationXp(e: {
  difficulty: Difficulty;
  verdict: Verdict;
  final_verdict: Verdict | null;
  interview_status: string;
}): number {
  const verdict = e.final_verdict ?? e.verdict;
  let xp = Math.round(XP_BASE[e.difficulty] * XP_MULTIPLIER[verdict]);
  if (e.interview_status === 'complete') xp += XP_INTERVIEW_BONUS;
  return xp;
}

/** Level thresholds: level n starts at 250·(n−1) XP. */
export function levelFromXp(xp: number): { level: number; intoLevel: number; forNext: number } {
  const level = Math.floor(xp / 250) + 1;
  return { level, intoLevel: xp % 250, forNext: 250 };
}

// ---------------------------------------------------------------------------
// Internal: one joined fetch of a user's evaluations with problem facts
// ---------------------------------------------------------------------------

interface EvalFact {
  problem_id: string;
  verdict: Verdict;
  final_verdict: Verdict | null;
  score: number;
  final_score: number | null;
  interview_status: string;
  counterexample_status: string;
  created_at: string;
  problem: { slug: string; title: string; difficulty: Difficulty; topics: string[] } | null;
}

async function fetchEvalFacts(userId: string): Promise<EvalFact[]> {
  const db = getServiceDb();
  const { data, error } = await db
    .from('evaluations')
    .select(
      'problem_id, verdict, final_verdict, score, final_score, interview_status, counterexample_status, created_at, problem:problems(slug, title, difficulty, topics)'
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(`Failed to fetch evaluations: ${error.message}`);
  return (data ?? []) as unknown as EvalFact[];
}

// ---------------------------------------------------------------------------
// Problem statuses for the browse table
// ---------------------------------------------------------------------------

export type ProblemStatus = { status: 'solved' | 'attempted'; bestScore: number };

export async function getProblemStatuses(userId: string): Promise<Record<string, ProblemStatus>> {
  const facts = await fetchEvalFacts(userId);
  const map: Record<string, ProblemStatus> = {};
  for (const f of facts) {
    const verdict = f.final_verdict ?? f.verdict;
    const score = Math.max(f.score, f.final_score ?? 0);
    const prev = map[f.problem_id];
    const solved = verdict === 'correct' || prev?.status === 'solved';
    map[f.problem_id] = {
      status: solved ? 'solved' : 'attempted',
      bestScore: Math.max(prev?.bestScore ?? 0, score),
    };
  }
  return map;
}

// ---------------------------------------------------------------------------
// Streak
// ---------------------------------------------------------------------------

function utcDay(iso: string): string {
  return iso.slice(0, 10);
}

export function computeStreak(datesDesc: string[]): number {
  if (datesDesc.length === 0) return 0;
  const days = [...new Set(datesDesc.map(utcDay))].sort().reverse();
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  if (days[0] !== today && days[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(`${days[i - 1]}T00:00:00Z`).getTime();
    const cur = new Date(`${days[i]}T00:00:00Z`).getTime();
    if (prev - cur === 86_400_000) streak++;
    else break;
  }
  return streak;
}

// ---------------------------------------------------------------------------
// Badges (derived, no award table — deterministic from history)
// ---------------------------------------------------------------------------

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
}

function computeBadges(input: {
  totalEvals: number;
  solvedCount: number;
  solvedHard: number;
  streak: number;
  interviewsComplete: number;
  counterexamplesSeen: number;
  topicFullySolved: boolean;
}): Badge[] {
  return [
    { id: 'warming-up', name: 'Warming Up', description: 'Submit your first explanation', icon: '🔥', earned: input.totalEvals >= 1 },
    { id: 'first-blood', name: 'First Blood', description: 'First correct verdict', icon: '🎯', earned: input.solvedCount >= 1 },
    { id: 'double-digits', name: 'Double Digits', description: 'Solve 10 problems', icon: '🔟', earned: input.solvedCount >= 10 },
    { id: 'quarter-century', name: 'Quarter Century', description: 'Solve 25 problems', icon: '🏅', earned: input.solvedCount >= 25 },
    { id: 'half-hundred', name: 'Half Hundred', description: 'Solve 50 problems', icon: '🏆', earned: input.solvedCount >= 50 },
    { id: 'boss-fight', name: 'Boss Fight', description: 'Solve a hard problem', icon: '👾', earned: input.solvedHard >= 1 },
    { id: 'on-a-roll', name: 'On a Roll', description: '3-day practice streak', icon: '📈', earned: input.streak >= 3 },
    { id: 'week-warrior', name: 'Week Warrior', description: '7-day practice streak', icon: '⚡', earned: input.streak >= 7 },
    { id: 'cross-examined', name: 'Cross-Examined', description: 'Complete 5 follow-up interviews', icon: '🎙️', earned: input.interviewsComplete >= 5 },
    { id: 'break-it-down', name: 'Break It Down', description: 'See 3 verified counterexamples', icon: '💥', earned: input.counterexamplesSeen >= 3 },
    { id: 'topic-tamer', name: 'Topic Tamer', description: 'Solve every problem in a topic', icon: '🧠', earned: input.topicFullySolved },
  ];
}

// ---------------------------------------------------------------------------
// Full user stats (profile page)
// ---------------------------------------------------------------------------

export interface TopicProgress {
  topic: string;
  label: string;
  solved: number;
  attempted: number;
  total: number;
}

export interface DifficultyProgress {
  difficulty: Difficulty;
  solved: number;
  total: number;
}

export interface RecentAttempt {
  problemSlug: string | null;
  problemTitle: string;
  verdict: Verdict;
  score: number;
  createdAt: string;
}

export interface UserStats {
  xp: number;
  level: number;
  intoLevel: number;
  forNext: number;
  streak: number;
  totalEvals: number;
  solvedCount: number;
  byDifficulty: DifficultyProgress[];
  topics: TopicProgress[];
  badges: Badge[];
  recent: RecentAttempt[];
}

export async function getUserStats(userId: string): Promise<UserStats> {
  const db = getServiceDb();
  const [facts, problemsRes] = await Promise.all([
    fetchEvalFacts(userId),
    db.from('problems').select('id, difficulty, topics'),
  ]);
  if (problemsRes.error) throw new Error(`Failed to fetch problems: ${problemsRes.error.message}`);
  const problems = (problemsRes.data ?? []) as { id: string; difficulty: Difficulty; topics: string[] }[];

  // Per-problem best outcome
  const best = new Map<string, { solved: boolean; fact: EvalFact }>();
  for (const f of facts) {
    const verdict = f.final_verdict ?? f.verdict;
    const prev = best.get(f.problem_id);
    const solved = verdict === 'correct' || prev?.solved === true;
    if (!prev || (!prev.solved && solved)) best.set(f.problem_id, { solved, fact: f });
    else if (prev) best.set(f.problem_id, { solved: prev.solved || solved, fact: prev.fact });
  }

  // XP: every evaluation earns, using its own verdict
  let xp = 0;
  for (const f of facts) {
    const difficulty = f.problem?.difficulty ?? 'easy';
    xp += evaluationXp({
      difficulty,
      verdict: f.verdict,
      final_verdict: f.final_verdict,
      interview_status: f.interview_status,
    });
  }

  const streak = computeStreak(facts.map((f) => f.created_at));

  // Difficulty + topic rollups against the full problem bank
  const byDifficulty: DifficultyProgress[] = (['easy', 'medium', 'hard'] as Difficulty[]).map(
    (difficulty) => ({
      difficulty,
      total: problems.filter((p) => p.difficulty === difficulty).length,
      solved: problems.filter((p) => p.difficulty === difficulty && best.get(p.id)?.solved).length,
    })
  );

  const topicTotals = new Map<string, { total: number; solved: number; attempted: number }>();
  for (const p of problems) {
    for (const t of p.topics) {
      const entry = topicTotals.get(t) ?? { total: 0, solved: 0, attempted: 0 };
      entry.total++;
      const b = best.get(p.id);
      if (b?.solved) entry.solved++;
      else if (b) entry.attempted++;
      topicTotals.set(t, entry);
    }
  }
  const topics: TopicProgress[] = [...topicTotals.entries()]
    .map(([topic, v]) => ({ topic, label: topicLabel(topic), ...v }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const solvedCount = [...best.values()].filter((b) => b.solved).length;
  const solvedHard = problems.filter(
    (p) => p.difficulty === 'hard' && best.get(p.id)?.solved
  ).length;

  const badges = computeBadges({
    totalEvals: facts.length,
    solvedCount,
    solvedHard,
    streak,
    interviewsComplete: facts.filter((f) => f.interview_status === 'complete').length,
    counterexamplesSeen: facts.filter((f) => f.counterexample_status === 'verified').length,
    topicFullySolved: topics.some((t) => t.total > 0 && t.solved === t.total),
  });

  const { level, intoLevel, forNext } = levelFromXp(xp);

  return {
    xp,
    level,
    intoLevel,
    forNext,
    streak,
    totalEvals: facts.length,
    solvedCount,
    byDifficulty,
    topics,
    badges,
    recent: facts.slice(0, 6).map((f) => ({
      problemSlug: f.problem?.slug ?? null,
      problemTitle: f.problem?.title ?? 'Removed problem',
      verdict: f.final_verdict ?? f.verdict,
      score: Math.max(f.score, f.final_score ?? 0),
      createdAt: f.created_at,
    })),
  };
}

// ---------------------------------------------------------------------------
// Continue / next-problem flow
// ---------------------------------------------------------------------------

interface ProblemLite {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  topics: string[];
}

const DIFFICULTY_RANK: Record<Difficulty, number> = { easy: 0, medium: 1, hard: 2 };

function canonicalOrder(a: ProblemLite, b: ProblemLite): number {
  return DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty] || a.title.localeCompare(b.title);
}

async function fetchProblemsLite(): Promise<ProblemLite[]> {
  const db = getServiceDb();
  const { data, error } = await db.from('problems').select('id, slug, title, difficulty, topics');
  if (error) throw new Error(`Failed to fetch problems: ${error.message}`);
  return ((data ?? []) as ProblemLite[]).sort(canonicalOrder);
}

function sharesTopic(a: ProblemLite, b: ProblemLite): boolean {
  return a.topics.some((t) => b.topics.includes(t));
}

function pickNext(
  problems: ProblemLite[],
  solved: Set<string>,
  from: ProblemLite | undefined,
  exclude: Set<string>
): ProblemLite | null {
  const unsolved = problems.filter((p) => !solved.has(p.id) && !exclude.has(p.id));
  if (unsolved.length === 0) return null;
  if (!from) return unsolved[0] ?? null;

  const fromIndex = problems.findIndex((p) => p.id === from.id);
  const sameTopic = unsolved.filter((p) => p.id !== from.id && sharesTopic(p, from));
  // Same topic, after the current one in canonical order — else wrap within
  // the topic — else anywhere unsolved.
  const after = sameTopic.find((p) => problems.findIndex((q) => q.id === p.id) > fromIndex);
  return after ?? sameTopic[0] ?? unsolved.find((p) => p.id !== from.id) ?? null;
}

export interface NextProblem {
  slug: string;
  title: string;
  difficulty: Difficulty;
}

/** The problem to suggest after finishing `currentProblemId`. */
export async function getNextProblem(
  userId: string,
  currentProblemId: string
): Promise<NextProblem | null> {
  const [problems, facts] = await Promise.all([fetchProblemsLite(), fetchEvalFacts(userId)]);
  const solved = new Set(
    facts.filter((f) => (f.final_verdict ?? f.verdict) === 'correct').map((f) => f.problem_id)
  );
  const current = problems.find((p) => p.id === currentProblemId);
  const next = pickNext(problems, solved, current, new Set([currentProblemId]));
  return next ? { slug: next.slug, title: next.title, difficulty: next.difficulty } : null;
}

export interface ResumeItem {
  kind: 'continue' | 'next-up';
  slug: string;
  title: string;
  difficulty: Difficulty;
  topic: string;
  /** Best verdict so far (continue items only). */
  verdict?: Verdict;
  attemptedAt?: string;
}

/**
 * Dashboard "resume" strip: up to two attempted-but-unsolved problems
 * (most recent first) plus one suggested next problem after the latest
 * activity. Empty for users with no attempts.
 */
export async function getResumeItems(userId: string): Promise<ResumeItem[]> {
  const [problems, facts] = await Promise.all([fetchProblemsLite(), fetchEvalFacts(userId)]);
  if (facts.length === 0) return [];

  const byId = new Map(problems.map((p) => [p.id, p]));
  const solved = new Set(
    facts.filter((f) => (f.final_verdict ?? f.verdict) === 'correct').map((f) => f.problem_id)
  );

  // Latest attempt per unsolved problem, newest first (facts arrive desc).
  const seen = new Set<string>();
  const unfinished: ResumeItem[] = [];
  for (const f of facts) {
    if (seen.has(f.problem_id) || solved.has(f.problem_id)) continue;
    seen.add(f.problem_id);
    const p = byId.get(f.problem_id);
    if (!p) continue;
    unfinished.push({
      kind: 'continue',
      slug: p.slug,
      title: p.title,
      difficulty: p.difficulty,
      topic: p.topics[0] ?? '',
      verdict: f.final_verdict ?? f.verdict,
      attemptedAt: f.created_at,
    });
    if (unfinished.length === 2) break;
  }

  const latest = facts[0] ? byId.get(facts[0].problem_id) : undefined;
  const exclude = new Set<string>();
  for (const item of unfinished) {
    const p = problems.find((q) => q.slug === item.slug);
    if (p) exclude.add(p.id);
  }
  const next = pickNext(problems, solved, latest, exclude);
  const items = [...unfinished];
  if (next) {
    items.push({
      kind: 'next-up',
      slug: next.slug,
      title: next.title,
      difficulty: next.difficulty,
      topic: next.topics[0] ?? '',
    });
  }
  return items.slice(0, 3);
}

// ---------------------------------------------------------------------------
// Leaderboard (opt-in via users.preferences.leaderboard)
// ---------------------------------------------------------------------------

export interface LeaderboardRow {
  userId: string;
  name: string;
  avatarUrl: string | null;
  xp: number;
  solved: number;
  rank: number;
}

export async function getLeaderboard(limit = 50): Promise<LeaderboardRow[]> {
  const db = getServiceDb();
  const { data: users, error } = await db
    .from('users')
    .select('id, name, avatar_url, preferences')
    .eq('preferences->>leaderboard', 'true');
  if (error) throw new Error(`Failed to fetch leaderboard users: ${error.message}`);
  if (!users?.length) return [];

  const ids = users.map((u) => u.id as string);
  const { data: evals, error: evalError } = await db
    .from('evaluations')
    .select('user_id, problem_id, verdict, final_verdict, interview_status, problem:problems(difficulty)')
    .in('user_id', ids);
  if (evalError) throw new Error(`Failed to fetch leaderboard evals: ${evalError.message}`);

  const agg = new Map<string, { xp: number; solved: Set<string> }>();
  for (const raw of (evals ?? []) as unknown as (EvalFact & { user_id: string })[]) {
    const entry = agg.get(raw.user_id) ?? { xp: 0, solved: new Set<string>() };
    const difficulty = raw.problem?.difficulty ?? 'easy';
    entry.xp += evaluationXp({
      difficulty,
      verdict: raw.verdict,
      final_verdict: raw.final_verdict,
      interview_status: raw.interview_status,
    });
    if ((raw.final_verdict ?? raw.verdict) === 'correct') entry.solved.add(raw.problem_id);
    agg.set(raw.user_id, entry);
  }

  return users
    .map((u) => ({
      userId: u.id as string,
      name: (u.name as string) ?? 'Anonymous',
      avatarUrl: (u.avatar_url as string) ?? null,
      xp: agg.get(u.id as string)?.xp ?? 0,
      solved: agg.get(u.id as string)?.solved.size ?? 0,
    }))
    .sort((a, b) => b.xp - a.xp)
    .slice(0, limit)
    .map((row, i) => ({ ...row, rank: i + 1 }));
}

export async function getLeaderboardOptIn(userId: string): Promise<boolean> {
  const db = getServiceDb();
  const { data, error } = await db.from('users').select('preferences').eq('id', userId).maybeSingle();
  if (error) throw new Error(`Failed to fetch preferences: ${error.message}`);
  return Boolean((data?.preferences as Record<string, unknown> | null)?.leaderboard);
}

export async function setLeaderboardOptIn(userId: string, optIn: boolean): Promise<void> {
  const db = getServiceDb();
  const { data, error } = await db.from('users').select('preferences').eq('id', userId).maybeSingle();
  if (error) throw new Error(`Failed to fetch preferences: ${error.message}`);
  const preferences = { ...((data?.preferences as Record<string, unknown>) ?? {}), leaderboard: optIn };
  const { error: updateError } = await db.from('users').update({ preferences }).eq('id', userId);
  if (updateError) throw new Error(`Failed to update preferences: ${updateError.message}`);
}
