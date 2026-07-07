import { Skeleton } from '@/components/ui/skeleton';

export default function HistoryDetailLoading() {
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Skeleton className="h-7 w-2/3" />
      <Skeleton className="h-28 rounded-lg" />
      <Skeleton className="h-64 rounded-lg" />
    </div>
  );
}
