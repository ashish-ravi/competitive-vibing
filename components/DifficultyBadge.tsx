import { Badge } from '@/components/ui/badge';
import type { Difficulty } from '@/lib/db';

const VARIANT: Record<Difficulty, 'success' | 'warning' | 'destructive'> = {
  easy: 'success',
  medium: 'warning',
  hard: 'destructive',
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <Badge variant={VARIANT[difficulty]} className="capitalize">
      {difficulty}
    </Badge>
  );
}
