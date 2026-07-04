import { LocalizedText } from "@/components/i18n/LocalizedText";
import { PhotoPlaceholder } from "@/components/home/PhotoPlaceholder";
import { Reveal } from "@/components/home/Reveal";

/**
 * Origin story. Photo of the organizers at left, text at right, with a short
 * three-mark tricolor rule closing the passage. The single eyebrow on the page
 * lives here by intent, as a named brand mark rather than section scaffolding.
 */
export function OriginSection() {
  return (
    <section className="grid grid-cols-1 border-t border-border min-[860px]:grid-cols-[0.95fr_1.05fr]">
      <div className="relative min-h-[280px] border-b border-border min-[860px]:min-h-[440px] min-[860px]:border-b-0 min-[860px]:border-r">
        {/* TODO organizers: replace with an organizer-owned photo of Barbara
            and Kelly, rendered grayscale and credited. No faces until then. */}
        <PhotoPlaceholder
          slug="organizers photo"
          captionEs="las organizadoras"
          captionEn="the organizers"
        />
      </div>

      <Reveal className="flex flex-col justify-center px-6 py-14 sm:px-10 min-[860px]:px-16 min-[860px]:py-20">
        <span className="mb-6 inline-flex self-start items-center rounded-full border border-border px-4 py-2 font-mono text-[10.5px] uppercase tracking-[0.2em] text-muted">
          <LocalizedText es="El origen" en="How it began" />
        </span>

        <h2 className="max-w-[16ch] text-balance font-display text-[clamp(1.9rem,3.4vw,3.25rem)] font-normal leading-[1.06] tracking-[-0.015em]">
          <LocalizedText
            es="Empezó con dos vecinas y "
            en="It started with two neighbors and "
          />
          <em className="font-light italic">
            <LocalizedText es="una hoja de cálculo." en="a spreadsheet." />
          </em>
        </h2>

        <div className="mt-6 max-w-[52ch] space-y-4 text-[1.0625rem] leading-[1.6] text-body">
          {/* TODO organizers: replace placeholder story copy. Length guide:
              two to three short paragraphs per language. */}
          <p>
            <LocalizedText
              es="Barbara Sulbaran y Kelly Valdes organizaron el fondo tras los sismos del 24 de junio de 2026. Sin intermediarios, sin comisiones. Solo un registro público de cada movimiento."
              en="Barbara Sulbaran and Kelly Valdes organized the fund after the earthquakes of June 24, 2026. No intermediaries, no fees. Just a public record of every movement."
            />
          </p>
          <p>
            <LocalizedText
              es="[MARCADOR DE POSICIÓN] Segundo párrafo: cómo se recolectaron los fondos, por qué se cerró el fondo, y cómo se decidió a quién ayudar."
              en="[PLACEHOLDER] Second paragraph: how the funds were gathered, why the fund closed, and how it was decided whom to help."
            />
          </p>
        </div>

        <div className="mt-9 flex items-center gap-3.5" aria-hidden="true">
          <span className="h-px w-8 bg-accent-yellow" />
          <span className="h-px w-8 bg-accent-blue" />
          <span className="h-px w-8 bg-accent-red" />
        </div>
      </Reveal>
    </section>
  );
}
