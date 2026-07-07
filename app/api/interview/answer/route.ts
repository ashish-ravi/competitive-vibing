import { jsonData, jsonError, requireSession } from '@/lib/api';
import { getEvaluationRow } from '@/lib/history';
import { recordAnswer } from '@/lib/interview';
import { interviewAnswerSchema } from '@/lib/schemas';

export async function POST(request: Request) {
  const gate = await requireSession();
  if (gate.response) return gate.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, 'VALIDATION_ERROR', 'Validation failed', { body: 'Invalid JSON' });
  }
  const parsed = interviewAnswerSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, 'VALIDATION_ERROR', 'Validation failed', parsed.error.flatten());
  }

  try {
    const evaluation = await getEvaluationRow(parsed.data.evaluation_id);
    if (!evaluation) return jsonError(404, 'NOT_FOUND', 'Evaluation not found');
    if (evaluation.user_id !== gate.userId) {
      return jsonError(403, 'FORBIDDEN', 'This evaluation belongs to another user');
    }

    const outcome = await recordAnswer(evaluation, parsed.data.turn_index, parsed.data.answer);
    if (!outcome.ok) return jsonError(outcome.status, outcome.code, outcome.message);

    return jsonData({ answered: outcome.answered, remaining: outcome.remaining });
  } catch (err) {
    console.error(
      `POST /api/interview/answer failed user=${gate.userId} evaluation=${parsed.data.evaluation_id}:`,
      err
    );
    return jsonError(500, 'INTERNAL_ERROR', 'Something went sideways. Please try again.');
  }
}
