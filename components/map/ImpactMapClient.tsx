"use client";

import { useEffect, useRef } from "react";
import {
  LngLatBounds,
  Map as MaplibreMap,
  Marker,
  NavigationControl,
  Popup,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Lang } from "@/lib/i18n/dictionary";

export type ImpactMapPoint = {
  key: string;
  label: string;
  lat: number;
  lng: number;
  count: number;
};

/** CARTO Positron, the vector style. Free, no API key, attribution required. */
const CARTO_POSITRON_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

/**
 * Water tints for the Coastal Register recolor. Both are accent blue
 * (--color-accent-blue #35507E) mixed toward paper (--color-background) so
 * the paper land still leads and the sea reads as a calm coastal blue, not a
 * saturated slab. WATERWAY is a touch deeper for river and shore lines.
 * Kept as named constants per the token rule's sanctioned exception.
 */
const WATER = "#94A6C4";
const WATERWAY = "#7E92B4";

/** Escapes the handful of characters that matter inside popup HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Bilingual count word, singular and plural, in the active language. */
function countWord(count: number, lang: Lang): string {
  if (lang === "es") {
    return count === 1 ? "entrega" : "entregas";
  }
  return count === 1 ? "distribution" : "distributions";
}

/** Popup body: Fraunces town name plus a muted count line in the toggle's language. */
function popupHtml(point: ImpactMapPoint, lang: Lang): string {
  return (
    `<div class="impact-pop-name">${escapeHtml(point.label)}</div>` +
    `<div class="impact-pop-count">${point.count} ${countWord(point.count, lang)}</div>`
  );
}

/**
 * Fixed-size teardrop, ~34px wide, filled with accent blue read from the
 * design tokens at runtime. Count numeral (hero-ink monospace) appears only
 * when a city has more than one distribution; a single distribution shows a
 * small paper dot at the head instead.
 */
function pinElement(count: number, blue: string, paper: string): HTMLDivElement {
  const el = document.createElement("div");
  el.className = "impact-pin";
  const head =
    count > 1
      ? `<text x="16" y="15" text-anchor="middle" dominant-baseline="central" font-family="ui-monospace,Menlo,monospace" font-size="12" font-weight="500" fill="${paper}">${count}</text>`
      : `<circle cx="16" cy="15" r="4" fill="${paper}"/>`;
  el.innerHTML =
    `<svg width="34" height="47" viewBox="0 0 32 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">` +
    `<path d="M16 2 C8.3 2 2 8.3 2 16 c0 10.5 14 26 14 26 s14-15.5 14-26 C30 8.3 23.7 2 16 2 z" fill="${blue}"/>` +
    `${head}</svg>`;
  return el;
}

const SCOPED_CSS = `
.impact-map { background: var(--color-background); }
.impact-map .maplibregl-ctrl-group {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  box-shadow: none;
}
.impact-map .maplibregl-ctrl-group button { width: 28px; height: 28px; }
.impact-map .maplibregl-ctrl-group button + button { border-top: 1px solid var(--color-border); }
.impact-map .maplibregl-ctrl-attrib {
  background: color-mix(in srgb, var(--color-card) 82%, transparent);
}
.impact-map .maplibregl-ctrl-attrib a { color: var(--color-accent-blue); }
.impact-map .maplibregl-ctrl-attrib-inner { color: var(--color-muted); }
.impact-map .maplibregl-popup-content {
  background: var(--color-card);
  color: var(--color-foreground);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  box-shadow: 0 6px 20px rgba(27, 25, 22, 0.1);
  padding: 11px 14px;
}
.impact-map .maplibregl-popup-anchor-bottom .maplibregl-popup-tip { border-top-color: var(--color-card); }
.impact-map .maplibregl-popup-close-button { display: none; }
.impact-map .impact-pin { filter: drop-shadow(0 3px 4px rgba(27, 25, 22, 0.22)); cursor: pointer; }
.impact-map .impact-pop-name { font-family: var(--font-fraunces), serif; font-size: 16px; line-height: 1.2; }
.impact-map .impact-pop-count {
  margin-top: 2px;
  font-family: var(--font-instrument-sans), sans-serif;
  font-size: 13px;
  color: var(--color-muted);
  font-variant-numeric: tabular-nums;
}
`;

