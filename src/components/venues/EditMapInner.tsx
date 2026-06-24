import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { HOUSTON_CENTER } from "@/lib/venue-types";

const dragIcon = L.divIcon({
  html: `<div class="venue-pin"><svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 35C14 35 26 22.5 26 13.5C26 6.6 20.6 1 14 1C7.4 1 2 6.6 2 13.5C2 22.5 14 35 14 35Z" fill="var(--color-primary)" stroke="var(--color-primary)" stroke-width="2"/><circle cx="14" cy="13.5" r="4.2" fill="var(--color-primary-foreground)"/></svg></div>`,
  className: "",
  iconSize: [28, 36],
  iconAnchor: [14, 35],
});

function Recenter({ lat, lng }: { lat: number | null; lng: number | null }) {
  const map = useMap();
  useEffect(() => {
    if (lat != null && lng != null) map.setView([lat, lng], Math.max(map.getZoom(), 13));
  }, [lat, lng, map]);
  return null;
}

function ClickCapture({ onSet }: { onSet: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSet(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function EditMapInner({
  lat,
  lng,
  onSet,
}: {
  lat: number | null;
  lng: number | null;
  onSet: (lat: number, lng: number) => void;
}) {
  const pos: [number, number] = lat != null && lng != null ? [lat, lng] : HOUSTON_CENTER;
  return (
    <MapContainer
      center={pos}
      zoom={lat != null ? 14 : 10}
      scrollWheelZoom
      className="h-56 w-full"
      style={{ borderRadius: "0.75rem" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <ClickCapture onSet={onSet} />
      <Recenter lat={lat} lng={lng} />
      {lat != null && lng != null && (
        <Marker
          position={[lat, lng]}
          icon={dragIcon}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const m = e.target as L.Marker;
              const p = m.getLatLng();
              onSet(p.lat, p.lng);
            },
          }}
        />
      )}
    </MapContainer>
  );
}
