import { notFound } from 'next/navigation';
import { MobileNav } from '@/components/MobileNav';
import { ProgressRail } from '@/components/ProgressRail';
import { SidebarPanel } from '@/components/LeftSidebar';
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
      <ProgressRail stats={fakeStats} />
    </div>
  );
}
