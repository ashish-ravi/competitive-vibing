import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getPublicProblemBySlug } from '@/lib/problems';
import { countAttempts } from '@/lib/history';
import { slugSchema } from '@/lib/schemas';
import { ProblemStatement } from '@/components/ProblemStatement';
import { EvaluationSection } from '@/components/EvaluationSection';
import { HintsPanel } from '@/components/HintsPanel';

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
      <div className="space-y-4">
        <ProblemStatement problem={problem} />
        <HintsPanel hints={problem.hints ?? []} />
      </div>
      <EvaluationSection
        problemId={problem.id}
        problemSlug={problem.slug}
        priorAttempts={attempts}
      />
    </div>
  );
}
