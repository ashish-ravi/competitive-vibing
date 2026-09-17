import { notFound } from 'next/navigation';
import { EmptyState } from '@/components/EmptyState';
import { EvaluationSection } from '@/components/EvaluationSection';
import { HintsPanel } from '@/components/HintsPanel';
import { LeaderboardToggle } from '@/components/LeaderboardToggle';
import { MobileNav } from '@/components/MobileNav';
import { PageHeader } from '@/components/PageHeader';
import { ProblemBrowser } from '@/components/ProblemBrowser';
import { ProblemStatement } from '@/components/ProblemStatement';
import { ProgressRail } from '@/components/ProgressRail';
import { ResumeSection } from '@/components/ResumeSection';
import { Roadmap } from '@/components/Roadmap';
import { SidebarPanel } from '@/components/LeftSidebar';
import { buildRoadmap } from '@/lib/roadmap';
import type { ProblemListItem, PublicProblem } from '@/lib/db';
import type { ProblemStatus, UserStats } from '@/lib/stats';

/**
 * Dev-only visual harness: renders the signed-in chrome with fabricated data
 * so layout/styling can be screenshot-tested without an OAuth session.
 * 404s in production.
 */
export default function DevPreviewPage({
  searchParams,
}: {
  searchParams: { view?: string };
}) {
  if (process.env.NODE_ENV === 'production') notFound();

  const fakeStats: UserStats = {
    xp: 435,
    level: 2,
    intoLevel: 185,
    forNext: 250,
    streak: 4,
    totalEvals: 21,
    solvedCount: 9,
    byDifficulty: [
      { difficulty: 'easy', solved: 6, total: 28 },
      { difficulty: 'medium', solved: 3, total: 101 },
      { difficulty: 'hard', solved: 0, total: 21 },
    ],
    topics: [],
    badges: [
      { id: 'warming-up', name: 'Warming Up', description: 'First explanation', icon: '🔥', earned: true },
      { id: 'first-blood', name: 'First Blood', description: 'First correct', icon: '🎯', earned: true },
      { id: 'double-digits', name: 'Double Digits', description: '10 solved', icon: '🔟', earned: false },
      { id: 'boss-fight', name: 'Boss Fight', description: 'Hard solved', icon: '👾', earned: false },
      { id: 'on-a-roll', name: 'On a Roll', description: '3-day streak', icon: '📈', earned: true },
      { id: 'week-warrior', name: 'Week Warrior', description: '7-day streak', icon: '⚡', earned: false },
    ],
    recent: [],
  };

  const solvedDays = [0, 1, 2, 4, 7, 9, 12].map((d) =>
    new Date(Date.now() - d * 86_400_000).toISOString().slice(0, 10)
  );
  const leaderboard = [
    { userId: 'a', name: 'Priya N', avatarUrl: null, xp: 1240, solved: 41, rank: 1 },
    { userId: 'me', name: 'Ashish Ravikumar', avatarUrl: null, xp: 980, solved: 33, rank: 2 },
    { userId: 'c', name: 'Dev K', avatarUrl: null, xp: 710, solved: 25, rank: 3 },
    { userId: 'd', name: 'Sam T', avatarUrl: null, xp: 430, solved: 14, rank: 4 },
    { userId: 'e', name: 'Lin W', avatarUrl: null, xp: 180, solved: 7, rank: 5 },
  ];

  if (searchParams.view === 'roadmap') {
    const topics = [
      { topic: 'arrays-hashing', label: 'Arrays & Hashing', solved: 9, total: 9 },
      { topic: 'two-pointers', label: 'Two Pointers', solved: 5, total: 5 },
      { topic: 'stack', label: 'Stack', solved: 4, total: 7 },
      { topic: 'sliding-window', label: 'Sliding Window', solved: 2, total: 6 },
      { topic: 'binary-search', label: 'Binary Search', solved: 0, total: 7 },
      { topic: 'linked-list', label: 'Linked List', solved: 1, total: 11 },
      { topic: 'trees', label: 'Trees', solved: 0, total: 15 },
      { topic: 'tries', label: 'Tries', solved: 0, total: 3 },
      { topic: 'heap', label: 'Heap / Priority Queue', solved: 0, total: 7 },
      { topic: 'backtracking', label: 'Backtracking', solved: 0, total: 9 },
      { topic: 'graphs', label: 'Graphs', solved: 0, total: 13 },
      { topic: 'dp-1d', label: 'Dynamic Programming I', solved: 0, total: 12 },
      { topic: 'intervals', label: 'Intervals', solved: 0, total: 6 },
      { topic: 'greedy', label: 'Greedy', solved: 0, total: 8 },
      { topic: 'advanced-graphs', label: 'Advanced Graphs', solved: 0, total: 6 },
      { topic: 'dp-2d', label: 'Dynamic Programming II', solved: 0, total: 11 },
      { topic: 'bit-manipulation', label: 'Bit Manipulation', solved: 0, total: 7 },
      { topic: 'math-geometry', label: 'Math & Geometry', solved: 0, total: 8 },
    ];
    const { stages, currentLevel } = buildRoadmap(topics);
    return (
      <div className="mx-auto max-w-3xl space-y-10">
        <PageHeader
          title="Explore"
          description="The path from zero to interview-ready, one stage at a time. Each level builds on the techniques of the one before it. 21 of 150 solved so far."
        />
        <Roadmap stages={stages} currentLevel={currentLevel} />
      </div>
    );
  }

  if (searchParams.view === 'drawer') {
    return (
      <div className="space-y-4">
        <PageHeader title="Page content behind" description="This text must not be visible through the menu." />
        <div className="h-64 rounded-2xl bg-card p-4">tile content</div>
        <MobileNav
          name="Ashish Ravikumar"
          email="ashishravi2000@gmail.com"
          image={null}
          defaultOpen
        />
      </div>
    );
  }

  if (searchParams.view === 'cards') {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <PageHeader
          title="Leaderboard"
          description="Ranked by XP. Only people who opt in are listed."
          aside={<LeaderboardToggle optedIn />}
        />
        <div className="rounded-2xl bg-card p-5">
          <LeaderboardToggle optedIn={false} />
        </div>
        <EmptyState />
      </div>
    );
  }

  if (searchParams.view === 'problem') {
    const problem: PublicProblem = {
      id: 'p1',
      slug: 'two-sum',
      title: 'Two Sum',
      difficulty: 'easy',
      topics: ['arrays-hashing'],
      statement:
        'Given an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up to `target`.\n\nYou may assume each input has **exactly one** solution, and you may not use the same element twice. The answer can be returned in any order.',
      examples: [
        { input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]', explanation: 'nums[0] + nums[1] = 2 + 7 = 9.' },
        { input: 'nums = [3, 3], target = 6', output: '[0, 1]', explanation: '' },
      ],
      constraints: ['2 ≤ nums.length ≤ 10^4', '-10^9 ≤ nums[i] ≤ 10^9', 'Exactly one valid answer exists.'],
      hints: [
        'A brute-force pair check works but costs O(n²). What would let you find a partner in constant time?',
        'For each number, the partner you need is target − number. Where could you have stored it?',
        'One pass with a hash map from value to index.',
      ],
      source: null,
      created_at: new Date().toISOString(),
    };
    return (
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 pb-24 md:grid-cols-2 md:gap-12 md:pb-8 lg:gap-16">
        <div className="space-y-6">
          <ProblemStatement problem={problem} />
          <HintsPanel hints={problem.hints} />
        </div>
        <EvaluationSection
          problemId={problem.id}
          problemSlug={problem.slug}
          priorAttempts={2}
          nextProblem={{ slug: 'contains-duplicate', title: 'Contains Duplicate' }}
        />
      </div>
    );
  }

  const problems: ProblemListItem[] = [
    ['two-sum', 'Two Sum', 'easy', ['arrays-hashing']],
    ['contains-duplicate', 'Contains Duplicate', 'easy', ['arrays-hashing']],
    ['valid-anagram', 'Valid Anagram', 'easy', ['arrays-hashing']],
    ['group-anagrams', 'Group Anagrams', 'medium', ['arrays-hashing']],
    ['top-k-frequent', 'Top K Frequent Elements', 'medium', ['arrays-hashing', 'heap']],
    ['valid-palindrome', 'Valid Palindrome', 'easy', ['two-pointers']],
    ['3sum', '3Sum', 'medium', ['two-pointers']],
    ['container-water', 'Container With Most Water', 'medium', ['two-pointers']],
    ['trapping-rain', 'Trapping Rain Water', 'hard', ['two-pointers']],
    ['best-time-stock', 'Best Time to Buy and Sell Stock', 'easy', ['sliding-window']],
    ['longest-substring', 'Longest Substring Without Repeating Characters', 'medium', ['sliding-window']],
    ['valid-parentheses', 'Valid Parentheses', 'easy', ['stack']],
    ['min-stack', 'Min Stack', 'medium', ['stack']],
    ['binary-search', 'Binary Search', 'easy', ['binary-search']],
    ['reverse-linked-list', 'Reverse Linked List', 'easy', ['linked-list']],
    ['invert-tree', 'Invert Binary Tree', 'easy', ['trees']],
  ].map(([slug, title, difficulty, topics], i) => ({
    id: `id-${i}`,
    slug: slug as string,
    title: title as string,
    difficulty: difficulty as ProblemListItem['difficulty'],
    topics: topics as string[],
    created_at: new Date().toISOString(),
  }));
  const statuses: Record<string, ProblemStatus> = {
    'id-0': { status: 'solved', bestScore: 92 } as ProblemStatus,
    'id-1': { status: 'solved', bestScore: 88 } as ProblemStatus,
    'id-3': { status: 'attempted', bestScore: 61 } as ProblemStatus,
    'id-5': { status: 'solved', bestScore: 95 } as ProblemStatus,
    'id-6': { status: 'attempted', bestScore: 48 } as ProblemStatus,
  };

  return (
    <div className="flex gap-8">
      <SidebarPanel />
      <div className="min-w-0 flex-1 space-y-8">
        <PageHeader title="Hello, Ashish." description="Day 4 of your streak. 9 solved, level 2." />
        <ResumeSection
          items={[
            { kind: 'continue', slug: 'group-anagrams', title: 'Group Anagrams', difficulty: 'medium', topic: 'arrays-hashing', verdict: 'partial', attemptedAt: new Date(Date.now() - 3 * 3_600_000).toISOString() },
            { kind: 'continue', slug: '3sum', title: '3Sum', difficulty: 'medium', topic: 'two-pointers', verdict: 'incorrect', attemptedAt: new Date(Date.now() - 26 * 3_600_000).toISOString() },
            { kind: 'next-up', slug: 'top-k-frequent', title: 'Top K Frequent Elements', difficulty: 'medium', topic: 'arrays-hashing' },
          ]}
        />
        <ProblemBrowser problems={problems} statuses={statuses} />
      </div>
      <ProgressRail stats={fakeStats} currentUserId="me" solvedDays={solvedDays} leaderboard={leaderboard} />
    </div>
  );
}
