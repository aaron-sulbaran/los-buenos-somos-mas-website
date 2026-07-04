import type { ReactNode } from "react";
import { LocalizedText } from "@/components/i18n/LocalizedText";

/**
 * A tonal stand-in for organizer-owned or free-use imagery. No stock photos:
 * this renders an in-palette archival block with a monospace slug so the layout
 * reads honestly as "photo pending". Real photos drop in here later, rendered
 * grayscale per the direction, and always credited.
 *
 * Stripes are built from the foreground token at low alpha (via color-mix) so
 * the placeholder stays inside the palette with no hardcoded colors.
 *
 * When `src` is provided (from `publicImage`, called by a parent server
 * component) the real photo renders instead, grayscale via CSS filter, with
 * overlays such as the tricolor hairline or a location chip still layered on
 * top through `children`. Alt text combines both languages into one string
 * since an HTML attribute cannot react to the language toggle.
 */
export function PhotoPlaceholder({
  slug,
  captionEs,
  captionEn,
  src,
  altEs,
  altEn,
  children,
}: {
  /** Fixed monospace marker, e.g. "grayscale photo". Not translated. */
  slug: string;
  captionEs: string;
  captionEn?: string;
  /** Public path from publicImage(), or null when no file has been dropped in. */
  src?: string | null;
  /** Bilingual alt text; falls back to the captions when omitted. */
  altEs?: string;
  altEn?: string;
  children?: ReactNode;
}) {
  if (src) {
    const es = altEs ?? captionEs;
    const en = altEn ?? captionEn ?? es;
    const alt = en !== es ? `${es} / ${en}` : es;
    return (
      <div className="relative h-full w-full overflow-hidden bg-card">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover grayscale"
        />
        {children}
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-card">
      <div
        className="absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(180deg," +
            " color-mix(in srgb, var(--color-foreground) 4%, var(--color-card)) 0 20px," +
            " color-mix(in srgb, var(--color-foreground) 8%, var(--color-card)) 20px 40px)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(200deg," +
            " color-mix(in srgb, var(--color-background) 40%, transparent)," +
            " color-mix(in srgb, var(--color-foreground) 18%, transparent))",
        }}
        aria-hidden="true"
      />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center font-mono text-[11px] uppercase leading-relaxed tracking-[0.12em] text-muted">
        <span className="block opacity-70">[ {slug} ]</span>
        <span className="mt-1 block">
          <LocalizedText es={captionEs} en={captionEn} />
        </span>
      </div>
      {children}
    </div>
  );
}
