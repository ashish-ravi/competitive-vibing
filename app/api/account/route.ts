import { requireSession, jsonData, jsonError } from '@/lib/api';
import { deleteAccount } from '@/lib/account';

/** Permanently delete the signed-in user's account and every evaluation. */
export async function DELETE() {
  const gate = await requireSession();
  if (gate.response) return gate.response;

  try {
    await deleteAccount(gate.userId);
    return jsonData({ deleted: true });
  } catch (err) {
    console.error('account delete failed', { userId: gate.userId, error: (err as Error).message });
    return jsonError(500, 'INTERNAL_ERROR', 'The account could not be deleted. Please try again.');
  }
}
