import { useRef, useState } from "react";
import { FileSpreadsheet, Loader2, Trash2, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { emptyVenue, slugify, type Venue } from "@/lib/venue-types";
import { toast } from "sonner";

const NONE = "__none__";

const TARGETS: { key: keyof Venue; label: string; guesses: string[] }[] = [
  { key: "name", label: "Name *", guesses: ["name", "venue", "title"] },
  { key: "category", label: "Category", guesses: ["category", "type"] },
  { key: "neighborhood", label: "Neighborhood", guesses: ["neighborhood", "location", "area", "district"] },
  { key: "address", label: "Address", guesses: ["address", "street"] },
  { key: "priceProposed", label: "Proposed price", guesses: ["price", "proposed", "cost", "quote"] },
  { key: "priceOnline", label: "Online price", guesses: ["online", "list", "rate"] },
  { key: "googleRating", label: "Rating", guesses: ["rating", "google", "stars", "score"] },
  { key: "amenities", label: "Amenities", guesses: ["amenities", "features", "av"] },
  { key: "impression", label: "Impression", guesses: ["impression", "comment", "review"] },
  { key: "use", label: "Use", guesses: ["use", "capacity", "purpose"] },
  { key: "status", label: "Status", guesses: ["status"] },
  { key: "website", label: "Website", guesses: ["website", "url", "link"] },
  { key: "notes", label: "Notes", guesses: ["notes", "note", "remarks"] },
];

type Step = "upload" | "map" | "review";

export function ImportSheet({
  open,
  onOpenChange,
  onCommit,
  committing,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCommit: (venues: Venue[]) => Promise<void>;
  committing?: boolean;
}) {
  const [step, setStep] = useState<Step>("upload");
  const [headers, setHeaders] = useState<string[]>([]);
  const [raw, setRaw] = useState<Record<string, unknown>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [drafts, setDrafts] = useState<Venue[]>([]);
  const [parsing, setParsing] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep("upload");
    setHeaders([]);
    setRaw([]);
    setMapping({});
    setDrafts([]);
  };

  const handleFile = async (file: File) => {
    setParsing(true);
    try {
      const XLSX = await import("xlsx");
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
        defval: "",
      });
      if (json.length === 0) {
        toast.error("No rows found in the sheet.");
        return;
      }
      const cols = Object.keys(json[0]);
      setHeaders(cols);
      setRaw(json);
      // auto-map
      const auto: Record<string, string> = {};
      for (const t of TARGETS) {
        const found = cols.find((c) =>
          t.guesses.some((g) => c.toLowerCase().includes(g)),
        );
        auto[t.key as string] = found ?? NONE;
      }
      setMapping(auto);
      setStep("map");
    } catch (e) {
      console.error(e);
      toast.error("Could not read that file.");
    } finally {
      setParsing(false);
    }
  };

  const buildDrafts = () => {
    const nameCol = mapping["name"];
    if (!nameCol || nameCol === NONE) {
      toast.error("Map a column to Name first.");
      return;
    }
    const out: Venue[] = [];
    const seen = new Set<string>();
    for (const row of raw) {
      const name = String(row[nameCol] ?? "").trim();
      if (!name) continue;
      const v = emptyVenue();
      v.name = name;
      let id = slugify(name);
      while (seen.has(id)) id = id + "-x";
      seen.add(id);
      v.id = id;
      v.source = "Imported sheet";
      for (const t of TARGETS) {
        const col = mapping[t.key as string];
        if (!col || col === NONE || t.key === "name") continue;
        const val = String(row[col] ?? "").trim();
        if (!val) continue;
        if (t.key === "amenities") {
          v.amenities = val.split(/[;,]/).map((s) => s.trim()).filter(Boolean);
        } else if (t.key === "googleRating") {
          const n = parseFloat(val);
          v.googleRating = Number.isNaN(n) ? null : n;
        } else {
          (v as Record<string, unknown>)[t.key] = val;
        }
      }
      out.push(v);
    }
    if (out.length === 0) {
      toast.error("No valid rows to import.");
      return;
    }
    setDrafts(out);
    setStep("review");
  };

  const enrichAll = async () => {
    setEnriching(true);
    try {
      const updated = [...drafts];
      for (let i = 0; i < updated.length; i++) {
        const d = updated[i];
        const { data } = await supabase.functions.invoke("enrich-venue", {
          body: {
            name: d.name,
            neighborhood: d.neighborhood,
            address: d.address,
            category: d.category,
          },
        });
        const s = data?.suggestion;
        if (s) {
          if (!d.address && s.address) d.address = s.address;
          if (!d.neighborhood && s.neighborhood) d.neighborhood = s.neighborhood;
          if (!d.category && s.category) d.category = s.category;
          if (d.googleRating == null && s.googleRating != null)
            d.googleRating = s.googleRating;
          if (s.lat != null && s.lng != null) {
            d.lat = s.lat;
            d.lng = s.lng;
            d.coordsApproximate = false;
          }
          if (!d.website && s.website) d.website = s.website;
          if (s.imageUrl) {
            d.imageUrl = s.imageUrl;
            d.imageVerified = true;
          }
          if (s.amenities?.length)
            d.amenities = Array.from(new Set([...d.amenities, ...s.amenities]));
          d.verified = true;
        }
        setDrafts([...updated]);
      }
      toast.success("Enrichment complete. Review and commit.");
    } catch (e) {
      console.error(e);
      toast.error("Enrichment failed for some rows.");
    } finally {
      setEnriching(false);
    }
  };

  const commit = async () => {
    await onCommit(drafts);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <FileSpreadsheet className="h-5 w-5 text-primary" /> Import venues
            from a sheet
          </DialogTitle>
          <DialogDescription>
            Upload an Excel or CSV file. We'll map columns, optionally enrich each
            row with AI, and let you review before saving.
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border p-10 text-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) handleFile(f);
            }}
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Drag a .xlsx or .csv here, or
            </p>
            <Button onClick={() => fileRef.current?.click()} disabled={parsing}>
              {parsing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Choose file"
              )}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </div>
        )}

        {step === "map" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {raw.length} rows found. Match your columns to venue fields.
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {TARGETS.map((t) => (
                <div
                  key={t.key as string}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="text-sm">{t.label}</span>
                  <Select
                    value={mapping[t.key as string] ?? NONE}
                    onValueChange={(v) =>
                      setMapping((m) => ({ ...m, [t.key as string]: v }))
                    }
                  >
                    <SelectTrigger className="h-9 w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>— none —</SelectItem>
                      {headers.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setStep("upload")}>
                Back
              </Button>
              <Button onClick={buildDrafts}>Build drafts →</Button>
            </DialogFooter>
          </div>
        )}

        {step === "review" && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                {drafts.length} draft venues
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={enrichAll}
                disabled={enriching}
                className="gap-1.5"
              >
                {enriching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Enrich all with AI"
                )}
              </Button>
            </div>
            <div className="max-h-[40vh] space-y-2 overflow-y-auto">
              {drafts.map((d, i) => (
                <div
                  key={d.id}
                  className="flex items-start justify-between gap-2 rounded-xl border border-border p-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{d.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {[d.category, d.neighborhood, d.priceProposed]
                        .filter(Boolean)
                        .join(" · ") || "No extra details"}
                      {d.verified ? " · ✓ enriched" : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setDrafts((ds) => ds.filter((_, idx) => idx !== i))
                    }
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setStep("map")}>
                Back
              </Button>
              <Button
                onClick={commit}
                disabled={committing || drafts.length === 0}
              >
                {committing ? "Saving…" : `Add ${drafts.length} venues`}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
