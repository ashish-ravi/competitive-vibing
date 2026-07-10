import { notFound } from 'next/navigation';
import { MobileNav } from '@/components/MobileNav';
import { ProgressRail } from '@/components/ProgressRail';
import { Roadmap } from '@/components/Roadmap';
import { SidebarPanel } from '@/components/LeftSidebar';
import { buildRoadmap } from '@/lib/roadmap';
import type { UserStats } from '@/lib/stats';

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
      <div className="mx-auto max-w-3xl space-y-8 py-4">
        <div>
          <h1 className="prompt-heading font-display text-2xl font-bold tracking-tight">explore</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            The path from zero to interview-ready. Start at the top, clear a stage, move down.
          </p>
        </div>
        <Roadmap stages={stages} currentLevel={currentLevel} />
      </div>
    );
  }

  if (searchParams.view === 'drawer') {
    return (
      <div className="space-y-4">
        <h1 className="prompt-heading font-display text-2xl font-bold">page content behind</h1>
        <p className="text-muted-foreground">
          This text must NOT be visible through the drawer panel.
        </p>
        <div className="h-64 rounded-lg border bg-card p-4">card content</div>
        <MobileNav
          name="Ashish Ravikumar"
          email="ashishravi2000@gmail.com"
          image={null}
          defaultOpen
        />
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      <SidebarPanel />
      <div className="min-w-0 flex-1 space-y-4 py-4">
        <h1 className="prompt-heading font-display text-2xl font-bold tracking-tight">
          day 4 of the streak, Ashish
        </h1>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {['Arrays & Hashing', 'Two Pointers', 'Sliding Window', 'Stack'].map((t) => (
            <div key={t} className="rounded-lg border bg-card p-4">
              <p className="font-display text-[15px] font-bold">{t}</p>
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-primary to-glow" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <ProgressRail
        stats={fakeStats}
        currentUserId="me"
        leaderboard={[
          { userId: 'a', name: 'Priya N', avatarUrl: null, xp: 1240, solved: 41, rank: 1 },
          { userId: 'me', name: 'Ashish Ravikumar', avatarUrl: null, xp: 980, solved: 33, rank: 2 },
          { userId: 'c', name: 'Dev K', avatarUrl: null, xp: 710, solved: 25, rank: 3 },
          { userId: 'd', name: 'Sam T', avatarUrl: null, xp: 430, solved: 14, rank: 4 },
          { userId: 'e', name: 'Lin W', avatarUrl: null, xp: 180, solved: 7, rank: 5 },
        ]}
      />
    </div>
  );
}
