import { NextResponse } from "next/server";
import { getNextcloudClient, GALLERY_FOLDER, isImageFile } from "@/lib/nextcloud";
import type { FileStat } from "webdav";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const client = getNextcloudClient();
    const entries = (await client.getDirectoryContents(GALLERY_FOLDER)) as FileStat[];

    const photos = entries
      .filter((entry) => entry.type === "file" && isImageFile(entry.basename))
      .map((entry) => ({
        name: entry.basename,
        date: entry.lastmod,
        size: entry.size,
        url: `/api/gallery/image/${encodeURIComponent(entry.basename)}`,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(photos);
  } catch (err) {
    console.error("[gallery] failed to list Nextcloud folder", err);
    return NextResponse.json({ error: "Failed to load gallery" }, { status: 502 });
  }
}
