import { Suspense, lazy, useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import type { Venue } from "@/lib/venue-types";

const MapInner = lazy(() => import("./MapInner"));

function MapSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
      <MapPin className="mr-2 h-5 w-5 animate-pulse" /> Loading map…
    </div>
  );
}

export function VenuesMap(props: {
  venues: Venue[];
  selectedId: string | null;
  focus: { lat: number; lng: number; id: string } | null;
  onSelect: (v: Venue) => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <MapSkeleton />;

  return (
    <Suspense fallback={<MapSkeleton />}>
      <MapInner {...props} />
    </Suspense>
  );
}
