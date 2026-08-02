"use client";

import { PanelLeftClose, PanelLeftOpen, Store } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { Logo } from "@/components/layout/logo";
import { sidebarCookie } from "@/constants/nav";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/api";

export function DashboardSidebar({
  role,
  defaultCollapsed = false,
}: {
  role: UserRole;
  defaultCollapsed?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    document.cookie = `${sidebarCookie}=${next ? "collapsed" : "expanded"}; path=/; max-age=31536000; samesite=lax`;
  };

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-svh shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] md:flex",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center border-b border-sidebar-border px-4",
          collapsed && "justify-center px-0",
        )}
      >
        <Logo href="/" compact={collapsed} />
      </div>

      <div className={cn("flex-1 overflow-y-auto p-3", collapsed && "px-2")}>
        <DashboardNav role={role} collapsed={collapsed} />
      </div>

      <div className={cn("space-y-1 border-t border-sidebar-border p-3", collapsed && "px-2")}>
        <Link
          href="/gear"
          title={collapsed ? "Browse gear" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
            collapsed && "justify-center px-0",
          )}
        >
          <Store className="size-4 shrink-0" />
          <span className={cn(collapsed && "sr-only")}>Browse gear</span>
        </Link>

        <button
          type="button"
          onClick={toggle}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
            collapsed && "justify-center px-0",
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4 shrink-0" />
          ) : (
            <>
              <PanelLeftClose className="size-4 shrink-0" />
              Collapse
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
