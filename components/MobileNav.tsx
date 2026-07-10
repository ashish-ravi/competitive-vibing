'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { SidebarNav } from '@/components/SidebarNav';
import { UserAvatar } from '@/components/UserAvatar';
import { signOutAction } from '@/app/actions';

interface MobileNavProps {
  name: string | null | undefined;
  email: string | null | undefined;
  image: string | null | undefined;
  /** Render opened on mount — used by the dev preview page only. */
  defaultOpen?: boolean;
}

function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
    </svg>
  );
}

function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function SignOutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5M21 12H9" />
    </svg>
  );
}

/**
 * Hamburger drawer with all navigation — shown below lg.
 * Rendered through a portal: the sticky header uses backdrop-filter, which
 * makes it the containing block for fixed descendants — a drawer rendered
 * inside it gets clipped to the header strip.
 */
export function MobileNav({ name, email, image, defaultOpen = false }: MobileNavProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);
  // Close on route change and lock body scroll while open.
  useEffect(() => setOpen(defaultOpen), [pathname, defaultOpen]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  const drawer = open ? (
    <div className="fixed inset-0 z-[60] lg:hidden">
      <button
        aria-label="Close navigation"
        className="absolute inset-0 animate-backdrop-in bg-black/55"
        onClick={close}
      />
      <div
        role="dialog"
        aria-label="Navigation"
        className="absolute right-0 top-0 flex h-full w-[88%] max-w-sm animate-slide-in flex-col overflow-y-auto border-l bg-background shadow-2xl"
      >
        {/* identity */}
        <div className="flex items-center justify-between gap-3 px-4 pb-4 pt-5">
          <div className="flex min-w-0 items-center gap-3">
            <UserAvatar name={name} image={image} size={44} />
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold">{name ?? 'Signed in'}</p>
              {email && <p className="truncate text-xs text-muted-foreground">{email}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close navigation"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md hover:bg-accent"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* shortcut tiles */}
        <div className="grid grid-cols-2 gap-2.5 px-4">
          {[
            { href: '/profile', label: 'Profile & progress', Icon: ProfileIcon },
            { href: '/history', label: 'History', Icon: HistoryIcon },
          ].map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={close}
              className="flex flex-col items-center gap-2 rounded-lg border bg-card px-3 py-4 text-center transition-colors hover:border-primary/50"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-xs font-medium leading-tight">{label}</span>
            </Link>
          ))}
        </div>

        {/* primary nav */}
        <div className="mt-4 border-t px-4 pt-3">
          <SidebarNav onNavigate={close} />
        </div>

        {/* sign out pinned to the bottom */}
        <form action={signOutAction} className="mt-auto border-t p-3">
          <button
            type="submit"
            className="flex min-h-[44px] w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <SignOutIcon className="h-[18px] w-[18px]" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  ) : null;

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        aria-expanded={open}
        className="flex h-11 w-11 items-center justify-center rounded-md transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      {mounted && drawer ? createPortal(drawer, document.body) : null}
    </div>
  );
}
