/**
 * Ported from GeoIQ's components/game/GameMap.tsx — same MapLibre wrapper
 * and interaction mechanism (click-to-place, pan/zoom controls, the
 * documented fixes for the resize-feedback zoom bug and the map.remove()
 * cleanup ordering hazard), stripped of TypeScript and GeoIQ's label-toggle
 * behavior (PastMark's Pin Mark shows place labels throughout — there's no
 * "aiming vs. reveal" label-hiding rule here). Restyled via CSS, not
 * GeoIQ's Tailwind classes.
 */
import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { getMapStyleUrl } from "../../lib/map/styleUrl";

const MAP_STYLE_URL = getMapStyleUrl();

export function GameMap({
  interactive,
  onMapClick,
  initialCenter = [20, 35],
  initialZoom = 3,
  children,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const mapRemovedRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    const map = new maplibregl.Map({
      container,
      style: MAP_STYLE_URL,
      center: initialCenter,
      zoom: initialZoom,
      attributionControl: false,
      minZoom: 1,
      renderWorldCopies: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      dragRotate: false,
      clickTolerance: 10,
      trackResize: false,
    });

    const handleWindowResize = () => map.resize();
    window.addEventListener("resize", handleWindowResize);

    mapRef.current = map;
    mapRemovedRef.current = false;
    map.on("load", () => setMapInstance(map));

    return () => {
      window.removeEventListener("resize", handleWindowResize);
      mapRemovedRef.current = true;
      map.remove();
      mapRef.current = null;
      setMapInstance(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapInstance) return;

    const handleClick = (e) => {
      if (!interactive || !onMapClick) return;
      onMapClick({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    };

    mapInstance.on("click", handleClick);
    return () => {
      if (mapRemovedRef.current) return;
      mapInstance.off("click", handleClick);
    };
  }, [mapInstance, interactive, onMapClick]);

  useEffect(() => {
    if (!mapInstance) return;
    const canvas = mapInstance.getCanvas();
    canvas.style.cursor = interactive ? "crosshair" : "default";
  }, [mapInstance, interactive]);

  useEffect(() => {
    if (!mapInstance || !interactive) return;
    const control = new maplibregl.NavigationControl({ showCompass: false });
    mapInstance.addControl(control, "top-right");
    return () => {
      if (mapRemovedRef.current) return;
      mapInstance.removeControl(control);
    };
  }, [mapInstance, interactive]);

  return (
    <div
      ref={containerRef}
      className="pm-game-map"
      role="application"
      aria-label="Map — click to place your pin"
    >
      {children?.(mapInstance)}
    </div>
  );
}
