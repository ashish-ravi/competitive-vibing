import { Skeleton } from '@/components/ui/skeleton';

export default function LeaderboardLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Skeleton className="h-14 w-64" />
      <Skeleton className="h-96 rounded-lg" />
    </div>
  );
}
