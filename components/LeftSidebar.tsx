import { auth } from '@/lib/auth';
import { SidebarNav } from '@/components/SidebarNav';

/** Desktop-only left rail: a floating card so the page backdrop never bleeds through. */
export async function LeftSidebar() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-56 shrink-0 py-4 lg:block">
      <div className="flex h-full flex-col rounded-lg border bg-card p-3 shadow-sm">
        <p className="px-3 pb-2 pt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          menu
        </p>
        <SidebarNav />
        <p className="mt-auto px-3 pb-1 font-mono text-[11px] text-muted-foreground/60">
          cv · v3
        </p>
      </div>
    </aside>
  );
}
