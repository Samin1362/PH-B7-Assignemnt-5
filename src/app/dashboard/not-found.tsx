import { SearchX } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";

/**
 * `notFound()` thrown inside the dashboard renders here, so a missing order
 * or gear item keeps the sidebar and topbar instead of dropping the user on
 * the bare site-wide 404. An unmatched URL still falls through to that one.
 */
export default function DashboardNotFound() {
  return (
    <EmptyState
      icon={SearchX}
      title="We could not find that"
      description="It may have been removed, or it belongs to another account."
      action={
        <Button asChild>
          <Link href="/dashboard">Back to my dashboard</Link>
        </Button>
      }
    />
  );
}
