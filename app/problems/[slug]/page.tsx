import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getPublicProblemBySlug } from '@/lib/problems';
import { countAttempts } from '@/lib/history';
import { slugSchema } from '@/lib/schemas';
import { ProblemStatement } from '@/components/ProblemStatement';
import { EvaluationSection } from '@/components/EvaluationSection';

export const dynamic = 'force-dynamic';

export default async function ProblemDetailPage({ params }: { params: { slug: string } }) {
  const session = await auth();
  if (!session?.user) redirect('/');

  const parsed = slugSchema.safeParse(params.slug);
  if (!parsed.success) notFound();

  const problem = await getPublicProblemBySlug(parsed.data);
  if (!problem) notFound();

  const attempts = await countAttempts(session.user.id, problem.id);

  return (
    <div className="grid grid-cols-1 gap-6 pb-24 md:grid-cols-2 md:gap-8 md:pb-8">
      <ProblemStatement problem={problem} />
      <EvaluationSection problemId={problem.id} priorAttempts={attempts} />
    </div>
  );
}
