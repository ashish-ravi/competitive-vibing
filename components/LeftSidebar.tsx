import { auth } from '@/lib/auth';
import { SidebarNav } from '@/components/SidebarNav';

/** Desktop-only left rail. Hidden when signed out and below lg. */
export async function LeftSidebar() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-52 shrink-0 border-r lg:block">
      <div className="py-4 pr-3">
        <SidebarNav />
      </div>
    </aside>
  );
}
