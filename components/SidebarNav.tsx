'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function LibraryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

export function LeaderboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8 21V10M12 21V3M16 21v-6" />
      <path d="M3 21h18" />
    </svg>
  );
}

export function ExploreIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5z" />
    </svg>
  );
}

export const NAV_ITEMS = [
  { href: '/', label: 'Library', icon: LibraryIcon, isActive: (p: string) => p === '/' || p.startsWith('/problems') },
  { href: '/explore', label: 'Explore', icon: ExploreIcon, isActive: (p: string) => p.startsWith('/explore') },
  { href: '/leaderboard', label: 'Leaderboard', icon: LeaderboardIcon, isActive: (p: string) => p.startsWith('/leaderboard') },
];

/** Vertical nav in the macOS sidebar idiom: accent icons, neutral selection fill. */
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5" aria-label="Primary">
      {NAV_ITEMS.map((item) => {
        const active = item.isActive(pathname);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex h-11 items-center gap-3 rounded-lg px-3 text-[15px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              active
                ? 'bg-black/[0.06] font-semibold text-foreground dark:bg-white/[0.1]'
                : 'font-medium text-foreground/80 hover:bg-black/[0.04] hover:text-foreground dark:hover:bg-white/[0.06]'
            )}
          >
            <Icon className="h-[19px] w-[19px] text-primary" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
