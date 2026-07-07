import { Skeleton } from '@/components/ui/skeleton';

export default function ProblemLoading() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-44 w-full rounded-md" />
        <Skeleton className="h-11 w-full rounded-md" />
      </div>
    </div>
  );
}
