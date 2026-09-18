'use client';

import { useState, useTransition } from 'react';
import { deleteAccountAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Notice } from '@/components/Notice';

/**
 * Two-step destructive action: the first press reveals a plain-language
 * warning with Cancel; only the second press deletes. Never the default
 * button style — destructive actions don't get the prominent role.
 */
export function DeleteAccount() {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function confirm() {
    setError(null);
    startTransition(async () => {
      const result = await deleteAccountAction();
      if (result && !result.ok) setError(result.error);
    });
  }

  if (!confirming) {
    return (
      <Button variant="ghost" size="sm" className="-ml-4 text-boss hover:bg-boss/[0.06]" onClick={() => setConfirming(true)}>
        Delete account…
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[15px] leading-relaxed">
        This permanently deletes your account, your progress, and every evaluation. It can’t be
        undone.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={() => setConfirming(false)} disabled={pending}>
          Cancel
        </Button>
        <Button variant="destructive" size="sm" onClick={confirm} disabled={pending}>
          {pending ? 'Deleting…' : 'Delete my account'}
        </Button>
      </div>
      {error && <Notice tone="error">{error}</Notice>}
    </div>
  );
}
