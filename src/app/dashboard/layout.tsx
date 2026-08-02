import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import { SkipLink } from "@/components/layout/skip-link";
import { sidebarCookie } from "@/constants/nav";
import { requireSession } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [user, cookieStore] = await Promise.all([requireSession(), cookies()]);
  const collapsed = cookieStore.get(sidebarCookie)?.value === "collapsed";

  return (
    <div className="flex min-h-svh bg-muted/30">
      <SkipLink />
      <DashboardSidebar role={user.role} defaultCollapsed={collapsed} />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar user={user} />
        <main id="main" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
