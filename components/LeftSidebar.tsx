import { auth } from '@/lib/auth';
import { SidebarNav } from '@/components/SidebarNav';

/**
 * Desktop navigation rail. Sits directly on the page surface with no
 * border or fill of its own — the selected item is the only chrome.
 */
export function SidebarPanel() {
  return (
    <aside className="sticky top-12 hidden h-[calc(100dvh-3rem)] w-60 shrink-0 lg:block">
      <div className="py-8 pl-6">
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