export function ImpactMapClient({ points }: { points: ImpactMapPoint[] }) {
  const { lang } = useLanguage();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const popupsRef = useRef<{ popup: Popup; point: ImpactMapPoint }[]>([]);
  const langRef = useRef<Lang>(lang);

  useEffect(() => {
    // Strict Mode double-invoke safe: bail if a map already exists.
    if (mapRef.current || !containerRef.current) return;

    const map = new MaplibreMap({
      container: containerRef.current,
      style: CARTO_POSITRON_STYLE,
      center: [-66.89, 10.55],
      zoom: 10.4,
      // Attribution is required and non-negotiable; an options object keeps
      // the control on (v5 dropped the boolean `true` form).
      attributionControl: {},
      // preserveDrawingBuffer keeps the WebGL canvas capturable for QA
      // screenshots; v5 moved it under canvasContextAttributes.
      canvasContextAttributes: { preserveDrawingBuffer: true },
    });
    mapRef.current = map;

    // No scroll jacking, per the aesthetic guardrails.
    map.scrollZoom.disable();
    map.addControl(new NavigationControl({ showCompass: false }), "top-left");

    map.on("load", () => {
      // Coastal Register recolor: paper land, coastal-blue water, set per
      // layer on the vector style. Each write is guarded so a layer that
      // lacks the paint property is simply skipped.
      const paper = getComputedStyle(document.documentElement)
        .getPropertyValue("--color-background")
        .trim();
      const layers = map.getStyle().layers ?? [];
      for (const layer of layers) {
        const id = layer.id;
        try {
          if (layer.type === "background") {
            map.setPaintProperty(id, "background-color", paper);
          } else if (layer.type === "fill" && /water/i.test(id)) {
            map.setPaintProperty(id, "fill-color", WATER);
          } else if (layer.type === "line" && /water/i.test(id)) {
            map.setPaintProperty(id, "line-color", WATERWAY);
          } else if (
            layer.type === "fill" &&
            /(land|park|wood|forest|green|sand|glacier)/i.test(id)
          ) {
            map.setPaintProperty(id, "fill-color", paper);
          }
        } catch {
          // Layer without that paint property; skip.
        }
      }

      // Frame the marker cluster. One point centers instead of over-zooming.
      if (points.length === 1) {
        const only = points[0];
        map.setCenter([only.lng, only.lat]);
        map.setZoom(12);
      } else if (points.length > 1) {
        const bounds = new LngLatBounds();
        for (const point of points) bounds.extend([point.lng, point.lat]);
        map.fitBounds(bounds, { padding: 70, maxZoom: 12, duration: 0 });
      }

      // Teardrop markers, colors read from the tokens at runtime.
      const rootStyle = getComputedStyle(document.documentElement);
      const blue = rootStyle.getPropertyValue("--color-accent-blue").trim();
      const heroInk = rootStyle.getPropertyValue("--color-hero-ink").trim();
      popupsRef.current = points.map((point) => {
        const popup = new Popup({
          offset: [0, -40],
          closeButton: false,
        }).setHTML(popupHtml(point, langRef.current));
        new Marker({ element: pinElement(point.count, blue, heroInk), anchor: "bottom" })
          .setLngLat([point.lng, point.lat])
          .setPopup(popup)
          .addTo(map);
        return { popup, point };
      });
    });

    return () => {
      popupsRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [points]);

  // Track the active language for popups built later inside the load handler,
  // and rebuild any existing popup content when the toggle changes.
  useEffect(() => {
    langRef.current = lang;
    for (const { popup, point } of popupsRef.current) {
      popup.setHTML(popupHtml(point, lang));
    }
  }, [lang]);

  const ariaLabel =
    lang === "es"
      ? "Mapa de impacto a nivel de ciudad"
      : "City-level impact map";

  return (
    <>
      <style>{SCOPED_CSS}</style>
      <div
        ref={containerRef}
        role="img"
        aria-label={ariaLabel}
        className="impact-map h-[380px] w-full rounded-md sm:h-[440px]"
      />
    </>
  );
}
