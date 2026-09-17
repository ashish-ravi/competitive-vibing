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
    <Card>
      <CardHeader>
        <CardTitle className="text-[22px]">After the interview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2">
            <VerdictBadge verdict={initialVerdict} />
            <span className="text-[17px] tabular-nums text-muted-foreground">{initialScore}</span>
          </span>
          <svg className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="became">
            <path d="M5 12h14m-6-6 6 6-6 6" />
          </svg>
          {finalVerdict !== undefined && finalScore !== undefined ? (
            <span className="flex items-center gap-2">
              <VerdictBadge verdict={finalVerdict} />
              <span className="text-[22px] font-semibold tabular-nums tracking-title">{finalScore}</span>
            </span>
          ) : (
            streaming && <StreamingCursor />
          )}
        </div>
        {deltaReason && (
          <p className="text-[15px] leading-relaxed text-muted-foreground">{deltaReason}</p>
        )}
        {commentary && (
          <p className="text-[17px] leading-relaxed">
            {commentary}
            {streaming && finalScore === undefined && <StreamingCursor />}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
