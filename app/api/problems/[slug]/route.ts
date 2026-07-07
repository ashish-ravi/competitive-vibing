import { jsonData, jsonError, requireSession } from '@/lib/api';
import { getPublicProblemBySlug } from '@/lib/problems';
import { slugSchema } from '@/lib/schemas';

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const gate = await requireSession();
  if (gate.response) return gate.response;

  const parsed = slugSchema.safeParse(params.slug);
  if (!parsed.success) {
    return jsonError(400, 'VALIDATION_ERROR', 'Validation failed', parsed.error.flatten());
  }

  try {
    const problem = await getPublicProblemBySlug(parsed.data);
    if (!problem) return jsonError(404, 'NOT_FOUND', 'Problem not found');
    return jsonData(problem);
  } catch (err) {
    console.error(`GET /api/problems/${params.slug} failed for user ${gate.userId}:`, err);
    return jsonError(500, 'INTERNAL_ERROR', 'Something went sideways. Please try again.');
  }
}
