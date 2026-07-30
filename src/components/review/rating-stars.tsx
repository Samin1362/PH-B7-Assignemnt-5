import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const sizes = {
  sm: "size-3.5",
  md: "size-4",
  lg: "size-5",
} as const;

function Row({ size, className }: { size: keyof typeof sizes; className: string }) {
  return (
    <span className={cn("flex w-max", className)}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} className={cn(sizes[size], "shrink-0")} />
      ))}
    </span>
  );
}

/** Renders a fractional rating by clipping a filled row over an empty one. */
export function RatingStars({
  rating,
  size = "md",
  className,
}: {
  rating: number;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(5, rating));

  return (
    <span
      className={cn("relative inline-flex", className)}
      role="img"
      aria-label={`Rated ${clamped.toFixed(1)} out of 5`}
    >
      <Row size={size} className="text-muted-foreground/30" />
      <span
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${(clamped / 5) * 100}%` }}
      >
        <Row size={size} className="fill-primary text-primary" />
      </span>
    </span>
  );
}
