import "server-only";
import { unstable_cache } from "next/cache";
import type { MoneyOut } from "./sheets/types";

/**
 * Link preview enrichment for public links (Instagram posts, reels,
 * stories on highlight). Tries the page's og:image, the same thumbnail a
 * chat app shows when a link is shared. Instagram frequently refuses
 * logged-out scrapes, so a null result is normal and expected; the UI
 * falls back to the maintainer-supplied Publicación photo or the designed
 * logo card. Never throws.
 */

const FETCH_TIMEOUT_MS = 4000;

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "es-VE,es;q=0.9,en;q=0.8",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) return null;

    const html = (await response.text()).slice(0, 300_000);
    const match =
      html.match(
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      ) ??
      html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
      );
    if (!match) return null;

    const imageUrl = match[1].replace(/&amp;/g, "&").trim();
    const parsed = new URL(imageUrl, url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return null;
    }
    // Instagram's logged-out wall serves its own logo as og:image on the
    // login page; treat that as a miss so the designed fallback shows.
    if (/static\.cdninstagram\.com.*(favicon|logo)/i.test(parsed.href)) {
      return null;
    }
    return parsed.href;
  } catch {
    return null;
  }
}

/** Cached per link for a day; scrape failures are cached too (as null). */
const getCachedOgImage = unstable_cache(
  async (url: string) => fetchOgImage(url),
  ["og-image"],
  { revalidate: 86400 },
);

export type MoneyOutWithPreview = MoneyOut & {
  /** Scraped og:image URL, only set when there is no maintainer thumbnail. */
  previewImageUrl?: string;
};

/**
 * Adds scraped preview images to rows that have a public link but no
 * maintainer-supplied Publicación photo. Scrapes run concurrently and
 * individually; one slow or blocked link never affects the others.
 */
export async function enrichPublicationPreviews(
  rows: MoneyOut[],
): Promise<MoneyOutWithPreview[]> {
  return Promise.all(
    rows.map(async (row) => {
      if (!row.publicLink || row.publicationPreviewFileId) return row;
      const previewImageUrl = await getCachedOgImage(row.publicLink);
      return previewImageUrl ? { ...row, previewImageUrl } : row;
    }),
  );
}
