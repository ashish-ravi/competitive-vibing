import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { listHistory } from '@/lib/history';
import { historyQuerySchema } from '@/lib/schemas';
import { EmptyState } from '@/components/EmptyState';
import { HistoryList } from '@/components/HistoryList';
import { PageHeader } from '@/components/PageHeader';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const session = await auth();
  if (!session?.user) redirect('/');

  const parsed = historyQuerySchema.safeParse(searchParams);
  const page = parsed.success ? parsed.data.page : 1;

  const { items, hasMore } = await listHistory(session.user.id, page);

  if (items.length === 0 && page === 1) {
    return <EmptyState />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader title="History" description="Every evaluation you’ve received, newest first." />
      <HistoryList items={items} />
      {(page > 1 || hasMore) && (
        <div className="flex items-center justify-between">
          {page > 1 ? (
            <Link
              href={`/history?page=${page - 1}`}
              className={cn(buttonVariants({ variant: 'secondary' }))}
            >
              Newer
            </Link>
          ) : (
            <span />
          )}
          {hasMore && (
            <Link
              href={`/history?page=${page + 1}`}
              className={cn(buttonVariants({ variant: 'secondary' }))}
            >
              Older
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
