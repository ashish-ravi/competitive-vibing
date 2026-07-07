import { Badge } from '@/components/ui/badge';
import type { Verdict } from '@/lib/db';

const CONFIG: Record<Verdict, { label: string; variant: 'success' | 'warning' | 'destructive' }> = {
  correct: { label: 'Correct', variant: 'success' },
  partial: { label: 'Partial', variant: 'warning' },
  incorrect: { label: 'Needs work', variant: 'destructive' },
};

export function VerdictBadge({ verdict, className }: { verdict: Verdict; className?: string }) {
  const { label, variant } = CONFIG[verdict];
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}
