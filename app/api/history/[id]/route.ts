import { z } from 'zod';
import { jsonData, jsonError, requireSession } from '@/lib/api';
import { getEvaluationDetail } from '@/lib/history';

const idSchema = z.string().uuid();

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const gate = await requireSession();
  if (gate.response) return gate.response;

  const parsed = idSchema.safeParse(params.id);
  if (!parsed.success) {
    return jsonError(400, 'VALIDATION_ERROR', 'Validation failed', parsed.error.flatten());
  }

  try {
    const evaluation = await getEvaluationDetail(parsed.data);
    if (!evaluation) return jsonError(404, 'NOT_FOUND', 'Evaluation not found');
    if (evaluation.user_id !== gate.userId) {
      return jsonError(403, 'FORBIDDEN', 'This evaluation belongs to another user');
    }
    return jsonData(evaluation);
  } catch (err) {
    console.error(`GET /api/history/${params.id} failed for user ${gate.userId}:`, err);
    return jsonError(500, 'INTERNAL_ERROR', 'Something went sideways. Please try again.');
  }
}
