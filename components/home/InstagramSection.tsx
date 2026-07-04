import { LocalizedText } from "@/components/i18n/LocalizedText";
import { Reveal } from "./Reveal";
import { publicImage } from "@/lib/content/assets";
import { INSTAGRAM_POSTS } from "@/lib/content/links";

/**
 * Feed-style preview cards for the organizers' public Instagram posts. Each
 * card links out to the post itself; nothing is embedded, no scripts run, and
 * nothing autoplays. When a post's image has not been dropped into
 * public/images/instagram/ yet, the card falls back to the Instagram mark
 * centered on a card panel so the slot still reads as intentional.
 */
export function InstagramSection() {
  return (
    <section className="border-t border-border px-6 py-16 sm:px-10 sm:py-20 min-[860px]:px-14">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-display text-[clamp(1.6rem,2.6vw,2.4rem)] font-normal tracking-[-0.015em]">
          <LocalizedText es="Desde el terreno" en="From the ground" />
        </h2>
        <p className="mt-3 max-w-[52ch] text-body">
          <LocalizedText
            es="Las publicaciones de las organizadoras a medida que la ayuda llegaba."
            en="The organizers' posts as the aid arrived."
          />
        </p>

        <Reveal className="mt-10 grid grid-cols-1 gap-5 min-[560px]:grid-cols-3">
          {INSTAGRAM_POSTS.map((post) => {
            const photo = publicImage(post.image);
            return (
              <a
                key={post.image}
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex aspect-[4/5] flex-col overflow-hidden rounded-lg border border-border bg-card transition-opacity hover:opacity-90"
              >
                <div className="relative flex-1 overflow-hidden bg-card">
                  {photo ? (
                    <img
                      src={photo}
                      alt={`${post.captionEs} / ${post.captionEn}`}
                      loading="lazy"
                      className="h-full w-full object-cover grayscale"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-card">
                      <img
                        src="/images/instagram/instagram-logo.png"
                        alt="Instagram"
                        loading="lazy"
                        className="h-8 w-8 opacity-60"
                      />
                    </div>
                  )}
                </div>
                <p className="border-t border-border px-4 py-3 text-sm text-body">
                  <LocalizedText es={post.captionEs} en={post.captionEn} />
                </p>
              </a>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
