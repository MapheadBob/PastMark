/**
 * Ported from GeoIQ's components/game/MapPin.tsx — same imperative
 * maplibre-gl Marker mechanism (element created once, synced via a
 * coordinates effect, pin-drop animation replayed on each placement) but
 * restyled to PastMark's own marker language per DESIGN.md's Map component
 * spec: "the player's pin is indigo with a cream ring; the true location is
 * oxblood, larger ring, labelled in mono" — not GeoIQ's coral pennant /
 * gold star shapes, which are that game's own visual identity.
 */
import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";

const TOUCH_TARGET_PX = 44;

function markerSvgMarkup(variant) {
  return variant === "guess"
    ? `<svg width="26" height="26" viewBox="0 0 26 26" role="img" aria-label="Your pin" style="filter: drop-shadow(0 1px 3px rgb(0 0 0 / 0.45))">
         <circle cx="13" cy="13" r="9" fill="#3F5E73" stroke="#FFFDF8" stroke-width="3" />
       </svg>`
    : `<svg width="32" height="32" viewBox="0 0 32 32" role="img" aria-label="Correct location" style="filter: drop-shadow(0 1px 3px rgb(0 0 0 / 0.45))">
         <circle cx="16" cy="16" r="11" fill="#7C3247" stroke="#FFFDF8" stroke-width="4" />
       </svg>`;
}

export function MapPin({ map, variant, coordinates }) {
  const markerRef = useRef(null);
  const elRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    if (!markerRef.current) {
      const el = document.createElement("div");
      el.style.minWidth = `${TOUCH_TARGET_PX}px`;
      el.style.minHeight = `${TOUCH_TARGET_PX}px`;
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.innerHTML = markerSvgMarkup(variant);
      elRef.current = el;
      markerRef.current = new maplibregl.Marker({ element: el, anchor: "center" });
    }

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, variant]);

  useEffect(() => {
    if (!markerRef.current || !map) return;

    if (coordinates) {
      markerRef.current.setLngLat([coordinates.lng, coordinates.lat]).addTo(map);
      if (elRef.current) {
        const el = elRef.current;
        el.classList.remove("pm-pin-drop");
        void el.offsetWidth;
        el.classList.add("pm-pin-drop");
      }
    } else {
      markerRef.current.remove();
    }
  }, [coordinates, map, variant]);

  return null;
}
