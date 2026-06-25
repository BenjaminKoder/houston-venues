import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EditMap } from "./EditMap";
import { VenueImage } from "./VenueImage";
import { emptyVenue, slugify, type Venue } from "@/lib/venue-types";

const NEW_CATEGORY = "__new__";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-display text-base font-semibold text-foreground">
      {children}
    </h3>
  );
}

export function VenueForm({
  venue,
  open,
  onOpenChange,
  onSave,
  categories,
  saving,
}: {
  venue: Venue | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSave: (v: Venue) => void;
  categories: string[];
  saving?: boolean;
}) {
  const [form, setForm] = useState<Venue>(emptyVenue());
  const [amenityInput, setAmenityInput] = useState("");
  const [customCategory, setCustomCategory] = useState(false);
  const isNew = !venue || !venue.id;

  useEffect(() => {
    if (open) {
      setForm(venue ?? emptyVenue());
      setAmenityInput("");
      setCustomCategory(
        !!venue?.category && !categories.includes(venue.category),
      );
    }
  }, [open, venue, categories]);

  const set = <K extends keyof Venue>(key: K, value: Venue[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const addAmenity = () => {
    const v = amenityInput.trim();
    if (v && !form.amenities.includes(v)) {
      set("amenities", [...form.amenities, v]);
    }
    setAmenityInput("");
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    const id = form.id || slugify(form.name);
    onSave({ ...form, id, name: form.name.trim() });
  };

  const numOrNull = (s: string) => {
    if (s.trim() === "") return null;
    const n = Number(s);
    return Number.isNaN(n) ? null : n;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isNew ? "Add venue" : `Edit ${venue?.name}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Basics */}
          <section className="space-y-3">
            <SectionTitle>Basics</SectionTitle>
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Venue name"
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                {customCategory ? (
                  <div className="flex gap-2">
                    <Input
                      value={form.category ?? ""}
                      onChange={(e) => set("category", e.target.value)}
                      placeholder="New category"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setCustomCategory(false);
                        set("category", null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Select
                    value={form.category ?? ""}
                    onValueChange={(v) => {
                      if (v === NEW_CATEGORY) {
                        setCustomCategory(true);
                        set("category", "");
                      } else {
                        set("category", v);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                      <SelectItem value={NEW_CATEGORY}>+ Add new…</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="neighborhood">Neighborhood</Label>
                <Input
                  id="neighborhood"
                  value={form.neighborhood ?? ""}
                  onChange={(e) => set("neighborhood", e.target.value || null)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="group">Venue group (optional)</Label>
              <Input
                id="group"
                value={form.venueGroup ?? ""}
                onChange={(e) => set("venueGroup", e.target.value || null)}
                placeholder="e.g. POST Houston (Skylawn rooftop)"
              />
            </div>
          </section>

          {/* Location */}
          <section className="space-y-3">
            <SectionTitle>Location</SectionTitle>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={form.address ?? ""}
                onChange={(e) => set("address", e.target.value || null)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="lat">Latitude</Label>
                <Input
                  id="lat"
                  value={form.lat ?? ""}
                  onChange={(e) => set("lat", numOrNull(e.target.value))}
                  placeholder="29.76"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lng">Longitude</Label>
                <Input
                  id="lng"
                  value={form.lng ?? ""}
                  onChange={(e) => set("lng", numOrNull(e.target.value))}
                  placeholder="-95.37"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Click or drag the pin to set the location.
            </p>
            <EditMap
              lat={form.lat}
              lng={form.lng}
              onSet={(lat, lng) =>
                setForm((f) => ({ ...f, lat, lng, coordsApproximate: false }))
              }
            />
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={form.coordsApproximate}
                onCheckedChange={(v) => set("coordsApproximate", v)}
              />
              Coordinates are approximate
            </label>
          </section>

          {/* Pricing */}
          <section className="space-y-3">
            <SectionTitle>Pricing</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pp">Proposed price</Label>
                <Input
                  id="pp"
                  value={form.priceProposed ?? ""}
                  onChange={(e) => set("priceProposed", e.target.value || null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="po">Online / list price</Label>
                <Input
                  id="po"
                  value={form.priceOnline ?? ""}
                  onChange={(e) => set("priceOnline", e.target.value || null)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pn">Price note</Label>
              <Input
                id="pn"
                value={form.priceNote}
                onChange={(e) => set("priceNote", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating">Google rating</Label>
              <Input
                id="rating"
                value={form.googleRating ?? ""}
                onChange={(e) => set("googleRating", numOrNull(e.target.value))}
                placeholder="4.6"
                className="max-w-[140px]"
              />
            </div>
          </section>

          {/* Assessment */}
          <section className="space-y-3">
            <SectionTitle>Assessment</SectionTitle>
            <div className="space-y-2">
              <Label htmlFor="impression">Impression</Label>
              <Textarea
                id="impression"
                value={form.impression}
                onChange={(e) => set("impression", e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="use">Intended use</Label>
              <Textarea
                id="use"
                value={form.use}
                onChange={(e) => set("use", e.target.value)}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Input
                  id="status"
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Amenities */}
          <section className="space-y-3">
            <SectionTitle>Amenities & AV</SectionTitle>
            <div className="flex gap-2">
              <Input
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addAmenity();
                  }
                }}
                placeholder="Add amenity and press Enter"
              />
              <Button type="button" variant="secondary" onClick={addAmenity}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {form.amenities.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.amenities.map((a) => (
                  <span
                    key={a}
                    className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
                  >
                    {a}
                    <button
                      type="button"
                      onClick={() =>
                        set(
                          "amenities",
                          form.amenities.filter((x) => x !== a),
                        )
                      }
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Links / media */}
          <section className="space-y-3">
            <SectionTitle>Links & media</SectionTitle>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={form.website ?? ""}
                onChange={(e) => set("website", e.target.value || null)}
                placeholder="https://…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={form.imageUrl ?? ""}
                onChange={(e) => set("imageUrl", e.target.value || null)}
                placeholder="https://…/photo.jpg"
              />
            </div>
            <div className="h-32 w-full overflow-hidden rounded-xl border border-border">
              <VenueImage venue={form} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={form.imageVerified}
                onCheckedChange={(v) => set("imageVerified", v)}
              />
              Image confirmed (real photo)
            </label>
          </section>

          {/* Status flags */}
          <section className="space-y-3">
            <SectionTitle>Status flags</SectionTitle>
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={form.verified}
                onCheckedChange={(v) => set("verified", v)}
              />
              Verified (web fields confirmed)
            </label>
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                value={form.source}
                onChange={(e) => set("source", e.target.value)}
              />
            </div>
          </section>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !form.name.trim()}>
            {saving ? "Saving…" : isNew ? "Add venue" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
