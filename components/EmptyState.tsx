import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { EvaluationResult } from '@/components/EvaluationResult';
import { cn } from '@/lib/utils';

/**
 * Teaching empty state for first-time users (.claude/rules/product.md):
 * shows a worked example evaluation instead of a blank page.
 */
export function EmptyState() {
  return (
    <div className="mx-auto max-w-lg space-y-6 py-6">
      <div className="text-center">
        <h1 className="text-[32px] font-semibold leading-tight tracking-display">No evaluations yet</h1>
        <p className="mt-2 text-[17px] leading-relaxed text-muted-foreground">
          Explain an approach to any problem and your feedback will look like this.
        </p>
      </div>
      <EvaluationResult
        streaming={false}
        evaluation={{
          verdict: 'partial',
          commentary:
            'Your hash map idea is exactly the right instinct and gets you to O(n) time. Locking down the duplicate-value case would take this from good to interview-ready.',
          correctness: {
            explanation:
              'Storing seen numbers and checking for the complement solves the core problem for distinct values.',
          },
          edgeCases: {
            missed: ['Duplicate values that sum to the target (e.g. [3, 3] with target 6)'],
            explanation: 'Empty and single-element inputs were covered; duplicates were not.',
          },
          complexity: {
            time: 'O(n)',
            space: 'O(n)',
            explanation: 'One pass with a hash map holding up to n entries.',
          },
          scores: { total: 72, correctness: 32, edge_cases: 18, complexity: 16, clarity: 6 },
        }}
      />
      <div className="text-center">
        <Link href="/" className={cn(buttonVariants({ size: 'lg' }))}>
          Pick a problem
        </Link>
      </div>
    </div>
  );
}
