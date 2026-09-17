import { Skeleton } from '@/components/ui/skeleton';

export default function ExploreLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div className="space-y-3">
        <Skeleton className="h-10 w-40 rounded-lg" />
        <Skeleton className="h-5 w-96 max-w-full rounded-md" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-3 pl-14 sm:pl-16">
          <Skeleton className="h-7 w-48 rounded-md" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-[78px]" />
            <Skeleton className="h-[78px]" />
          </div>
        </div>
      ))}
    </div>
  );
}
