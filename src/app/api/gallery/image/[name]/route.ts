import { NextResponse } from "next/server";
import {
  getNextcloudClient,
  GALLERY_FOLDER,
  GALLERY_MIME_BY_EXT,
  isImageFile,
} from "@/lib/nextcloud";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/gallery/image/[name]">,
) {
  const { name } = await ctx.params;
  const filename = decodeURIComponent(name);

  // Guard against path traversal -- this must stay a bare filename inside the gallery folder.
  if (!isImageFile(filename) || filename.includes("/") || filename.includes("..")) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  try {
    const client = getNextcloudClient();
    const buffer = (await client.getFileContents(`${GALLERY_FOLDER}/${filename}`)) as Buffer;

    const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": GALLERY_MIME_BY_EXT[ext] ?? "application/octet-stream",
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (err) {
    console.error("[gallery] failed to fetch image", filename, err);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
