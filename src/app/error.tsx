"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-4 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-tone-danger text-tone-danger-foreground">
        <TriangleAlert className="size-7" />
      </span>

      <h1 className="mt-6 text-2xl font-semibold sm:text-3xl">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        The page could not be displayed. Trying again usually fixes it — if it
        keeps happening, head back to the home page.
      </p>

      {error.digest ? (
        <p className="mt-3 text-xs text-muted-foreground tabular-nums">
          Reference: {error.digest}
        </p>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button onClick={reset}>
          <RotateCcw />
          Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Go to the home page</Link>
        </Button>
      </div>
    </main>
  );
}
