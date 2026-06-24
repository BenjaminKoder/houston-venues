import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface Filters {
  search: string;
  category: string | null;
  neighborhood: string;
  verifiedOnly: boolean;
  hasPhoto: boolean;
  minRating: number;
  sort: "name" | "rating" | "category";
}

export const defaultFilters: Filters = {
  search: "",
  category: null,
  neighborhood: "all",
  verifiedOnly: false,
  hasPhoto: false,
  minRating: 0,
  sort: "name",
};

interface Props {
  filters: Filters;
  setFilters: (f: Filters) => void;
  categories: string[];
  neighborhoods: string[];
}

export function FilterBar({ filters, setFilters, categories, neighborhoods }: Props) {
  const update = (patch: Partial<Filters>) => setFilters({ ...filters, ...patch });
  const hasActive =
    filters.search ||
    filters.category ||
    filters.neighborhood !== "all" ||
    filters.verifiedOnly ||
    filters.hasPhoto ||
    filters.minRating > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            placeholder="Search name, neighborhood, use, amenities…"
            className="h-11 rounded-xl border-border bg-card pl-9"
          />
        </div>

        <Select
          value={filters.neighborhood}
          onValueChange={(v) => update({ neighborhood: v })}
        >
          <SelectTrigger className="h-11 w-full rounded-xl bg-card sm:w-48">
            <SelectValue placeholder="Neighborhood" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All neighborhoods</SelectItem>
            {neighborhoods.map((n) => (
              <SelectItem key={n} value={n}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.sort}
          onValueChange={(v) => update({ sort: v as Filters["sort"] })}
        >
          <SelectTrigger className="h-11 w-full rounded-xl bg-card sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Sort: Name</SelectItem>
            <SelectItem value="rating">Sort: Rating</SelectItem>
            <SelectItem value="category">Sort: Category</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => update({ category: null })}
          className={cn(
            "rounded-full border px-3 py-1 text-sm transition-colors",
            !filters.category
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => update({ category: filters.category === c ? null : c })}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
              filters.category === c
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <Switch
            checked={filters.verifiedOnly}
            onCheckedChange={(v) => update({ verifiedOnly: v })}
          />
          Verified only
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <Switch
            checked={filters.hasPhoto}
            onCheckedChange={(v) => update({ hasPhoto: v })}
          />
          Has photo
        </label>
        <div className="flex min-w-[200px] flex-1 items-center gap-3">
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            Min rating {filters.minRating > 0 ? filters.minRating.toFixed(1) : "—"}
          </span>
          <Slider
            value={[filters.minRating]}
            min={0}
            max={5}
            step={0.1}
            onValueChange={([v]) => update({ minRating: v })}
            className="max-w-[180px]"
          />
        </div>
        {hasActive && (
          <button
            type="button"
            onClick={() => setFilters(defaultFilters)}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" /> Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
