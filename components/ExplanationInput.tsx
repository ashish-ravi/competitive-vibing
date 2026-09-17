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
    <div>
      <label htmlFor="explanation" className="block text-[22px] font-semibold tracking-title">
        Your approach
      </label>
      <p className="mt-1 text-[15px] text-muted-foreground">
        Plain English or pseudocode. Say how it works, what it handles, and how fast it runs.
      </p>
      <Textarea
        id="explanation"
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_EXPLANATION_CHARS))}
        placeholder={
          'e.g. “Keep a hash map of the numbers I’ve seen. For each number, check whether target minus it is already in the map…”'
        }
        rows={7}
        disabled={disabled}
        className="mt-4 min-h-[11rem] resize-y"
        maxLength={MAX_EXPLANATION_CHARS}
      />
      <p
        className={cn(
          'mt-2 text-[13px] tabular-nums',
          remaining < 100 ? 'text-grind' : 'text-muted-foreground'
        )}
      >
        {remaining} characters left
      </p>

      {/* Sticky on mobile so the CTA stays reachable above the virtual keyboard */}
      <div className="sticky bottom-0 z-30 -mx-4 mt-3 border-t border-black/[0.06] bg-background/80 px-4 py-3 backdrop-blur-xl dark:border-white/[0.08] md:static md:mx-0 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
        <Button
          type="button"
          onClick={onSubmit}
          disabled={disabled || tooShort}
          className="w-full md:w-auto md:min-w-[200px]"
          size="lg"
        >
          {disabled ? 'Evaluating…' : 'Evaluate approach'}
        </Button>
        {tooShort && value.length > 0 && (
          <p className="mt-2 text-[13px] text-muted-foreground">
            Add a little more detail — at least {MIN_CHARS} characters — so there’s something to
            evaluate.
          </p>
        )}
      </div>
    </div>
  );
}
