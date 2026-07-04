"use client";

import { useHomeExploration } from "./HomeExploration";

/**
 * The hero constellation. Abstract by intent: never a countable seven or
 * eight, never a flag. Two explorable treatments, selected in dev; production
 * always renders the arc default (user-locked).
 * TODO: Aaron plans custom star SVGs from Figma; when they arrive, swap the
 * paths inside StarArc and keep the clipped-fifth composition.
 */
export function HeroStars() {
  const { starMotif } = useHomeExploration();
  return starMotif === "scatter" ? <StarScatter /> : <StarArc />;
}

/**
 * Scatter: an irregular spread of muted-blue dots with a single yellow accent.
 * The count is deliberately arbitrary so nothing reads as a symbol.
 */
function StarScatter() {
  return (
    <svg
      viewBox="0 0 300 220"
      className="pointer-events-none absolute right-6 top-14 w-[240px] max-w-[45%] opacity-45 sm:w-[300px]"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="var(--color-accent-blue)">
        <circle cx="54" cy="38" r="2.6" />
        <circle cx="128" cy="22" r="1.7" />
        <circle cx="201" cy="52" r="2.2" />
        <circle cx="252" cy="30" r="1.5" />
        <circle cx="92" cy="92" r="1.8" />
        <circle cx="168" cy="108" r="2.4" />
        <circle cx="236" cy="120" r="1.6" />
        <circle cx="38" cy="140" r="2" />
        <circle cx="150" cy="166" r="1.6" />
        <circle cx="214" cy="182" r="2.1" />
      </g>
      <circle cx="128" cy="22" r="4" fill="var(--color-accent-yellow)" />
    </svg>
  );
}

/**
 * Arc: a deliberate arc of four four-point stars with a fifth exiting the
 * frame, clipped by the panel edge. The accent star sits at the apex.
 */
function StarArc() {
  return (
    <svg
      viewBox="0 0 320 200"
      className="pointer-events-none absolute right-0 top-16 w-[280px] max-w-[52%] opacity-50 sm:w-[340px]"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="var(--color-accent-blue)">
        <Star cx={40} cy={128} r={6} />
        <Star cx={104} cy={78} r={7} />
        <Star cx={188} cy={62} r={7} />
        <Star cx={268} cy={92} r={6} />
      </g>
      {/* Fifth star, larger, pushed past the right edge so the frame clips it. */}
      <Star cx={320} cy={150} r={9} fill="var(--color-accent-yellow)" />
    </svg>
  );
}

function Star({
  cx,
  cy,
  r,
  fill,
}: {
  cx: number;
  cy: number;
  r: number;
  fill?: string;
}) {
  // A four-point star (concave diamond): points at the cardinals, waist at r/3.
  const w = r / 3;
  const d = [
    `M ${cx} ${cy - r}`,
    `L ${cx + w} ${cy - w}`,
    `L ${cx + r} ${cy}`,
    `L ${cx + w} ${cy + w}`,
    `L ${cx} ${cy + r}`,
    `L ${cx - w} ${cy + w}`,
    `L ${cx - r} ${cy}`,
    `L ${cx - w} ${cy - w}`,
    "Z",
  ].join(" ");
  return <path d={d} fill={fill} />;
}
