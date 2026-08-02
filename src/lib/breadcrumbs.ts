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
  const segments = pathname.slice(base.length).split("/").filter(Boolean);
  let href = base;

  segments.forEach((segment, index) => {
    href += `/${segment}`;

    // `…/gear/<id>/edit` has no detail page behind the id, so the id would be
    // a dead crumb — skip it and let "Edit" hang off the list instead.
    if (isId(segment) && segments[index + 1] === "edit") {
      return;
    }

    crumbs.push({
      href,
      label:
        navLabels.get(href) ??
        segmentLabels[segment] ??
        (isId(segment) ? "Details" : titleCase(segment)),
    });
  });

  return crumbs;
}
