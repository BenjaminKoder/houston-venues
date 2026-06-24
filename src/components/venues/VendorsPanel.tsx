import { useVendors } from "@/lib/venue-api";

export function VendorsPanel() {
  const { data: vendors, isLoading } = useVendors();

  if (isLoading) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Loading vendors…
      </p>
    );
  }

  if (!vendors || vendors.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No vendors yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {vendors.map((v) => (
        <div
          key={v.id}
          className="rounded-2xl border border-border bg-card p-5 shadow-card"
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display text-lg font-semibold text-foreground">
              {v.name}
            </h3>
            {v.type && (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                {v.type}
              </span>
            )}
          </div>
          {v.price && (
            <p className="mt-2 text-sm font-medium text-foreground">{v.price}</p>
          )}
          {v.notes && (
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {v.notes}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
