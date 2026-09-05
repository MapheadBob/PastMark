/**
 * Ported from GeoIQ's components/game/DistanceLine.tsx (dashed casing +
 * bright top line so the connector reads over both light and dark map
 * areas), recolored to PastMark tokens: casing in deep-ink, top line in
 * paper/cream per DESIGN.md ("the miss is a dashed cream line").
 */
import { useEffect, useRef } from "react";

const SOURCE_ID = "pm-distance-line-source";
const CASING_LAYER_ID = "pm-distance-line-casing";
const LAYER_ID = "pm-distance-line-layer";
const DASH_PATTERN = [2, 1.6];

export function DistanceLine({ map, from, to }) {
  const addedRef = useRef(false);

  useEffect(() => {
    if (!map) return;

    const ensureLayer = () => {
      if (addedRef.current || map.getSource(SOURCE_ID)) return;

      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id: CASING_LAYER_ID,
        type: "line",
        source: SOURCE_ID,
        layout: { "line-cap": "round" },
        paint: {
          "line-color": "#143138",
          "line-width": 5.5,
          "line-dasharray": DASH_PATTERN,
          "line-opacity": 0.9,
        },
      });

      map.addLayer({
        id: LAYER_ID,
        type: "line",
        source: SOURCE_ID,
        layout: { "line-cap": "round" },
        paint: {
          "line-color": "#F2EBDD",
          "line-width": 3,
          "line-dasharray": DASH_PATTERN,
          "line-opacity": 1,
        },
      });

      addedRef.current = true;
    };

    if (map.isStyleLoaded()) {
      ensureLayer();
    } else {
      map.once("load", ensureLayer);
    }

    return () => {
      if (!addedRef.current) return;
      try {
        if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID);
        if (map.getLayer(CASING_LAYER_ID)) map.removeLayer(CASING_LAYER_ID);
        if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
      } catch {
        // already torn down — nothing to do
      }
      addedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useEffect(() => {
    if (!map || !addedRef.current) return;
    const source = map.getSource(SOURCE_ID);
    if (!source) return;

    if (from && to) {
      source.setData({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { label: "distance" },
            geometry: {
              type: "LineString",
              coordinates: [
                [from.lng, from.lat],
                [to.lng, to.lat],
              ],
            },
          },
        ],
      });
    } else {
      source.setData({ type: "FeatureCollection", features: [] });
    }
  }, [map, from, to]);

  return null;
}
