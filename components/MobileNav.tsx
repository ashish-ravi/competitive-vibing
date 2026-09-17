'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/components/SidebarNav';
import { UserAvatar } from '@/components/UserAvatar';
import { signOutAction } from '@/app/actions';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  name: string | null | undefined;
  email: string | null | undefined;
  image: string | null | undefined;
  /** Render opened on mount — used by the dev preview page only. */
  defaultOpen?: boolean;
}

const SECONDARY = [
  { href: '/profile', label: 'Profile & progress' },
  { href: '/history', label: 'History' },
];

/**
 * Full-screen menu below lg, in the apple.com idiom: the page dims away and
 * the sections stack as large text with hairline separators.
 * Rendered through a portal: the sticky header uses backdrop-filter, which
 * makes it the containing block for fixed descendants — a menu rendered
 * inside it would be clipped to the header strip.
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

  const menu = open ? (
    <div
      role="dialog"
      aria-label="Navigation"
      className="fixed inset-0 z-[60] flex animate-backdrop-in flex-col overflow-y-auto bg-background lg:hidden"
    >
      <div className="flex h-12 shrink-0 items-center justify-between px-4">
        <div className="flex min-w-0 items-center gap-3">
          <UserAvatar name={name} image={image} size={32} />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold leading-tight">{name ?? 'Signed in'}</p>
            {email && <p className="truncate text-[12px] leading-tight text-muted-foreground">{email}</p>}
          </div>
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="Close navigation"
          className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-black/[0.05] dark:hover:bg-white/[0.08]"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="px-6 pt-6" aria-label="Primary">
        <ul>
          {NAV_ITEMS.map((item, i) => {
            const active = item.isActive(pathname);
            return (
              <li
                key={item.href}
                className="animate-rise border-b border-border"
                style={{ animationDelay: `${60 + i * 40}ms` }}
              >
                <Link
                  href={item.href}
                  onClick={close}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex min-h-[56px] items-center justify-between py-3 text-[28px] font-semibold tracking-display',
                    active ? 'text-foreground' : 'text-foreground/80'
                  )}
                >
                  {item.label}
                  <svg className="h-5 w-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="m9.5 6 6 6-6 6" />
                  </svg>
                </Link>
              </li>
            );
          })}
        </ul>

        <ul className="mt-8">
          {SECONDARY.map((item, i) => (
            <li
              key={item.href}
              className="animate-rise"
              style={{ animationDelay: `${200 + i * 40}ms` }}
            >
              <Link
                href={item.href}
                onClick={close}
                className="flex min-h-[44px] items-center text-[17px] text-foreground/80 hover:text-foreground"
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li className="animate-rise" style={{ animationDelay: '280ms' }}>
            <form action={signOutAction}>
              <button
                type="submit"
                className="flex min-h-[44px] items-center text-[17px] text-foreground/80 hover:text-foreground"
              >
                Sign out
              </button>
            </form>
          </li>
        </ul>
      </nav>
    </div>
  ) : null;

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        aria-expanded={open}
        className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-black/[0.05] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-white/[0.08]"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>
      {mounted && menu ? createPortal(menu, document.body) : null}
    </div>
  );
}
