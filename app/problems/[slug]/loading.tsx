import { Skeleton } from '@/components/ui/skeleton';

export default function ProblemLoading() {
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 md:grid-cols-2 md:gap-12 lg:gap-16">
      <div className="space-y-6">
        <Skeleton className="h-5 w-40 rounded-md" />
        <Skeleton className="h-10 w-3/4 rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-7 w-40 rounded-md" />
        <Skeleton className="h-4 w-72 rounded-md" />
        <Skeleton className="h-44 w-full rounded-xl" />
        <Skeleton className="h-12 w-52 rounded-full" />
      </div>
    </div>
  );
}
