import "server-only";
import { existsSync } from "node:fs";
import path from "node:path";

/**
 * Convention-based local assets: drop a file into public/images/** with
 * the expected name and the matching section picks it up automatically on
 * the next deploy. Missing files keep the designed placeholder.
 *
 *   public/images/team/aaron.jpg barbara.jpg kelly.jpg  team headshots
 *   public/images/home/hero.jpg                         hero photo panel
 *   public/images/home/origin.jpg                       origin section photo
 *   public/images/instagram/reel-1.jpg reel-2.jpg ...   reel preview cards
 *   public/images/support/<org-slug>.jpg                support card thumbnails
 *
 * .png and .webp work anywhere .jpg is listed.
 */

const EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

/**
 * Returns the public URL path for the first existing variant of an image
 * (e.g. "team/aaron" checks aaron.jpg, aaron.jpeg, aaron.png, aaron.webp),
 * or null when none has been dropped in yet.
 */
export function publicImage(baseName: string): string | null {
  for (const ext of EXTENSIONS) {
    const relative = `images/${baseName}.${ext}`;
    if (existsSync(path.join(process.cwd(), "public", relative))) {
      return `/${relative}`;
    }
  }
  return null;
}
