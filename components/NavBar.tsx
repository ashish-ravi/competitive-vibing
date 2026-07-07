import Link from 'next/link';
import Image from 'next/image';
import { auth, signIn, signOut } from '@/lib/auth';
import { Button, buttonVariants } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';

export async function NavBar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            AE
          </span>
          <span className="hidden sm:inline">AlgoExplain</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link href="/" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
            Problems
          </Link>
          {session?.user && (
            <Link href="/history" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
              History
            </Link>
          )}
          <ThemeToggle />
          {session?.user ? (
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/' });
              }}
              className="flex items-center gap-2 pl-1"
            >
              {session.user.image && (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? 'Your avatar'}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}
              <Button variant="outline" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          ) : (
            <form
              action={async () => {
                'use server';
                await signIn('google');
              }}
              className="pl-1"
            >
              <Button size="sm" type="submit">
                Sign in
              </Button>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
}
