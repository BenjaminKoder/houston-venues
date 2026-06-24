import { useEffect, useMemo } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import { HOUSTON_CENTER, type Venue } from "@/lib/venue-types";

function pinIcon(venue: Venue, active: boolean): L.DivIcon {
  const trusted = venue.verified && !venue.coordsApproximate;
  const fill = trusted ? "var(--color-primary)" : "var(--color-card)";
  const stroke = "var(--color-primary)";
  const dash = trusted ? "" : 'stroke-dasharray="2 2"';
  const scale = active ? 1.25 : 1;
  const svg = `
    <svg width="${28 * scale}" height="${36 * scale}" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 35C14 35 26 22.5 26 13.5C26 6.6 20.6 1 14 1C7.4 1 2 6.6 2 13.5C2 22.5 14 35 14 35Z"
        fill="${fill}" stroke="${stroke}" stroke-width="2" ${dash}/>
      <circle cx="14" cy="13.5" r="4.2" fill="${trusted ? "var(--color-primary-foreground)" : "var(--color-primary)"}"/>
    </svg>`;
  return L.divIcon({
    html: `<div class="venue-pin">${svg}</div>`,
    className: "",
    iconSize: [28 * scale, 36 * scale],
    iconAnchor: [14 * scale, 35 * scale],
    popupAnchor: [0, -32 * scale],
  });
}

function Focuser({
  focus,
}: {
  focus: { lat: number; lng: number; id: string } | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (focus) {
      map.flyTo([focus.lat, focus.lng], 15, { duration: 0.8 });
    }
  }, [focus, map]);
  return null;
}

export default function MapInner({
  venues,
  selectedId,
  focus,
  onSelect,
}: {
  venues: Venue[];
  selectedId: string | null;
  focus: { lat: number; lng: number; id: string } | null;
  onSelect: (v: Venue) => void;
}) {
  const geocoded = useMemo(
    () => venues.filter((v) => v.lat != null && v.lng != null),
    [venues],
  );

  return (
    <MapContainer
      center={HOUSTON_CENTER}
      zoom={11}
      scrollWheelZoom
      className="h-full w-full"
      style={{ borderRadius: "1rem" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Focuser focus={focus} />
      {geocoded.map((v) => (
        <Marker
          key={v.id}
          position={[v.lat as number, v.lng as number]}
          icon={pinIcon(v, v.id === selectedId)}
        >
          <Popup>
            <div className="min-w-[180px] space-y-1">
              <p className="font-display text-base font-semibold leading-tight">
                {v.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {v.category}
                {v.neighborhood ? ` · ${v.neighborhood}` : ""}
              </p>
              {v.googleRating != null && (
                <p className="text-xs">★ {v.googleRating.toFixed(1)}</p>
              )}
              {(v.priceProposed || v.priceOnline) && (
                <p className="text-xs font-medium">
                  {v.priceProposed || v.priceOnline}
                </p>
              )}
              {v.coordsApproximate && (
                <p className="text-xs italic text-warning-foreground">
                  Approximate — verify
                </p>
              )}
              <button
                type="button"
                onClick={() => onSelect(v)}
                className="mt-1 text-xs font-semibold text-primary underline-offset-2 hover:underline"
              >
                View details →
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
