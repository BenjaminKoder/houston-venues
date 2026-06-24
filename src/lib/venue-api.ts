import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  rowToVenue,
  venueToRow,
  type Venue,
  type Vendor,
  type VenueRow,
} from "./venue-types";

const VENUES_KEY = ["venues"] as const;
const VENDORS_KEY = ["vendors"] as const;

export function useVenues(): UseQueryResult<Venue[]> {
  return useQuery({
    queryKey: VENUES_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("venues")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return (data as VenueRow[]).map(rowToVenue);
    },
  });
}

export function useVendors(): UseQueryResult<Vendor[]> {
  return useQuery({
    queryKey: VENDORS_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((r) => ({
        id: r.id as string,
        name: r.name as string,
        type: r.type as string | null,
        price: r.price as string | null,
        notes: (r.notes as string | null) ?? "",
      }));
    },
  });
}

export function useSaveVenue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (venue: Venue) => {
      const row = venueToRow(venue);
      const { error } = await supabase
        .from("venues")
        .upsert(row as never, { onConflict: "id" });
      if (error) throw error;
      return venue;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: VENUES_KEY }),
  });
}

export function useCreateVenues() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (venues: Venue[]) => {
      const rows = venues.map((v) => venueToRow(v));
      const { error } = await supabase.from("venues").insert(rows as never);
      if (error) throw error;
      return venues;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: VENUES_KEY }),
  });
}

export function useDeleteVenue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("venues").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: VENUES_KEY }),
  });
}
