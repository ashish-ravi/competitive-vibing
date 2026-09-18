'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { auth, signIn, signOut } from '@/lib/auth';
import { deleteAccount } from '@/lib/account';
import { setLeaderboardOptIn } from '@/lib/stats';

export async function signInAction() {
  await signIn('google');
}

export async function signOutAction() {
  await signOut({ redirectTo: '/' });
}

export async function toggleLeaderboardAction(optIn: boolean) {
  const session = await auth();
  if (!session?.user?.id) return;
  await setLeaderboardOptIn(session.user.id, optIn);
  revalidateTag('leaderboard');
  revalidatePath('/leaderboard');
  revalidatePath('/profile');
}

/** Delete the signed-in account, then end the session. */
export async function deleteAccountAction(): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: 'You are not signed in.' };
  try {
    await deleteAccount(session.user.id);
  } catch (err) {
    console.error('account delete failed', { userId: session.user.id, error: (err as Error).message });
    return { ok: false, error: 'The account could not be deleted. Please try again.' };
  }
  revalidateTag('leaderboard');
  await signOut({ redirectTo: '/' });
  return { ok: true };
}
