import { Mountain } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 font-display text-lg font-semibold tracking-tight",
        className,
      )}
    >
      <span className="rounded-lg bg-primary p-1.5 text-primary-foreground">
        <Mountain className="size-4" />
      </span>
      GearUp
    </Link>
  );
}
