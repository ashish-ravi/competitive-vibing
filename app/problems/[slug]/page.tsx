import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getPublicProblemBySlug } from '@/lib/problems';
import { countAttempts } from '@/lib/history';
import { getNextProblem } from '@/lib/stats';
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

  const [attempts, nextProblem] = await Promise.all([
    countAttempts(session.user.id, problem.id),
    getNextProblem(session.user.id, problem.id),
  ]);

  return (
    // Mobile order: statement → input → hints. Desktop: statement + hints in
    // the left column, the input spanning the right.
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-x-12 gap-y-10 pb-24 md:grid-cols-2 md:grid-rows-[auto_1fr] md:pb-8 lg:gap-x-16">
      <div className="order-1">
        <ProblemStatement problem={problem} />
      </div>
      <div className="order-2 md:col-start-2 md:row-span-2 md:row-start-1">
        <EvaluationSection
          problemId={problem.id}
          problemSlug={problem.slug}
          priorAttempts={attempts}
          nextProblem={nextProblem}
        />
      </div>
      <div className="order-3 md:col-start-1 md:row-start-2 md:self-start">
        <HintsPanel hints={problem.hints ?? []} />
      </div>
    </div>
  );
}
