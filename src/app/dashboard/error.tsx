"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/** Keeps the sidebar and topbar around a failed dashboard page. */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-tone-danger text-tone-danger-foreground">
        <TriangleAlert className="size-6" />
      </span>
      <h2 className="mt-4 text-lg font-semibold">This page did not load</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Something went wrong on our side. Try again, or move on to another part
        of your dashboard.
      </p>
      {error.digest ? (
        <p className="mt-2 text-xs text-muted-foreground tabular-nums">
          Reference: {error.digest}
        </p>
      ) : null}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button onClick={reset}>
          <RotateCcw />
          Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">My dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
