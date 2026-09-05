// Ported from GeoIQ's lib/map/styleUrl.ts (same resolution order: explicit
// URL, then a MapTiler key, then a zero-config fallback), adapted from
// Next.js env vars to Vite's import.meta.env. GeoIQ's own custom
// water-deep/land vector style is tracked as a separate follow-up there too
// (see its docs/04-technical/map-styling.md).
//
// The zero-config fallback differs from GeoIQ's: GeoIQ defaults to MapLibre's
// public demo tiles, which need outbound network access. PastMark's default
// is this inline style *object* (no fetch at all — maplibre-gl's `style`
// option accepts a full style spec object as well as a URL) so the Pin Mark
// still works with zero setup in a network-restricted host (a sandboxed dev
// container, a static Artifact preview). Set VITE_MAP_STYLE_URL or
// VITE_MAPTILER_KEY to get real coastlines/labels in any environment with
// normal internet access — both still take priority over this fallback.
const MAPTILER_STYLE = "dataviz";

const OFFLINE_STYLE = {
  version: 8,
  name: "PastMark offline fallback",
  sources: {},
  layers: [
    { id: "background", type: "background", paint: { "background-color": "#143138" } },
  ],
};

export function getMapStyleUrl() {
  const explicit = import.meta.env.VITE_MAP_STYLE_URL;
  if (explicit) return explicit;
  const maptilerKey = import.meta.env.VITE_MAPTILER_KEY;
  if (maptilerKey) {
    return `https://api.maptiler.com/maps/${MAPTILER_STYLE}/style.json?key=${maptilerKey}`;
  }
  return OFFLINE_STYLE;
}
