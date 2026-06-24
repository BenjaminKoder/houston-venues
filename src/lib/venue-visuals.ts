import {
  Beer,
  BedDouble,
  Briefcase,
  Building2,
  Gamepad2,
  Landmark,
  type LucideIcon,
  MapPin,
  PartyPopper,
  Ship,
  Sparkles,
  Trees,
  UtensilsCrossed,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Restaurant: UtensilsCrossed,
  Rooftop: Building2,
  "Ballroom / Loft": Sparkles,
  "Garden / Park": Trees,
  Museum: Landmark,
  Hotel: BedDouble,
  "Brewery / Bar": Beer,
  Coworking: Briefcase,
  Boat: Ship,
  Entertainment: Gamepad2,
  "Historic Hall": Landmark,
  "Event Space": PartyPopper,
};

export function categoryIcon(category: string | null | undefined): LucideIcon {
  if (!category) return MapPin;
  return ICONS[category] ?? MapPin;
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/** Soft, calm gradient derived deterministically from the venue name. */
export function nameGradient(name: string): string {
  const h = hashString(name || "venue");
  const hue1 = h % 360;
  const hue2 = (hue1 + 38) % 360;
  const c1 = `oklch(0.9 0.045 ${hue1})`;
  const c2 = `oklch(0.82 0.06 ${hue2})`;
  return `linear-gradient(135deg, ${c1}, ${c2})`;
}

export function initials(name: string): string {
  const parts = (name || "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
