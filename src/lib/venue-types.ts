export interface Venue {
  id: string;
  name: string;
  venueGroup: string | null;
  category: string | null;
  neighborhood: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  coordsApproximate: boolean;
  googleRating: number | null;
  priceProposed: string | null;
  priceOnline: string | null;
  priceNote: string;
  impression: string;
  use: string;
  status: string;
  amenities: string[];
  website: string | null;
  imageUrl: string | null;
  imageVerified: boolean;
  source: string;
  verified: boolean;
  notes: string;
  sortOrder: number;
}

export interface Vendor {
  id: string;
  name: string;
  type: string | null;
  price: string | null;
  notes: string;
}

export type VenueRow = {
  id: string;
  name: string;
  venue_group: string | null;
  category: string | null;
  neighborhood: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  coords_approximate: boolean;
  google_rating: number | null;
  price_proposed: string | null;
  price_online: string | null;
  price_note: string | null;
  impression: string | null;
  use_case: string | null;
  status: string | null;
  amenities: string[] | null;
  website: string | null;
  image_url: string | null;
  image_verified: boolean;
  source: string | null;
  verified: boolean;
  notes: string | null;
  sort_order: number;
};

export function rowToVenue(r: VenueRow): Venue {
  return {
    id: r.id,
    name: r.name,
    venueGroup: r.venue_group,
    category: r.category,
    neighborhood: r.neighborhood,
    address: r.address,
    lat: r.lat,
    lng: r.lng,
    coordsApproximate: r.coords_approximate,
    googleRating: r.google_rating,
    priceProposed: r.price_proposed,
    priceOnline: r.price_online,
    priceNote: r.price_note ?? "",
    impression: r.impression ?? "",
    use: r.use_case ?? "",
    status: r.status ?? "",
    amenities: r.amenities ?? [],
    website: r.website,
    imageUrl: r.image_url,
    imageVerified: r.image_verified,
    source: r.source ?? "",
    verified: r.verified,
    notes: r.notes ?? "",
    sortOrder: r.sort_order,
  };
}

export function venueToRow(v: Partial<Venue>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (v.id !== undefined) row.id = v.id;
  if (v.name !== undefined) row.name = v.name;
  if (v.venueGroup !== undefined) row.venue_group = v.venueGroup;
  if (v.category !== undefined) row.category = v.category;
  if (v.neighborhood !== undefined) row.neighborhood = v.neighborhood;
  if (v.address !== undefined) row.address = v.address;
  if (v.lat !== undefined) row.lat = v.lat;
  if (v.lng !== undefined) row.lng = v.lng;
  if (v.coordsApproximate !== undefined) row.coords_approximate = v.coordsApproximate;
  if (v.googleRating !== undefined) row.google_rating = v.googleRating;
  if (v.priceProposed !== undefined) row.price_proposed = v.priceProposed;
  if (v.priceOnline !== undefined) row.price_online = v.priceOnline;
  if (v.priceNote !== undefined) row.price_note = v.priceNote;
  if (v.impression !== undefined) row.impression = v.impression;
  if (v.use !== undefined) row.use_case = v.use;
  if (v.status !== undefined) row.status = v.status;
  if (v.amenities !== undefined) row.amenities = v.amenities;
  if (v.website !== undefined) row.website = v.website;
  if (v.imageUrl !== undefined) row.image_url = v.imageUrl;
  if (v.imageVerified !== undefined) row.image_verified = v.imageVerified;
  if (v.source !== undefined) row.source = v.source;
  if (v.verified !== undefined) row.verified = v.verified;
  if (v.notes !== undefined) row.notes = v.notes;
  if (v.sortOrder !== undefined) row.sort_order = v.sortOrder;
  return row;
}

export const BASE_CATEGORIES = [
  "Restaurant",
  "Rooftop",
  "Ballroom / Loft",
  "Garden / Park",
  "Museum",
  "Hotel",
  "Brewery / Bar",
  "Coworking",
  "Boat",
  "Entertainment",
  "Historic Hall",
  "Event Space",
];

export function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "venue"
  );
}

export const HOUSTON_CENTER: [number, number] = [29.7589, -95.3677];

export function emptyVenue(): Venue {
  return {
    id: "",
    name: "",
    venueGroup: null,
    category: null,
    neighborhood: null,
    address: null,
    lat: null,
    lng: null,
    coordsApproximate: true,
    googleRating: null,
    priceProposed: null,
    priceOnline: null,
    priceNote: "",
    impression: "",
    use: "",
    status: "",
    amenities: [],
    website: null,
    imageUrl: null,
    imageVerified: false,
    source: "Added manually",
    verified: false,
    notes: "",
    sortOrder: 0,
  };
}
