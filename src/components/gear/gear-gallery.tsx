"use client";

import { useState } from "react";
import { GearImage } from "@/components/gear/gear-image";
import { cn } from "@/lib/utils";

const MAX_THUMBNAILS = 6;

export function GearGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const shown = images.slice(0, MAX_THUMBNAILS);
  const [active, setActive] = useState(0);

  return (
    <div className="space-y-3">
      <div className="relative aspect-4/3 overflow-hidden rounded-2xl border border-border bg-muted">
        <GearImage
          src={shown[active]}
          alt={name}
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>

      {shown.length > 1 ? (
        <ul className="grid grid-cols-6 gap-2">
          {shown.map((src, index) => (
            <li key={`${src}-${index}`}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show image ${index + 1} of ${shown.length}`}
                aria-current={index === active}
                className={cn(
                  "relative block aspect-square w-full overflow-hidden rounded-lg border-2 bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
                  index === active
                    ? "border-primary"
                    : "border-transparent hover:border-border",
                )}
              >
                <GearImage src={src} alt="" sizes="120px" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
