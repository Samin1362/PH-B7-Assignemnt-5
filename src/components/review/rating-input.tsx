"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const labels = ["Poor", "Fair", "Good", "Very good", "Excellent"];

/**
 * A radio group rather than buttons, so arrow keys move between stars and
 * screen readers announce "3 stars — Good" instead of five bare buttons.
 */
export function RatingInput({
  value,
  onChange,
  disabled = false,
  name = "rating",
}: {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
  name?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div role="radiogroup" aria-label="Rating" className="flex gap-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <label
            key={rating}
            className={cn(
              "cursor-pointer rounded-md p-0.5 transition-colors focus-within:ring-2 focus-within:ring-ring",
              disabled && "cursor-not-allowed opacity-60",
            )}
          >
            <input
              type="radio"
              name={name}
              value={rating}
              checked={value === rating}
              disabled={disabled}
              onChange={() => onChange(rating)}
              className="sr-only"
            />
            <Star
              className={cn(
                "size-7 transition-colors",
                rating <= value
                  ? "fill-primary text-primary"
                  : "text-muted-foreground/40",
              )}
            />
            <span className="sr-only">
              {rating} star{rating === 1 ? "" : "s"} — {labels[rating - 1]}
            </span>
          </label>
        ))}
      </div>
      <span className="text-sm text-muted-foreground">
        {value ? labels[value - 1] : "Tap a star"}
      </span>
    </div>
  );
}
