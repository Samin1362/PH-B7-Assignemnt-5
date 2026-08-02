"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dashboardNav } from "@/constants/nav";
import { roleHome } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/api";

/**
 * The overview item is the role home, so it only lights up on an exact
 * match — otherwise every page below it would keep it highlighted.
 */
export function isNavActive(href: string, pathname: string, home: string) {
  return href === home
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardNav({
  role,
  collapsed = false,
  onNavigate,
}: {
  role: UserRole;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const home = roleHome[role];

  return (
    <nav className="flex flex-col gap-1">
      {dashboardNav[role].map(({ href, label, icon: Icon }) => {
        const active = isNavActive(href, pathname, home);

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              collapsed && "justify-center px-0",
              active
                ? "bg-sidebar-primary/10 text-sidebar-primary"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className={cn(collapsed && "sr-only")}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
