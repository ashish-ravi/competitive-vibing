'use server';

import { revalidatePath } from 'next/cache';
import { auth, signIn, signOut } from '@/lib/auth';
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
  revalidatePath('/leaderboard');
  revalidatePath('/profile');
}
