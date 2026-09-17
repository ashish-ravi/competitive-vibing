import { Notice } from '@/components/Notice';

export function RateLimitNotice({ retryAfter }: { retryAfter: number }) {
  const minutes = Math.max(1, Math.ceil(retryAfter / 60));
  return (
    <Notice tone="warning">
      You’ve used your 10 AI evaluations for this hour. They come back in about {minutes} minute
      {minutes === 1 ? '' : 's'}. Until then, reread the problem or sketch another approach.
    </Notice>
  );
}
