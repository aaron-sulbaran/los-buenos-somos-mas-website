import Link from "next/link";
import {
  LocalizedEcho,
  LocalizedText,
} from "@/components/i18n/LocalizedText";
import { HeroStars } from "@/components/home/HeroStars";
import { PhotoPlaceholder } from "@/components/home/PhotoPlaceholder";

/**
 * Split hero, Warm Archive direction. Type on warm paper at left under a very
 * low opacity diagonal flag wash and an abstract star motif; a grayscale photo
 * panel at right carries a 4px tricolor hairline and a location chip. It reads
 * like a ledger opened next to a photograph. Stacks below 860px.
 */
export function Hero() {
  return (
    <section className="grid grid-cols-1 min-[860px]:min-h-[calc(100svh-3.25rem)] min-[860px]:grid-cols-[1.05fr_0.95fr]">
      {/* Left: type on paper */}
      <div className="relative flex flex-col overflow-hidden px-6 py-9 sm:px-10 sm:py-10 min-[860px]:px-14">
        {/* The single sanctioned gradient: a faded flag wash, never a flag. */}
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "linear-gradient(115deg," +
              " color-mix(in srgb, var(--color-accent-yellow) 16%, transparent) 0%," +
              " color-mix(in srgb, var(--color-accent-yellow) 5%, transparent) 26%," +
              " color-mix(in srgb, var(--color-accent-blue) 10%, transparent) 40%," +
              " color-mix(in srgb, var(--color-accent-blue) 3%, transparent) 55%," +
              " color-mix(in srgb, var(--color-accent-red) 9%, transparent) 66%," +
              " color-mix(in srgb, var(--color-accent-red) 0%, transparent) 82%)",
          }}
          aria-hidden="true"
        />
        <HeroStars />

        {/* Locator */}
        <div className="relative z-10 flex items-baseline gap-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
          <span className="h-px w-5 shrink-0 self-center bg-accent-yellow" aria-hidden="true" />
          <span className="max-w-[24ch] leading-[1.8] min-[860px]:max-w-none">
            <LocalizedText
              es="Fondo de ayuda por el terremoto en Venezuela"
              en="Venezuela Earthquake Relief Fund"
            />
          </span>
        </div>

        {/* Body, vertically centered */}
        <div className="relative z-10 flex flex-1 flex-col justify-center py-10">
          <h1 className="max-w-[11ch] text-balance font-display text-[clamp(2.75rem,6.4vw,5.5rem)] font-normal leading-[0.98] tracking-[-0.02em]">
            Los Buenos <em className="font-light italic">Somos</em> Más
          </h1>

          <p className="mt-7 max-w-[46ch] text-pretty text-[clamp(1rem,1.5vw,1.25rem)] leading-[1.55] text-body">
            <LocalizedText
              es="Un fondo ciudadano para el terremoto de La Guaira y Caracas. Cada dólar que entró, cada dólar que salió, con recibos."
              en="A citizen fund for the La Guaira and Caracas earthquake. Every dollar that came in, every dollar that went out, with receipts."
            />
          </p>
          <p className="mt-2 max-w-[46ch] font-display text-[0.9375rem] italic text-muted">
            <LocalizedEcho
              es="Cada dólar que entró, cada dólar que salió, con recibos."
              en="Every dollar in, every dollar out, with receipts."
            />
          </p>

          <div className="mt-10 flex flex-wrap items-baseline gap-x-10 gap-y-4">
            <div>
              <div className="font-display text-[2.125rem] leading-none tabular-nums">
                100%
              </div>
              <div className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                <LocalizedText
                  es="recibido en Venezuela"
                  en="received in Venezuela"
                />
              </div>
            </div>
            <Link
              href="/transparency"
              className="group inline-flex items-center gap-1.5 border-b border-foreground pb-0.5 font-display text-[1.0625rem] transition-opacity hover:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
            >
              <LocalizedText es="Ver el registro" en="See the record" />
              <span
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="relative z-10 flex items-center gap-2.5 pb-1 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
          <span aria-hidden="true" className="motion-safe:animate-bounce">
            &#8595;
          </span>
          <LocalizedText
            es="Desplázate para conocer más"
            en="Scroll to learn more"
          />
        </div>
      </div>

      {/* Right: grayscale photo panel */}
      <div className="relative min-h-[320px] border-t border-border min-[860px]:min-h-0 min-[860px]:border-l min-[860px]:border-t-0">
        <PhotoPlaceholder
          slug="grayscale photo"
          captionEs="distribución de ayuda"
          captionEn="aid distribution"
        >
          {/* 4px tricolor hairline column at the panel edge */}
          <div
            className="absolute inset-y-0 left-0 flex w-1 flex-col"
            aria-hidden="true"
          >
            <span className="flex-1 bg-accent-yellow" />
            <span className="flex-1 bg-accent-blue" />
            <span className="flex-1 bg-accent-red" />
          </div>
          {/* Location chip */}
          <div className="absolute bottom-5 left-5 rounded-full border border-border bg-background/90 px-3.5 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted backdrop-blur-sm">
            La Guaira · 2026
          </div>
        </PhotoPlaceholder>
      </div>
    </section>
  );
}
