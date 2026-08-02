"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { DashboardDrawer } from "@/components/layout/dashboard-drawer";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { buildBreadcrumbs } from "@/lib/breadcrumbs";
import type { User } from "@/types/api";

export function DashboardTopbar({ user }: { user: User }) {
  const pathname = usePathname();
  const crumbs = buildBreadcrumbs(pathname, user.role);
  const current = crumbs[crumbs.length - 1];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6 lg:px-8">
      <DashboardDrawer role={user.role} />

      <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
        <ol className="hidden items-center gap-1 text-sm text-muted-foreground sm:flex">
          {crumbs.map((crumb, index) =>
            index === crumbs.length - 1 ? (
              <li
                key={crumb.href}
                aria-current="page"
                className="truncate font-medium text-foreground"
              >
                {crumb.label}
              </li>
            ) : (
              <Fragment key={crumb.href}>
                <li>
                  <Link href={crumb.href} className="hover:text-foreground">
                    {crumb.label}
                  </Link>
                </li>
                <ChevronRight className="size-3.5" aria-hidden="true" />
              </Fragment>
            ),
          )}
        </ol>
        <p className="truncate font-medium sm:hidden">{current.label}</p>
      </nav>

      <ThemeToggle />
      <UserMenu user={user} />
    </header>
  );
}
