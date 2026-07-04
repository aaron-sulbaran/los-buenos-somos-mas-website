/**
 * The hero constellation, locked after the organizer walkthrough: a
 * deliberate arc of four four-point stars with a fifth exiting the frame,
 * clipped by the panel edge. Abstract by intent: never a countable seven
 * or eight, never a flag.
 * TODO: Aaron plans custom star SVGs from Figma; swap the paths inside
 * StarArc and keep the clipped-fifth composition.
 */
export function HeroStars() {
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
