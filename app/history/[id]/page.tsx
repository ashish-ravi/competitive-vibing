import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { getEvaluationDetail } from '@/lib/history';
import {
  evaluationResultSchema,
  interviewFinalResultSchema,
} from '@/lib/schemas';
import { CounterexampleCard } from '@/components/CounterexampleCard';
import { DifficultyBadge } from '@/components/DifficultyBadge';
import { EvaluationResult, type PartialEvaluation } from '@/components/EvaluationResult';
import { FinalAssessmentCard } from '@/components/FinalAssessmentCard';
import { InterviewTurn } from '@/components/InterviewTurn';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import type { Difficulty } from '@/lib/db';
import { cn, formatRelativeTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function HistoryDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) redirect('/');

  if (!z.string().uuid().safeParse(params.id).success) notFound();

  const evaluation = await getEvaluationDetail(params.id);
  // Don't leak existence of other users' evaluations at the page level;
  // the API route returns an explicit 403 instead.
  if (!evaluation || evaluation.user_id !== session.user.id) notFound();

  const parsedResult = evaluationResultSchema.safeParse(evaluation.full_response);
  const display: PartialEvaluation = parsedResult.success
    ? {
        verdict: parsedResult.data.verdict,
        commentary: parsedResult.data.commentary,
        correctness: { explanation: parsedResult.data.correctness.explanation },
        edgeCases: {
          missed: parsedResult.data.edge_cases.missed,
          explanation: parsedResult.data.edge_cases.explanation,
        },
        complexity: parsedResult.data.complexity,
        scores: {
          total: parsedResult.data.score,
          correctness: parsedResult.data.correctness.score,
          edge_cases: parsedResult.data.edge_cases.score,
          complexity: parsedResult.data.complexity.score,
          clarity: parsedResult.data.clarity.score,
        },
      }
    : {
        verdict: evaluation.verdict,
        commentary: evaluation.ai_commentary,
        edgeCases: { missed: evaluation.edge_cases_missed, explanation: '' },
        complexity: evaluation.complexity,
      };

  const finalAssessment = evaluation.final_assessment
    ? interviewFinalResultSchema.safeParse(evaluation.final_assessment)
    : null;
  const turns = evaluation.interview_turns ?? [];

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight">
            {evaluation.problem ? (
              <Link
                href={`/problems/${evaluation.problem.slug}`}
                className="hover:underline underline-offset-4"
              >
                {evaluation.problem.title}
              </Link>
            ) : (
              'Removed problem'
            )}
          </h1>
          {evaluation.problem && (
            <DifficultyBadge difficulty={evaluation.problem.difficulty as Difficulty} />
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Attempted {formatRelativeTime(evaluation.created_at)}
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Your explanation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{evaluation.explanation}</p>
        </CardContent>
      </Card>

      <EvaluationResult evaluation={display} streaming={false} />

      {turns.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Interview transcript
              {evaluation.interview_status === 'active' && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  (not completed)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {turns.map((turn) => (
              <InterviewTurn
                key={turn.index}
                question={turn.question}
                answer={turn.answer}
                assessment={
                  finalAssessment?.success
                    ? finalAssessment.data.question_assessments.find(
                        (a) => a.turn_index === turn.index
                      )
                    : undefined
                }
              />
            ))}
          </CardContent>
        </Card>
      )}

      {evaluation.interview_status === 'complete' &&
        finalAssessment?.success &&
        evaluation.final_verdict &&
        evaluation.final_score !== null && (
          <FinalAssessmentCard
            initialVerdict={evaluation.verdict}
            initialScore={evaluation.score}
            finalVerdict={evaluation.final_verdict}
            finalScore={evaluation.final_score}
            deltaReason={finalAssessment.data.score_delta_reason}
            commentary={finalAssessment.data.final_commentary}
            streaming={false}
          />
        )}

      {evaluation.counterexample_status === 'verified' && evaluation.counterexample && (
        <CounterexampleCard evaluationId={evaluation.id} stored={evaluation.counterexample} />
      )}

      <div className="flex justify-between">
        <Link
          href="/history"
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
        >
          ← All history
        </Link>
        {evaluation.problem && (
          <Link
            href={`/problems/${evaluation.problem.slug}`}
            className={cn(buttonVariants({ size: 'sm' }))}
          >
            Try again
          </Link>
        )}
      </div>
    </div>
  );
}
