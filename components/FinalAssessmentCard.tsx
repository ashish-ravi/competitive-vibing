import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StreamingCursor } from '@/components/StreamingCursor';
import { VerdictBadge } from '@/components/VerdictBadge';
import type { Verdict } from '@/lib/db';

interface FinalAssessmentCardProps {
  initialVerdict: Verdict;
  initialScore: number;
  finalVerdict?: Verdict;
  finalScore?: number;
  deltaReason?: string;
  commentary?: string;
  streaming: boolean;
}

export function FinalAssessmentCard({
  initialVerdict,
  initialScore,
  finalVerdict,
  finalScore,
  deltaReason,
  commentary,
  streaming,
}: FinalAssessmentCardProps) {
  return (
    <Card className="border-primary/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">After the interview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <VerdictBadge verdict={initialVerdict} />
          <span className="tabular-nums text-muted-foreground">{initialScore}</span>
          <span className="text-muted-foreground" aria-hidden>
            →
          </span>
          {finalVerdict !== undefined && finalScore !== undefined ? (
            <>
              <VerdictBadge verdict={finalVerdict} />
              <span className="font-semibold tabular-nums">{finalScore}</span>
            </>
          ) : (
            streaming && <StreamingCursor />
          )}
        </div>
        {deltaReason && <p className="text-sm text-muted-foreground">{deltaReason}</p>}
        {commentary && (
          <p className="text-sm leading-relaxed">
            {commentary}
            {streaming && finalScore === undefined && <StreamingCursor />}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
