import { Skeleton } from '@/components/ui/skeleton';

export default function HomeLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-14 w-72" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-11 w-72 rounded-lg" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-11 w-full rounded-md" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="h-[104px] rounded-lg" />
        ))}
      </div>
    </div>
  );
}
