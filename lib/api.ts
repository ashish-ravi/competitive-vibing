import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'AI_UNAVAILABLE';

/** Standard error shape (.claude/rules/backend.md). */
export function jsonError(
  status: number,
  code: ErrorCode,
  error: string,
  details: Record<string, unknown> = {}
) {
  return NextResponse.json({ error, code, details }, { status });
}

export function jsonData<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

/**
 * Session gate for every non-auth route. Returns the user id, or a ready
 * 401 response. Usage:
 *   const gate = await requireSession();
 *   if (gate.response) return gate.response;
 *   const userId = gate.userId;
 */
export async function requireSession(): Promise<
  { userId: string; response: null } | { userId: null; response: NextResponse }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { userId: null, response: jsonError(401, 'UNAUTHORIZED', 'Unauthorized') };
  }
  return { userId: session.user.id, response: null };
}
