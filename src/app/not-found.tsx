import { Compass } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found — GearUp",
};

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-4 py-16 text-center">
      <Logo />

      <span className="mt-10 flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Compass className="size-7" />
      </span>

      <p className="mt-6 font-display text-5xl font-semibold tabular-nums">
        404
      </p>
      <h1 className="mt-2 text-2xl font-semibold">This trail does not exist</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        The page you are looking for was moved, removed, or never existed.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/gear">Browse gear</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Go to the home page</Link>
        </Button>
      </div>
    </main>
  );
}
