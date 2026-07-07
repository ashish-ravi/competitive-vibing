'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MAX_EXPLANATION_CHARS } from '@/lib/schemas';
import { cn } from '@/lib/utils';

interface ExplanationInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}

const MIN_CHARS = 20;

export function ExplanationInput({ value, onChange, onSubmit, disabled }: ExplanationInputProps) {
  const remaining = MAX_EXPLANATION_CHARS - value.length;
  const tooShort = value.trim().length < MIN_CHARS;

  return (
    <div className="space-y-2">
      <label htmlFor="explanation" className="text-sm font-semibold">
        Your approach
      </label>
      <Textarea
        id="explanation"
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_EXPLANATION_CHARS))}
        placeholder={
          'Explain how you would solve it — plain English or pseudocode.\n\ne.g. "I\'d use a hash map to store each number I\'ve seen. For each element, check if target minus it is already in the map..."'
        }
        rows={7}
        disabled={disabled}
        className="min-h-[10.5rem] resize-y"
        maxLength={MAX_EXPLANATION_CHARS}
      />
      <div className="flex items-center justify-between gap-3">
        <span
          className={cn(
            'text-xs tabular-nums',
            remaining < 100 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'
          )}
        >
          {remaining} characters left
        </span>
      </div>
      {/* Sticky on mobile so the CTA stays reachable above the virtual keyboard */}
      <div className="sticky bottom-0 z-30 -mx-4 border-t bg-background/95 px-4 py-3 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:p-0">
        <Button
          type="button"
          onClick={onSubmit}
          disabled={disabled || tooShort}
          className="w-full md:w-auto"
          size="lg"
        >
          {disabled ? 'Evaluating…' : 'Evaluate my approach'}
        </Button>
        {tooShort && value.length > 0 && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            Add a bit more detail (at least {MIN_CHARS} characters) so the AI has something to work
            with.
          </p>
        )}
      </div>
    </div>
  );
}
