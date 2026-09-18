import { getServiceDb } from '@/lib/db';

/**
 * Permanently delete a user. `public.users` cascades to evaluations and
 * rate-limit rows; `next_auth.users` cascades to the OAuth account and any
 * sessions. Both rows share the same id (the sync trigger copies it).
 */
export async function deleteAccount(userId: string): Promise<void> {
  const db = getServiceDb();

  const { error: publicError } = await db.from('users').delete().eq('id', userId);
  if (publicError) throw new Error(`Failed to delete user data: ${publicError.message}`);

  const { error: authError } = await db.schema('next_auth').from('users').delete().eq('id', userId);
  if (authError) throw new Error(`Failed to delete auth user: ${authError.message}`);
}
