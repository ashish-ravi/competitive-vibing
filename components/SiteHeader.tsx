import Link from 'next/link';
import { auth } from '@/lib/auth';
import { signInAction } from '@/app/actions';
import { AccountMenu } from '@/components/AccountMenu';
import { LogoMark, Wordmark } from '@/components/Logo';
import { MobileNav } from '@/components/MobileNav';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';

/** Constant 48px bar: translucent over the page, never changes on scroll. */
export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-background/80 backdrop-blur-xl dark:border-white/[0.08]">
      <div className="mx-auto flex h-12 max-w-[1440px] items-center justify-between px-4 md:px-6 lg:px-10">
        <Link
          href="/"
          className="flex h-11 items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <LogoMark />
          <Wordmark />
        </Link>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          {session?.user ? (
            <>
              <span className="hidden lg:block">
                <AccountMenu
                  name={session.user.name}
                  email={session.user.email}
                  image={session.user.image}
                />
              </span>
              <MobileNav
                name={session.user.name}
                email={session.user.email}
                image={session.user.image}
              />
            </>
          ) : (
            <form action={signInAction}>
              <Button size="sm" type="submit">
                Sign in
              </Button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
}
