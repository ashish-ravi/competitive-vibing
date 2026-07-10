import Link from 'next/link';
import { auth } from '@/lib/auth';
import { signInAction } from '@/app/actions';
import { AccountMenu } from '@/components/AccountMenu';
import { LogoMark, Wordmark } from '@/components/Logo';
import { MobileNav } from '@/components/MobileNav';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-2 px-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <LogoMark />
          <Wordmark />
        </Link>

        <div className="flex items-center gap-1.5">
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
