import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col items-center gap-4 pt-4">
        <Skeleton className="h-[88px] w-[88px] rounded-full" />
        <Skeleton className="h-9 w-56 rounded-lg" />
        <Skeleton className="h-4 w-40 rounded-md" />
      </div>
      <Skeleton className="h-60" />
      <Skeleton className="h-80" />
      <Skeleton className="h-52" />
    </div>
  );
}
