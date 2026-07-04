import type { NextRequest } from "next/server";
import { getEnv } from "@/lib/env";
import { getDriveClient } from "@/lib/sheets/client";

/**
 * Cached receipt image proxy. The maintainer pastes Drive share links in
 * the sheet; the site extracts file ids and loads images through this
 * route with the app's read-only credentials. Raw Drive URLs are never
 * hotlinked. Serves images only.
 */

const FILE_ID_PATTERN = /^[a-zA-Z0-9_-]{10,100}$/;

const CACHE_HEADER =
  "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";

/**
 * Walks up the parent chain so the maintainer can organize photos into
 * subfolders (any depth, created anytime) under the receipts folder.
 * Bounded to keep a hostile deep tree from stalling the request.
 */
const MAX_FOLDER_DEPTH = 6;
const MAX_PARENTS_PER_LEVEL = 4;

type DriveClient = ReturnType<typeof getDriveClient>;

async function isInsideFolder(
  drive: DriveClient,
  startParents: string[],
  rootFolderId: string,
): Promise<boolean> {
  let level = startParents;
  for (let depth = 0; depth < MAX_FOLDER_DEPTH && level.length > 0; depth++) {
    if (level.includes(rootFolderId)) return true;
    const next: string[] = [];
    for (const parentId of level.slice(0, MAX_PARENTS_PER_LEVEL)) {
      try {
        const parent = await drive.files.get({
          fileId: parentId,
          fields: "parents",
        });
        next.push(...(parent.data.parents ?? []));
      } catch {
        // Unreadable parent: not shared with the robot, so not ours.
      }
    }
    level = next;
  }
  return false;
}

const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
  <rect width="600" height="800" fill="#ffffff"/>
  <rect x="24" y="24" width="552" height="752" fill="none" stroke="#e7e4de" stroke-width="2"/>
  <text x="300" y="380" text-anchor="middle" font-family="sans-serif" font-size="28" fill="#6b6b6b">Recibo de ejemplo</text>
  <text x="300" y="420" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#6b6b6b">Sample receipt</text>
</svg>`;

export async function GET(request: NextRequest) {
  const fileId = request.nextUrl.searchParams.get("id");
  if (!fileId || !FILE_ID_PATTERN.test(fileId)) {
    return new Response("Invalid file id", { status: 400 });
  }

  const env = getEnv();

  if (env.DATA_SOURCE === "fixture") {
    return new Response(PLACEHOLDER_SVG, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": CACHE_HEADER,
      },
    });
  }

  try {
    const drive = getDriveClient();

    const metadata = await drive.files.get({
      fileId,
      fields: "mimeType, parents",
    });
    const mimeType = metadata.data.mimeType ?? "";
    if (!mimeType.startsWith("image/")) {
      return new Response("Not an image", { status: 415 });
    }
    if (env.GOOGLE_DRIVE_RECEIPTS_FOLDER_ID) {
      const allowed = await isInsideFolder(
        drive,
        metadata.data.parents ?? [],
        env.GOOGLE_DRIVE_RECEIPTS_FOLDER_ID,
      );
      if (!allowed) {
        return new Response("Not found", { status: 404 });
      }
    }

    const file = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "arraybuffer" },
    );

    return new Response(Buffer.from(file.data as ArrayBuffer), {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": CACHE_HEADER,
      },
    });
  } catch {
    // Covers missing files and files not shared with the service account.
    return new Response("Not found", { status: 404 });
  }
}
