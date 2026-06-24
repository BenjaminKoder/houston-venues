import { useState } from "react";
import { categoryIcon, initials, nameGradient } from "@/lib/venue-visuals";
import type { Venue } from "@/lib/venue-types";
import { cn } from "@/lib/utils";

interface Props {
  venue: Venue;
  className?: string;
  /** When true, render only the elegant placeholder (no image attempt). */
  forcePlaceholder?: boolean;
}

/** Hero image with graceful fallback to a generated, intentional placeholder. */
export function VenueImage({ venue, className, forcePlaceholder }: Props) {
  const [failed, setFailed] = useState(false);
  const showImage = !forcePlaceholder && !!venue.imageUrl && !failed;
  const Icon = categoryIcon(venue.category);

  if (showImage) {
    return (
      <img
        src={venue.imageUrl as string}
        alt={venue.name}
        loading="lazy"
        onError={() => setFailed(true)}
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden",
        className,
      )}
      style={{ background: nameGradient(venue.name) }}
      aria-label={`${venue.name} placeholder`}
    >
      <Icon
        className="absolute -right-3 -bottom-3 h-24 w-24 text-foreground/10"
        strokeWidth={1.25}
      />
      <span className="font-display text-3xl font-semibold text-foreground/70">
        {initials(venue.name)}
      </span>
    </div>
  );
}
