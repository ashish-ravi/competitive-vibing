import { auth, signIn } from '@/lib/auth';
import { listProblems, listTopics } from '@/lib/problems';
import { ProblemCard } from '@/components/ProblemCard';
import { ProblemFilters } from '@/components/ProblemFilters';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { topic?: string; difficulty?: string };
}) {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 py-16 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Explain the algorithm. <span className="text-primary">Before you code it.</span>
        </h1>
        <p className="text-muted-foreground">
          Describe your approach in plain English or pseudocode and get instant AI feedback on
          correctness, edge cases, and complexity — the way a real interviewer would probe your
          thinking.
        </p>
        <form
          action={async () => {
            'use server';
            await signIn('google');
          }}
        >
          <Button size="lg" type="submit">
            Sign in with Google
          </Button>
        </form>
        <Card className="w-full text-left">
          <CardContent className="pt-4 text-sm text-muted-foreground">
            <p className="mb-2 font-medium text-foreground">How it works</p>
            <ol className="list-decimal space-y-1 pl-5">
              <li>Pick a problem and read it carefully.</li>
              <li>Explain your approach — no code needed.</li>
              <li>Get a verdict, missed edge cases, and complexity analysis.</li>
              <li>Answer follow-up questions like a real interview.</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    );
  }

  const difficulty =
    searchParams.difficulty === 'easy' ||
    searchParams.difficulty === 'medium' ||
    searchParams.difficulty === 'hard'
      ? searchParams.difficulty
      : undefined;

  const [problems, topics] = await Promise.all([
    listProblems({ topic: searchParams.topic, difficulty }),
    listTopics(),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Problems</h1>
        <p className="text-sm text-muted-foreground">
          Pick one and explain how you&apos;d solve it.
        </p>
      </div>
      <ProblemFilters topics={topics} />
      {problems.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No problems match these filters. Try clearing them — or if this is a fresh setup, run{' '}
            <code className="rounded bg-muted px-1.5 py-0.5">npm run seed</code> to generate the
            problem bank.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {problems.map((p) => (
            <ProblemCard key={p.id} problem={p} />
          ))}
        </div>
      )}
    </div>
  );
}
