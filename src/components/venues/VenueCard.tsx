import { MapPin } from "lucide-react";
import { VenueImage } from "./VenueImage";
import { RatingPill, VerifiedBadge } from "./Badges";
import type { Venue } from "@/lib/venue-types";

export function VenueCard({
  venue,
  onClick,
}: {
  venue: Venue;
  onClick: () => void;
}) {
  const price = venue.priceProposed || venue.priceOnline;
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-left shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <VenueImage
          venue={venue}
          forcePlaceholder={!venue.imageVerified && !venue.imageUrl}
          className="transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span className="rounded-full bg-card/90 px-2 py-0.5 text-xs font-medium text-foreground shadow-sm backdrop-blur">
            {venue.category ?? "Venue"}
          </span>
        </div>
        {venue.googleRating != null && (
          <div className="absolute right-3 top-3">
            <RatingPill
              rating={venue.googleRating}
              approximate={!venue.verified}
            />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold leading-snug text-foreground">
            {venue.name}
          </h3>
        </div>

        {venue.neighborhood && (
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {venue.neighborhood}
          </p>
        )}

        {price && (
          <p className="text-sm font-medium text-foreground">{price}</p>
        )}

        {venue.amenities.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1.5">
            {venue.amenities.slice(0, 2).map((a) => (
              <span
                key={a}
                className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
              >
                {a}
              </span>
            ))}
            {venue.amenities.length > 2 && (
              <span className="rounded-full px-1.5 py-0.5 text-xs text-muted-foreground">
                +{venue.amenities.length - 2}
              </span>
            )}
          </div>
        )}

        <div className="mt-auto pt-2">
          {!venue.verified && <VerifiedBadge verified={false} />}
        </div>
      </div>
    </button>
  );
}
