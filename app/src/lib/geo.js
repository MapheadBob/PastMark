// Ported from GeoIQ's lib/game/scoring.ts distanceKm() — same haversine
// implementation, shared so both games compute distance identically.
const EARTH_RADIUS_KM = 6371;

function toRadians(deg) {
  return (deg * Math.PI) / 180;
}

function safeNumber(n) {
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) ? v : 0;
}

export function distanceKm(a, b) {
  const lat1 = safeNumber(a?.lat);
  const lng1 = safeNumber(a?.lon ?? a?.lng);
  const lat2 = safeNumber(b?.lat);
  const lng2 = safeNumber(b?.lon ?? b?.lng);
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * sinDLng * sinDLng;
  const c = 2 * Math.atan2(Math.sqrt(Math.max(0, h)), Math.sqrt(Math.max(0, 1 - h)));
  const result = EARTH_RADIUS_KM * c;
  return Number.isFinite(result) ? result : 0;
}
