// Ported from GeoIQ's lib/map/styleUrl.ts (same resolution order), adapted
// from Next.js env vars to Vite's import.meta.env. GeoIQ's own custom
// water-deep/land vector style is tracked as a separate follow-up there too
// (see its docs/04-technical/map-styling.md) — this build uses the same
// zero-config public demo tiles fallback it does today.
const DEMO_STYLE_URL = "https://demotiles.maplibre.org/style.json";
const MAPTILER_STYLE = "dataviz";

export function getMapStyleUrl() {
  const explicit = import.meta.env.VITE_MAP_STYLE_URL;
  if (explicit) return explicit;
  const maptilerKey = import.meta.env.VITE_MAPTILER_KEY;
  if (maptilerKey) {
    return `https://api.maptiler.com/maps/${MAPTILER_STYLE}/style.json?key=${maptilerKey}`;
  }
  return DEMO_STYLE_URL;
}
