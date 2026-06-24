import { BadgeCheck, Clock3, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingPill({
  rating,
  approximate,
  className,
}: {
  rating: number | null;
  approximate?: boolean;
  className?: string;
}) {
  if (rating == null) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-card/90 px-2 py-0.5 text-xs font-semibold text-foreground shadow-sm backdrop-blur",
        approximate && "border-b border-dotted border-muted-foreground/60",
        className,
      )}
      title={approximate ? "From sheet — confirm with Enrich with AI" : "Google rating"}
    >
      <Star className="h-3 w-3 fill-warning text-warning" />
      {rating.toFixed(1)}
    </span>
  );
}

export function VerifiedBadge({
  verified,
  className,
}: {
  verified: boolean;
  className?: string;
}) {
  if (verified) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-success/12 px-2 py-0.5 text-xs font-medium text-success",
          className,
        )}
      >
        <BadgeCheck className="h-3.5 w-3.5" />
        Verified
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning-foreground",
        className,
      )}
      title="Web fields are from the team's sheet — confirm with Enrich with AI"
    >
      <Clock3 className="h-3.5 w-3.5" />
      Pending verification
    </span>
  );
}
