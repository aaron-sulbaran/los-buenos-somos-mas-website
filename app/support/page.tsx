import { LocalizedText } from "@/components/i18n/LocalizedText";

/**
 * Continue the support. A curated link tree to already-public, reputable
 * nonprofits working the recovery. No donation form, ever.
 *
 * TODO Phase 1 (Sonnet 5): the three entries below are placeholders.
 * The organizers must replace name, description, and href with a real,
 * vetted nonprofit for each. Once a real link exists, add
 * target="_blank" rel="noopener noreferrer" to that entry's anchor.
 */
const PLACEHOLDER_ORGS = [
  {
    nameEs: "[Organización de ejemplo 1]",
    nameEn: "[Placeholder organization 1]",
    descriptionEs: "Descripción breve de su trabajo en la zona.",
    descriptionEn: "Short description of their work in the area.",
    // TODO: replace with the organization's real, vetted URL.
    href: "#",
  },
  {
    nameEs: "[Organización de ejemplo 2]",
    nameEn: "[Placeholder organization 2]",
    descriptionEs: "Descripción breve de su trabajo en la zona.",
    descriptionEn: "Short description of their work in the area.",
    // TODO: replace with the organization's real, vetted URL.
    href: "#",
  },
  {
    nameEs: "[Organización de ejemplo 3]",
    nameEn: "[Placeholder organization 3]",
    descriptionEs: "Descripción breve de su trabajo en la zona.",
    descriptionEn: "Short description of their work in the area.",
    // TODO: replace with the organization's real, vetted URL.
    href: "#",
  },
];

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl tracking-tight sm:text-5xl">
        <LocalizedText es="Sigue apoyando" en="Continue the support" />
      </h1>
      <p className="mt-3 max-w-xl text-muted">
        <LocalizedText
          es="Este fondo está cerrado, pero la recuperación continúa. Estas organizaciones públicas y confiables siguen trabajando."
          en="This fund is closed, but the recovery continues. These public, reputable organizations are still at work."
        />
      </p>
      <p className="mt-4 max-w-xl text-sm text-muted">
        <LocalizedText
          es="Los Buenos Somos Más no recauda ni distribuye fondos para estas organizaciones. Son entidades públicas independientes, listadas aquí solo como referencia."
          en="Los Buenos Somos Más does not raise or handle funds for these organizations. They are independent public entities, listed here for reference only."
        />
      </p>

      <ul className="mt-10 space-y-4">
        {PLACEHOLDER_ORGS.map((org) => (
          <li
            key={org.nameEn}
            className="rounded-lg border border-border bg-card p-5"
          >
            <p className="font-medium">
              <LocalizedText es={org.nameEs} en={org.nameEn} />
            </p>
            <p className="mt-1 text-sm text-muted">
              <LocalizedText es={org.descriptionEs} en={org.descriptionEn} />
            </p>
            <a
              href={org.href}
              className="mt-3 inline-block text-sm text-body underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
            >
              <LocalizedText es="Visitar sitio" en="Visit site" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
