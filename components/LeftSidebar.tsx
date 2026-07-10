import { auth } from '@/lib/auth';
import { SidebarNav } from '@/components/SidebarNav';

/**
 * Presentational rail: flush full-height panel, opaque (the global dot
 * backdrop never shows through), separated by a single hairline.
 */
export function SidebarPanel() {
  return (
    <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-56 shrink-0 border-r bg-background lg:block">
      <div className="py-5 pl-3 pr-4">
        <SidebarNav />
      </div>
    </aside>
  );
}

/** Desktop-only left rail, signed-in only. */
export async function LeftSidebar() {
  const session = await auth();
  if (!session?.user) return null;
  return <SidebarPanel />;
}
