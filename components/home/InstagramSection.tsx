import { LocalizedText } from "@/components/i18n/LocalizedText";
import { Reveal } from "./Reveal";

/**
 * Instagram embeds, structural placeholder. The organizers posted updates as
 * the work happened; those posts will embed here once the URLs are collected.
 * Until then this holds the slots honestly rather than faking content.
 */
export function InstagramSection() {
  // TODO organizers: provide the public Instagram post URLs to embed. Only
  // accounts already public that chose to post; no private accounts.
  const SLOTS = ["1", "2", "3"];

  return (
    <section className="border-t border-border px-6 py-16 sm:px-10 sm:py-20 min-[860px]:px-14">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-display text-[clamp(1.6rem,2.6vw,2.4rem)] font-normal tracking-[-0.015em]">
          <LocalizedText es="Desde el terreno" en="From the ground" />
        </h2>
        <p className="mt-3 max-w-[52ch] text-body">
          <LocalizedText
            es="Las publicaciones de las organizadoras a medida que la ayuda llegaba. Se enlazarán aquí cuando estén listas."
            en="The organizers' posts as the aid arrived. They will be linked here once ready."
          />
        </p>

        <Reveal className="mt-10 grid grid-cols-1 gap-5 min-[560px]:grid-cols-3">
          {SLOTS.map((slot) => (
            <div
              key={slot}
              className="flex aspect-[4/5] items-center justify-center rounded-lg border border-dashed border-border bg-card font-mono text-[11px] uppercase tracking-[0.12em] text-muted/70"
            >
              [ instagram post ]
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
