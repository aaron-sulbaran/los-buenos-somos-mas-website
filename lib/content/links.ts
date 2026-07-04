/**
 * Hardcoded content that does not come from the Google Sheet: Instagram
 * posts for the home page and the vetted organizations on the support
 * page. Aaron edits this file directly; images follow the conventions in
 * lib/content/assets.ts.
 */

export type InstagramPost = {
  /** Public post or reel URL. TODO organizers: replace placeholders. */
  url: string;
  /** Image base name under public/images, e.g. "instagram/reel-1". */
  image: string;
  captionEs: string;
  captionEn: string;
};

export const INSTAGRAM_POSTS: InstagramPost[] = [
  {
    url: "https://www.instagram.com/",
    image: "instagram/reel-1",
    captionEs: "[MARCADOR] Primer reel del esfuerzo",
    captionEn: "[PLACEHOLDER] First reel from the effort",
  },
  {
    url: "https://www.instagram.com/",
    image: "instagram/reel-2",
    captionEs: "[MARCADOR] Segundo reel",
    captionEn: "[PLACEHOLDER] Second reel",
  },
  {
    url: "https://www.instagram.com/",
    image: "instagram/reel-3",
    captionEs: "[MARCADOR] Tercer reel",
    captionEn: "[PLACEHOLDER] Third reel",
  },
];

export type SupportOrg = {
  /** Also the image base name: public/images/support/<slug>.jpg */
  slug: string;
  nameEs: string;
  nameEn: string;
  descriptionEs: string;
  descriptionEn: string;
  /** TODO organizers: real, vetted URL; null keeps the card unlinked. */
  url: string | null;
};

export const SUPPORT_ORGS: SupportOrg[] = [
  {
    slug: "org-1",
    nameEs: "[Organización de ejemplo 1]",
    nameEn: "[Placeholder organization 1]",
    descriptionEs: "Descripción breve de su trabajo en la zona.",
    descriptionEn: "Short description of their work in the area.",
    url: null,
  },
  {
    slug: "org-2",
    nameEs: "[Organización de ejemplo 2]",
    nameEn: "[Placeholder organization 2]",
    descriptionEs: "Descripción breve de su trabajo en la zona.",
    descriptionEn: "Short description of their work in the area.",
    url: null,
  },
  {
    slug: "org-3",
    nameEs: "[Organización de ejemplo 3]",
    nameEn: "[Placeholder organization 3]",
    descriptionEs: "Descripción breve de su trabajo en la zona.",
    descriptionEn: "Short description of their work in the area.",
    url: null,
  },
];
