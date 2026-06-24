import { Suspense, lazy, useEffect, useState } from "react";

const EditMapInner = lazy(() => import("./EditMapInner"));

export function EditMap(props: {
  lat: number | null;
  lng: number | null;
  onSet: (lat: number, lng: number) => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted)
    return (
      <div className="flex h-56 w-full items-center justify-center rounded-xl bg-secondary text-sm text-muted-foreground">
        Loading map…
      </div>
    );
  return (
    <Suspense
      fallback={
        <div className="flex h-56 w-full items-center justify-center rounded-xl bg-secondary text-sm text-muted-foreground">
          Loading map…
        </div>
      }
    >
      <EditMapInner {...props} />
    </Suspense>
  );
}
