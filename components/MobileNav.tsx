'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { SidebarNav } from '@/components/SidebarNav';
import { UserAvatar } from '@/components/UserAvatar';
import { signOutAction } from '@/app/actions';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  name: string | null | undefined;
  email: string | null | undefined;
  image: string | null | undefined;
}

/** Hamburger drawer with all navigation — shown below lg. */
export function MobileNav({ name, email, image }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change and lock body scroll while open.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

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

      {open && (
        <div className="fixed inset-0 z-50">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-label="Navigation"
            className="absolute right-0 top-0 flex h-full w-[85%] max-w-xs animate-fade-up flex-col border-l bg-background p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <UserAvatar name={name} image={image} size={40} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{name ?? 'Signed in'}</p>
                  {email && <p className="truncate text-xs text-muted-foreground">{email}</p>}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md hover:bg-accent"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-6">
              <SidebarNav onNavigate={() => setOpen(false)} />
            </div>

            <div className="mt-2 border-t pt-2">
              {[
                { href: '/profile', label: 'Profile & progress' },
                { href: '/history', label: 'History' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex min-h-[44px] items-center rounded-md px-3 text-sm font-medium transition-colors',
                    pathname.startsWith(item.href)
                      ? 'bg-accent text-foreground'
                      : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <form action={signOutAction} className="mt-auto border-t pt-3">
              <button
                type="submit"
                className="flex min-h-[44px] w-full items-center rounded-md px-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
