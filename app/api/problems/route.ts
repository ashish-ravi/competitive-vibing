import { type NextRequest } from 'next/server';
import { jsonData, jsonError, requireSession } from '@/lib/api';
import { listProblems } from '@/lib/problems';
import { problemsQuerySchema } from '@/lib/schemas';

export async function GET(request: NextRequest) {
  const gate = await requireSession();
  if (gate.response) return gate.response;

  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = problemsQuerySchema.safeParse(params);
  if (!parsed.success) {
    return jsonError(400, 'VALIDATION_ERROR', 'Validation failed', parsed.error.flatten());
  }

  try {
    const problems = await listProblems(parsed.data);
    return jsonData(problems);
  } catch (err) {
    console.error(`GET /api/problems failed for user ${gate.userId}:`, err);
    return jsonError(500, 'INTERNAL_ERROR', 'Something went sideways. Please try again.');
  }
}
