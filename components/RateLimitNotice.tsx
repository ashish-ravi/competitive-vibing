export function RateLimitNotice({ retryAfter }: { retryAfter: number }) {
  const minutes = Math.max(1, Math.ceil(retryAfter / 60));
  return (
    <div
      role="status"
      className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
    >
      You&apos;ve reached the rate limit of 10 AI evaluations per hour. It resets in about{' '}
      {minutes} minute{minutes === 1 ? '' : 's'} — a good moment to reread the problem or sketch
      another approach.
    </div>
  );
}
