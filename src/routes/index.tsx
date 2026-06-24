import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { LayoutGrid, Map as MapIcon, Columns, Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  useVenues,
  useSaveVenue,
  useDeleteVenue,
  useCreateVenues,
} from "@/lib/venue-api";
import { BASE_CATEGORIES, type Venue } from "@/lib/venue-types";
import { FilterBar, defaultFilters, type Filters } from "@/components/venues/FilterBar";
import { VenueCard } from "@/components/venues/VenueCard";
import { VenueDetail } from "@/components/venues/VenueDetail";
import { VenueForm } from "@/components/venues/VenueForm";
import { VenuesMap } from "@/components/venues/VenuesMap";
import { EnrichDialog } from "@/components/venues/EnrichDialog";
import { ImportSheet } from "@/components/venues/ImportSheet";
import { VendorsPanel } from "@/components/venues/VendorsPanel";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Houston Venues — Innovation Norway Houston" },
      {
        name: "description",
        content:
          "A curated, editable library of Houston event venues for receptions, dinners, galas and tech-night gatherings.",
      },
    ],
  }),
  component: Index,
});

type View = "grid" | "split" | "map";

function filterAndSort(venues: Venue[], f: Filters): Venue[] {
  const q = f.search.trim().toLowerCase();
  let out = venues.filter((v) => {
    if (f.category && v.category !== f.category) return false;
    if (f.neighborhood !== "all" && v.neighborhood !== f.neighborhood) return false;
    if (f.verifiedOnly && !v.verified) return false;
    if (f.hasPhoto && !(v.imageUrl && (v.imageVerified || true))) {
      if (!v.imageUrl) return false;
    }
    if (f.minRating > 0 && (v.googleRating == null || v.googleRating < f.minRating))
      return false;
    if (q) {
      const hay = [
        v.name,
        v.neighborhood,
        v.use,
        v.impression,
        v.category,
        ...v.amenities,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  out = [...out].sort((a, b) => {
    if (f.sort === "rating") return (b.googleRating ?? 0) - (a.googleRating ?? 0);
    if (f.sort === "category")
      return (a.category ?? "").localeCompare(b.category ?? "") || a.name.localeCompare(b.name);
    return a.name.localeCompare(b.name);
  });
  return out;
}

function Index() {
  const { data: venues, isLoading } = useVenues();
  const saveVenue = useSaveVenue();
  const deleteVenue = useDeleteVenue();
  const createVenues = useCreateVenues();

  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [view, setView] = useState<View>("split");
  const [tab, setTab] = useState("venues");

  const [detail, setDetail] = useState<Venue | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formVenue, setFormVenue] = useState<Venue | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [enrichVenue, setEnrichVenue] = useState<Venue | null>(null);
  const [enrichOpen, setEnrichOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Venue | null>(null);
  const [focus, setFocus] = useState<{ lat: number; lng: number; id: string } | null>(null);

  const all = venues ?? [];
  const filtered = useMemo(() => filterAndSort(all, filters), [all, filters]);
  const geocoded = filtered.filter((v) => v.lat != null && v.lng != null);
  const offMap = filtered.filter((v) => v.lat == null || v.lng == null);

  const categories = useMemo(() => {
    const set = new Set(BASE_CATEGORIES);
    all.forEach((v) => v.category && set.add(v.category));
    return Array.from(set).sort();
  }, [all]);

  const neighborhoods = useMemo(() => {
    const set = new Set<string>();
    all.forEach((v) => v.neighborhood && set.add(v.neighborhood));
    return Array.from(set).sort();
  }, [all]);

  const openDetail = (v: Venue) => {
    setDetail(v);
    setDetailOpen(true);
  };
  const openEdit = (v: Venue) => {
    setFormVenue(v);
    setFormOpen(true);
    setDetailOpen(false);
  };
  const openAdd = () => {
    setFormVenue(null);
    setFormOpen(true);
  };
  const openEnrich = (v: Venue) => {
    setEnrichVenue(v);
    setEnrichOpen(true);
    setDetailOpen(false);
  };
  const locate = (v: Venue) => {
    if (v.lat == null || v.lng == null) return;
    setFocus({ lat: v.lat, lng: v.lng, id: v.id });
    setDetailOpen(false);
    if (view === "grid") setView("split");
  };

  const handleSave = async (v: Venue) => {
    try {
      await saveVenue.mutateAsync(v);
      toast.success("Venue saved.");
      setFormOpen(false);
    } catch (e) {
      toast.error("Could not save venue.");
      console.error(e);
    }
  };

  const handleEnrichApply = async (v: Venue) => {
    try {
      await saveVenue.mutateAsync(v);
      toast.success(`${v.name} updated and verified.`);
      setEnrichOpen(false);
    } catch (e) {
      toast.error("Could not save enriched venue.");
      console.error(e);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteVenue.mutateAsync(toDelete.id);
      toast.success("Venue deleted.");
    } catch (e) {
      toast.error("Could not delete venue.");
      console.error(e);
    }
    setToDelete(null);
  };

  const handleImportCommit = async (drafts: Venue[]) => {
    try {
      await createVenues.mutateAsync(drafts);
      toast.success(`${drafts.length} venues added.`);
    } catch (e) {
      toast.error("Could not import venues.");
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-center" />

      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
              Innovation Norway · Houston
            </p>
            <h1 className="font-display text-2xl font-semibold leading-none text-foreground">
              Houston Venues
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setImportOpen(true)} className="gap-1.5">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Import sheet</span>
            </Button>
            <Button onClick={openAdd} className="gap-1.5">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add venue</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <Tabs value={tab} onValueChange={setTab}>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <TabsList>
              <TabsTrigger value="venues">Venues</TabsTrigger>
              <TabsTrigger value="vendors">Vendors</TabsTrigger>
            </TabsList>

            {tab === "venues" && (
              <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
                {(
                  [
                    ["grid", LayoutGrid],
                    ["split", Columns],
                    ["map", MapIcon],
                  ] as const
                ).map(([v, Icon]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setView(v)}
                    className={cn(
                      "rounded-lg p-2 transition-colors",
                      view === v
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground",
                      v === "split" && "hidden lg:block",
                    )}
                    aria-label={`${v} view`}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <TabsContent value="venues" className="space-y-6">
            <FilterBar
              filters={filters}
              setFilters={setFilters}
              categories={categories}
              neighborhoods={neighborhoods}
            />

            <p className="text-sm text-muted-foreground">
              Showing {filtered.length} of {all.length} venues
            </p>

            {isLoading ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-72 animate-pulse rounded-2xl bg-secondary"
                  />
                ))}
              </div>
            ) : (
              <div
                className={cn(
                  "grid gap-6",
                  view === "split" ? "lg:grid-cols-2" : "grid-cols-1",
                )}
              >
                {/* Grid column */}
                {view !== "map" && (
                  <div
                    className={cn(
                      "grid gap-5",
                      view === "grid"
                        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                        : "grid-cols-1 sm:grid-cols-2",
                    )}
                  >
                    {filtered.map((v) => (
                      <VenueCard key={v.id} venue={v} onClick={() => openDetail(v)} />
                    ))}
                    {filtered.length === 0 && (
                      <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
                        No venues match these filters.
                      </p>
                    )}
                  </div>
                )}

                {/* Map column */}
                {view !== "grid" && (
                  <div className="space-y-4">
                    <div
                      className={cn(
                        "overflow-hidden rounded-2xl border border-border shadow-card",
                        view === "split"
                          ? "h-[70vh] lg:sticky lg:top-24"
                          : "h-[72vh]",
                      )}
                    >
                      <VenuesMap
                        venues={geocoded}
                        selectedId={detail?.id ?? null}
                        focus={focus}
                        onSelect={openDetail}
                      />
                    </div>
                    {offMap.length > 0 && (
                      <div className="rounded-2xl border border-border bg-card p-4">
                        <p className="mb-2 text-sm font-semibold text-foreground">
                          Not yet on the map ({offMap.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {offMap.map((v) => (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => openEnrich(v)}
                              className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-secondary-foreground hover:border-primary hover:text-primary"
                              title="Place on map / Enrich with AI"
                            >
                              {v.name} · Enrich →
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="vendors">
            <div className="mb-4">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Vendors
              </h2>
              <p className="text-sm text-muted-foreground">
                Trusted partners for events.
              </p>
            </div>
            <VendorsPanel />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Houston Venues · Internal planning tool for Innovation Norway Houston
      </footer>

      <VenueDetail
        venue={detail}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={openEdit}
        onLocate={locate}
        onEnrich={openEnrich}
        onDelete={(v) => {
          setDetailOpen(false);
          setToDelete(v);
        }}
      />

      <VenueForm
        venue={formVenue}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSave={handleSave}
        categories={categories}
        saving={saveVenue.isPending}
      />

      <EnrichDialog
        venue={enrichVenue}
        open={enrichOpen}
        onOpenChange={setEnrichOpen}
        onApply={handleEnrichApply}
      />

      <ImportSheet
        open={importOpen}
        onOpenChange={setImportOpen}
        onCommit={handleImportCommit}
        committing={createVenues.isPending}
      />

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {toDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the venue from the library. This can't be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
