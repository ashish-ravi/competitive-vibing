import { cn } from '@/lib/utils';

export type TurnResolution = 'addressed' | 'partially_addressed' | 'not_addressed';

const RESOLUTION_CONFIG: Record<TurnResolution, { symbol: string; label: string; className: string }> = {
  addressed: { symbol: '✓', label: 'Addressed', className: 'bg-ease text-white' },
  partially_addressed: { symbol: '~', label: 'Partially addressed', className: 'bg-grind text-white' },
  not_addressed: { symbol: '✕', label: 'Not addressed', className: 'bg-boss text-white' },
};

interface InterviewTurnProps {
  question: string;
  answer?: string;
  assessment?: { resolution: TurnResolution; note: string };
}

/** Messages-style exchange: interviewer on the left in grey, you on the right in the accent. */
export function InterviewTurn({ question, answer, assessment }: InterviewTurnProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-start">
        <p className="max-w-[85%] rounded-[18px] rounded-bl-[4px] bg-secondary px-4 py-2.5 text-[15px] leading-relaxed">
          {question}
        </p>
      </div>
      {answer && (
        <div className="flex justify-end">
          <p className="max-w-[85%] rounded-[18px] rounded-br-[4px] bg-primary px-4 py-2.5 text-[15px] leading-relaxed text-primary-foreground">
            {answer}
          </p>
        </div>
      )}
      {assessment && (
        <div className="flex justify-end">
          <p className="flex max-w-[85%] items-start gap-2 text-[13px] leading-relaxed text-muted-foreground">
            <span
              className={cn(
                'mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                RESOLUTION_CONFIG[assessment.resolution].className
              )}
              role="img"
              aria-label={RESOLUTION_CONFIG[assessment.resolution].label}
            >
              {RESOLUTION_CONFIG[assessment.resolution].symbol}
            </span>
            <span>{assessment.note}</span>
          </p>
        </div>
      )}
    </div>
  );
}
