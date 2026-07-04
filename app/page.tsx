import Link from "next/link";
import { LocalizedText } from "@/components/i18n/LocalizedText";

/**
 * Home. Phase 0 placeholder structure; Phase 1 replaces each section
 * (hero motif, story, team, summary teaser, IG embeds).
 * All copy below is placeholder and marked with TODO for the organizers.
 */
export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      <section className="flex min-h-[70vh] flex-col justify-center py-16">
        <p className="text-sm uppercase tracking-widest text-muted">
          <LocalizedText
            es="Fondo ciudadano de ayuda, Venezuela 2026"
            en="Citizen-led relief fund, Venezuela 2026"
          />
        </p>
        <h1 className="mt-4 font-display text-5xl leading-tight tracking-tight sm:text-7xl">
          Los Buenos <em>Somos Más</em>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted">
          <LocalizedText
            es="Cada dólar recibido y cada dólar entregado, con recibos. Transparencia total de un esfuerzo ciudadano tras los terremotos del 24 de junio."
            en="Every dollar received and every dollar delivered, with receipts. Full transparency for a citizen effort after the June 24 earthquakes."
          />
        </p>
        {/* TODO Phase 1 (Opus 4.8): hero motif, desaturated flag gradient wash,
            star arc (four in frame, fifth exiting), scroll cue. */}
      </section>

      <section className="border-t border-border py-16">
        <h2 className="font-display text-3xl">
          <LocalizedText es="Cómo empezó" en="How it started" />
        </h2>
        <div className="mt-6 max-w-2xl space-y-4 text-muted">
          {/* TODO organizers: replace placeholder story copy. Length guide:
              two to three short paragraphs per language. */}
          <p>
            <LocalizedText
              es="[MARCADOR DE POSICIÓN] Aquí va la historia de cómo Barbara y Kelly organizaron el fondo en los días después de los terremotos. Dos o tres oraciones sobre el primer impulso y las primeras donaciones."
              en="[PLACEHOLDER] The story of how Barbara and Kelly organized the fund in the days after the earthquakes goes here. Two or three sentences about the first impulse and the first donations."
            />
          </p>
          <p>
            <LocalizedText
              es="[MARCADOR DE POSICIÓN] Segundo párrafo: cómo se recolectaron los fondos, por qué se cerró el fondo, y cómo se decidió a quién ayudar."
              en="[PLACEHOLDER] Second paragraph: how funds were gathered, why the fund closed, and how it was decided whom to help."
            />
          </p>
        </div>
      </section>

      <section className="border-t border-border py-16">
        <h2 className="font-display text-3xl">
          <LocalizedText es="El equipo" en="The team" />
        </h2>
        {/* TODO Phase 1 (Sonnet 5): team cards. Only consenting organizers:
            Barbara, Kelly, Isabela (organizers), Aaron (web developer). */}
        <p className="mt-6 max-w-2xl text-muted">
          <LocalizedText
            es="[MARCADOR DE POSICIÓN] Tarjetas del equipo con rol, foto opcional y redes."
            en="[PLACEHOLDER] Team cards with role, optional headshot, and socials."
          />
        </p>
      </section>

      <section className="border-t border-border py-16">
        <h2 className="font-display text-3xl">
          <LocalizedText es="Las cuentas claras" en="The full accounting" />
        </h2>
        <p className="mt-4 max-w-xl text-muted">
          <LocalizedText
            es="El resumen completo: recaudado, distribuido y disponible, con cada recibo."
            en="The complete summary: raised, distributed, and available, with every receipt."
          />
        </p>
        <Link
          href="/transparency"
          className="mt-6 inline-block border-b-2 border-accent-yellow pb-0.5 text-sm font-medium transition-colors hover:border-foreground"
        >
          <LocalizedText es="Ver la transparencia" en="View transparency" />
        </Link>
      </section>
    </div>
  );
}
