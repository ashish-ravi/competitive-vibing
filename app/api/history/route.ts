import { type NextRequest } from 'next/server';
import { jsonData, jsonError, requireSession } from '@/lib/api';
import { listHistory } from '@/lib/history';
import { historyQuerySchema } from '@/lib/schemas';

export async function GET(request: NextRequest) {
  const gate = await requireSession();
  if (gate.response) return gate.response;

  const parsed = historyQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries())
  );
  if (!parsed.success) {
    return jsonError(400, 'VALIDATION_ERROR', 'Validation failed', parsed.error.flatten());
  }

  try {
    const result = await listHistory(gate.userId, parsed.data.page);
    return jsonData(result);
  } catch (err) {
    console.error(`GET /api/history failed for user ${gate.userId}:`, err);
    return jsonError(500, 'INTERNAL_ERROR', 'Something went sideways. Please try again.');
  }
}
