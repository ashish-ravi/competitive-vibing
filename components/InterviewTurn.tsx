import { cn } from '@/lib/utils';

export type TurnResolution = 'addressed' | 'partially_addressed' | 'not_addressed';

const RESOLUTION_CONFIG: Record<TurnResolution, { symbol: string; label: string; className: string }> = {
  addressed: {
    symbol: '✓',
    label: 'Addressed',
    className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  },
  partially_addressed: {
    symbol: '~',
    label: 'Partially addressed',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  },
  not_addressed: {
    symbol: '✗',
    label: 'Not addressed',
    className: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  },
};

interface InterviewTurnProps {
  question: string;
  answer?: string;
  assessment?: { resolution: TurnResolution; note: string };
}

export function InterviewTurn({ question, answer, assessment }: InterviewTurnProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-start">
        <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-muted px-3.5 py-2.5 text-sm">
          {question}
        </div>
      </div>
      {answer && (
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-3.5 py-2.5 text-sm text-primary-foreground">
            {answer}
          </div>
        </div>
      )}
      {assessment && (
        <div className="flex justify-end">
          <div className="flex max-w-[85%] items-start gap-1.5 text-xs text-muted-foreground">
            <span
              className={cn(
                'inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                RESOLUTION_CONFIG[assessment.resolution].className
              )}
              title={RESOLUTION_CONFIG[assessment.resolution].label}
            >
              {RESOLUTION_CONFIG[assessment.resolution].symbol}
            </span>
            <span>{assessment.note}</span>
          </div>
        </div>
      )}
    </div>
  );
}
