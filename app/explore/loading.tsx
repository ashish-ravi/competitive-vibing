import { Skeleton } from '@/components/ui/skeleton';

export default function ExploreLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-3 pl-16">
          <Skeleton className="h-6 w-48" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
