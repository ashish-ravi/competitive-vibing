import { jsonData, jsonError, requireSession } from '@/lib/api';
import { getServiceDb } from '@/lib/db';
import { slugSchema } from '@/lib/schemas';

/**
 * Reveal the reference approach for a problem — but only after the user has
 * at least one evaluation on it (the payoff comes after you've tried, never
 * before). Returns a trimmed view: never the full expected_approach object
 * verbatim-with-edge-cases isn't secret post-attempt, but keep it curated.
 */
export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const gate = await requireSession();
  if (gate.response) return gate.response;

  const parsed = slugSchema.safeParse(params.slug);
  if (!parsed.success) {
    return jsonError(400, 'VALIDATION_ERROR', 'Validation failed', parsed.error.flatten());
  }

  try {
    const db = getServiceDb();
    const { data: problem, error } = await db
      .from('problems')
      .select('id, expected_approach')
      .eq('slug', parsed.data)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!problem) return jsonError(404, 'NOT_FOUND', 'Problem not found');

    const { count, error: countError } = await db
      .from('evaluations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', gate.userId)
      .eq('problem_id', problem.id);
    if (countError) throw new Error(countError.message);
    if (!count) {
      return jsonError(403, 'FORBIDDEN', 'Explain your own approach first — then compare notes.');
    }

    const approach = problem.expected_approach as {
      summary: string;
      algorithm: string;
      time_complexity: string;
      space_complexity: string;
      key_insight: string;
    };

    return jsonData({
      summary: approach.summary,
      algorithm: approach.algorithm,
      time_complexity: approach.time_complexity,
      space_complexity: approach.space_complexity,
      key_insight: approach.key_insight,
    });
  } catch (err) {
    console.error(`GET /api/problems/${params.slug}/approach failed for user ${gate.userId}:`, err);
    return jsonError(500, 'INTERNAL_ERROR', 'Something went sideways. Please try again.');
  }
}
