import { dashboardNav } from "@/constants/nav";
import { roleHome } from "@/constants/routes";
import type { UserRole } from "@/types/api";

export type Crumb = { href: string; label: string };

const segmentLabels: Record<string, string> = {
  profile: "Profile",
  new: "Add new",
  edit: "Edit",
  pay: "Payment",
};

const isId = (segment: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    segment,
  );

function titleCase(segment: string) {
  const spaced = segment.replace(/-/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * Builds the trail from the URL alone. Sidebar labels win over the generic
 * ones so the breadcrumb and the nav never disagree on the same page.
 */
export function buildBreadcrumbs(pathname: string, role: UserRole): Crumb[] {
  const home = roleHome[role];
  const base = pathname.startsWith(home) ? home : "/dashboard";
  const navLabels = new Map(
    dashboardNav[role].map((item) => [item.href, item.label]),
  );

  const crumbs: Crumb[] = [{ href: home, label: "Dashboard" }];
  let href = base;

  for (const segment of pathname.slice(base.length).split("/").filter(Boolean)) {
    href += `/${segment}`;
    crumbs.push({
      href,
      label:
        navLabels.get(href) ??
        segmentLabels[segment] ??
        (isId(segment) ? "Details" : titleCase(segment)),
    });
  }

  return crumbs;
}
