import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import type { Venue } from "@/lib/venue-types";

type Suggestion = {
  address?: string | null;
  neighborhood?: string | null;
  lat?: number | null;
  lng?: number | null;
  googleRating?: number | null;
  website?: string | null;
  category?: string | null;
  capacity?: string | null;
  amenities?: string[];
  imageUrl?: string | null;
  confidence?: string;
};

interface Row {
  key: string;
  label: string;
  current: string;
  suggested: string;
  accepted: boolean;
  apply: (v: Venue) => void;
}

export function EnrichDialog({
  venue,
  open,
  onOpenChange,
  onApply,
}: {
  venue: Venue | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onApply: (v: Venue) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (!open || !venue) return;
    setLoading(true);
    setError(null);
    setSuggestion(null);
    setRows([]);
    (async () => {
      const { data, error: fnErr } = await supabase.functions.invoke(
        "enrich-venue",
        {
          body: {
            name: venue.name,
            neighborhood: venue.neighborhood,
            address: venue.address,
            website: venue.website,
            category: venue.category,
          },
        },
      );
      setLoading(false);
      if (fnErr) {
        setError(fnErr.message || "AI lookup failed.");
        return;
      }
      if (data?.error) {
        setError(data.error);
        return;
      }
      const s: Suggestion = data?.suggestion ?? {};
      setSuggestion(s);
      setRows(buildRows(venue, s));
    })();
  }, [open, venue]);

  const toggle = (key: string) =>
    setRows((rs) =>
      rs.map((r) => (r.key === key ? { ...r, accepted: !r.accepted } : r)),
    );

  const handleApply = () => {
    if (!venue) return;
    let updated: Venue = { ...venue };
    rows.filter((r) => r.accepted).forEach((r) => r.apply(updated));
    updated.verified = true;
    if (suggestion?.imageUrl && rows.find((r) => r.key === "imageUrl")?.accepted) {
      updated.imageVerified = true;
    }
    updated.source = updated.source
      ? `${updated.source} + AI enrichment`
      : "AI enrichment";
    onApply(updated);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            Enrich {venue?.name}
          </DialogTitle>
          <DialogDescription>
            Review AI-suggested web details and accept the ones you trust.
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Looking up current
            details…
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {!loading && !error && rows.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No new details were suggested.
          </p>
        )}

        {!loading && rows.length > 0 && (
          <div className="space-y-2">
            {suggestion?.confidence && (
              <p className="text-xs text-muted-foreground">
                AI confidence: <strong>{suggestion.confidence}</strong>. Always
                sanity-check before committing.
              </p>
            )}
            {rows.map((r) => (
              <label
                key={r.key}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3 hover:bg-secondary/50"
              >
                <Checkbox
                  checked={r.accepted}
                  onCheckedChange={() => toggle(r.key)}
                  className="mt-0.5"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {r.label}
                  </p>
                  <p className="text-sm text-muted-foreground line-through decoration-muted-foreground/40">
                    {r.current || "—"}
                  </p>
                  <p className="break-words text-sm font-medium text-foreground">
                    {r.suggested}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={loading || rows.filter((r) => r.accepted).length === 0}
          >
            Accept selected & mark verified
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function buildRows(venue: Venue, s: Suggestion): Row[] {
  const rows: Row[] = [];
  const add = (
    key: string,
    label: string,
    current: unknown,
    suggested: unknown,
    apply: (v: Venue) => void,
  ) => {
    if (suggested == null || suggested === "" || (Array.isArray(suggested) && suggested.length === 0))
      return;
    const sStr = Array.isArray(suggested) ? suggested.join(", ") : String(suggested);
    const cStr = current == null ? "" : Array.isArray(current) ? current.join(", ") : String(current);
    if (sStr === cStr) return;
    rows.push({ key, label, current: cStr, suggested: sStr, accepted: true, apply });
  };

  add("address", "Address", venue.address, s.address, (v) => (v.address = s.address ?? v.address));
  add("neighborhood", "Neighborhood", venue.neighborhood, s.neighborhood, (v) => (v.neighborhood = s.neighborhood ?? v.neighborhood));
  add("category", "Category", venue.category, s.category, (v) => (v.category = s.category ?? v.category));
  add("googleRating", "Google rating", venue.googleRating, s.googleRating, (v) => (v.googleRating = s.googleRating ?? v.googleRating));
  if (s.lat != null && s.lng != null && (s.lat !== venue.lat || s.lng !== venue.lng)) {
    rows.push({
      key: "coords",
      label: "Coordinates",
      current: venue.lat != null ? `${venue.lat}, ${venue.lng}` : "",
      suggested: `${s.lat}, ${s.lng}`,
      accepted: true,
      apply: (v) => {
        v.lat = s.lat as number;
        v.lng = s.lng as number;
        v.coordsApproximate = false;
      },
    });
  }
  add("website", "Website", venue.website, s.website, (v) => (v.website = s.website ?? v.website));
  add("amenities", "Amenities", venue.amenities, s.amenities, (v) => {
    const merged = Array.from(new Set([...v.amenities, ...(s.amenities ?? [])]));
    v.amenities = merged;
  });
  add("imageUrl", "Hero photo", venue.imageUrl, s.imageUrl, (v) => (v.imageUrl = s.imageUrl ?? v.imageUrl));
  add("capacity", "Capacity (added to use)", "", s.capacity, (v) => {
    v.use = v.use ? `${v.use} ${s.capacity}` : (s.capacity as string);
  });
  return rows;
}
