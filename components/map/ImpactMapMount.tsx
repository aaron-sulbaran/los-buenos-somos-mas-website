"use client";

import dynamic from "next/dynamic";
import type { ImpactMapPoint } from "./ImpactMapClient";

/**
 * Client-only mount for the map. MapLibre GL touches `window` and WebGL, so
 * the map is loaded with `ssr: false`. In the App Router that dynamic import
 * has to live inside a `"use client"` boundary, which is this file; the
 * server `ImpactMap` stays a Server Component and renders this wrapper.
 */
const ImpactMapClient = dynamic(
  () => import("./ImpactMapClient").then((m) => m.ImpactMapClient),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-[380px] w-full rounded-md bg-card sm:h-[440px]"
        aria-hidden="true"
      />
    ),
  },
);

export function ImpactMapMount({ points }: { points: ImpactMapPoint[] }) {
  return <ImpactMapClient points={points} />;
}
