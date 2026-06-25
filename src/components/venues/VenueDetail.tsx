import {
  ExternalLink,
  MapPin,
  Pencil,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { VenueImage } from "./VenueImage";
import { RatingPill, VerifiedBadge } from "./Badges";
import { cn } from "@/lib/utils";
import type { Venue } from "@/lib/venue-types";

function Field({
  label,
  children,
  pending,
}: {
  label: string;
  children: React.ReactNode;
  pending?: boolean;
}) {
  if (children == null || children === "") return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 text-sm leading-relaxed text-foreground",
          pending &&
            "decoration-dotted underline decoration-muted-foreground/60 underline-offset-4",
        )}
        title={pending ? "From sheet — confirm with Enrich with AI" : undefined}
      >
        {children}
      </p>
    </div>
  );
}

export function VenueDetail({
  venue,
  open,
  onOpenChange,
  onEdit,
  onLocate,
  onEnrich,
  onDelete,
}: {
  venue: Venue | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onEdit: (v: Venue) => void;
  onLocate: (v: Venue) => void;
  onEnrich: (v: Venue) => void;
  onDelete: (v: Venue) => void;
}) {
  if (!venue) return null;
  const pending = !venue.verified;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] gap-0 overflow-y-auto p-0 sm:max-w-2xl">
        <DialogTitle className="sr-only">{venue.name}</DialogTitle>
        <DialogDescription className="sr-only">
          Details for {venue.name}
          {venue.neighborhood ? ` in ${venue.neighborhood}` : ""}.
        </DialogDescription>
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <VenueImage
            venue={venue}
            forcePlaceholder={!venue.imageVerified && !venue.imageUrl}
          />
          <div className="absolute right-4 top-4">
            {venue.googleRating != null && (
              <RatingPill rating={venue.googleRating} approximate={pending} />
            )}
          </div>
        </div>

        <div className="space-y-5 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                  {venue.category ?? "Venue"}
                </span>
                <VerifiedBadge verified={venue.verified} />
              </div>
              <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">
                {venue.name}
              </h2>
              {venue.venueGroup && (
                <p className="text-sm text-muted-foreground">{venue.venueGroup}</p>
              )}
            </div>
          </div>

          {(venue.neighborhood || venue.address) && (
            <p
              className={cn(
                "flex items-start gap-1.5 text-sm text-muted-foreground",
                pending &&
                  "decoration-dotted underline decoration-muted-foreground/50 underline-offset-4",
              )}
              title={pending ? "From sheet — confirm with Enrich with AI" : undefined}
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {venue.neighborhood}
                {venue.neighborhood && venue.address ? " — " : ""}
                {venue.address}
                {venue.coordsApproximate && venue.lat != null && (
                  <span className="ml-1 italic">(approximate pin)</span>
                )}
              </span>
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 rounded-xl bg-secondary/60 p-4 sm:grid-cols-2">
            <Field label="Proposed price">{venue.priceProposed}</Field>
            <Field label="Online / list price">{venue.priceOnline}</Field>
            {venue.priceNote && (
              <div className="sm:col-span-2">
                <Field label="Price note">{venue.priceNote}</Field>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Field label="Impression">{venue.impression}</Field>
            <Field label="Intended use">{venue.use}</Field>
            <Field label="Status">{venue.status}</Field>
            {venue.notes && <Field label="Notes">{venue.notes}</Field>}
          </div>

          {venue.amenities.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Amenities & AV
              </p>
              <div className="flex flex-wrap gap-1.5">
                {venue.amenities.map((a) => (
                  <span
                    key={a}
                    className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
            <span>Source: {venue.source || "—"}</span>
            {venue.website && (
              <a
                href={venue.website}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
              >
                Visit website <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => onEdit(venue)} className="gap-1.5">
              <Pencil className="h-4 w-4" /> Edit
            </Button>
            {venue.lat != null && venue.lng != null && (
              <Button
                variant="secondary"
                onClick={() => onLocate(venue)}
                className="gap-1.5"
              >
                <MapPin className="h-4 w-4" /> Locate on map
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => onEnrich(venue)}
              className="gap-1.5"
            >
              <Sparkles className="h-4 w-4" /> Enrich with AI
            </Button>
            <Button
              variant="ghost"
              onClick={() => onDelete(venue)}
              className="gap-1.5 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
