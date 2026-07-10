'use client';

import Link from 'next/link';
import { UserAvatar } from '@/components/UserAvatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOutAction } from '@/app/actions';

interface AccountMenuProps {
  name: string | null | undefined;
  email: string | null | undefined;
  image: string | null | undefined;
}

export function AccountMenu({ name, email, image }: AccountMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="rounded-full ring-offset-background transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Account menu"
      >
        <UserAvatar name={name} image={image} size={34} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <span className="block font-medium text-foreground">{name ?? 'Signed in'}</span>
          {email && <span className="block truncate text-xs">{email}</span>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">Profile &amp; progress</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/history">History</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/leaderboard">Leaderboard</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            void signOutAction();
          }}
          className="text-destructive focus:text-destructive"
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
