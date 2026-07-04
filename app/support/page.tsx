import { LocalizedText } from "@/components/i18n/LocalizedText";
import { publicImage } from "@/lib/content/assets";
import { SUPPORT_ORGS } from "@/lib/content/links";

/**
 * Continue the support. A curated link tree to already-public, reputable
 * nonprofits working the recovery. No donation form, ever.
 *
 * Content comes from lib/content/links.ts (SUPPORT_ORGS); organizers edit
 * that file directly, and thumbnails drop into
 * public/images/support/<org-slug>.{jpg,png,webp} per lib/content/assets.ts.
 */
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
        {SUPPORT_ORGS.map((org) => {
          const thumb = publicImage(`support/${org.slug}`);
          return (
            <li
              key={org.slug}
              className="flex gap-4 rounded-lg border border-border bg-card p-5"
            >
              {thumb ? (
                <img
                  src={thumb}
                  alt={`${org.nameEs} / ${org.nameEn}`}
                  loading="lazy"
                  className="h-16 w-16 shrink-0 rounded-md border border-border object-cover grayscale"
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  <LocalizedText es={org.nameEs} en={org.nameEn} />
                </p>
                <p className="mt-1 text-sm text-muted">
                  <LocalizedText
                    es={org.descriptionEs}
                    en={org.descriptionEn}
                  />
                </p>
                {org.url ? (
                  <a
                    href={org.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-sm text-body underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
                  >
                    <LocalizedText es="Visitar sitio" en="Visit site" />
                  </a>
                ) : (
                  <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted/70">
                    <LocalizedText
                      es="enlace pendiente"
                      en="link pending"
                    />
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
