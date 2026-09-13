import { getNextcloudClient, GALLERY_FOLDER, isImageFile } from "@/lib/nextcloud";
import GalleryGrid from "@/components/GalleryGrid";
import type { FileStat } from "webdav";

export const dynamic = "force-dynamic";

async function getGalleryPhotos() {
  try {
    const client = getNextcloudClient();
    const entries = (await client.getDirectoryContents(GALLERY_FOLDER)) as FileStat[];

    return entries
      .filter((entry) => entry.type === "file" && isImageFile(entry.basename))
      .map((entry) => ({
        name: entry.basename,
        date: entry.lastmod,
        size: entry.size,
        url: `/api/gallery/image/${encodeURIComponent(entry.basename)}`,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (err) {
    console.error("[gallery] failed to list Nextcloud folder", err);
    return [];
  }
}

export default async function GalleryPage() {
  const photos = await getGalleryPhotos();

  return (
    <div>
      <div className="border-b-2 border-foreground-bright px-6 py-14 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <span className="kicker mb-4 block">Gallery</span>
          <h1 className="font-serif text-foreground-bright mb-4 text-4xl sm:text-5xl">Photo Log</h1>
          <p className="max-w-xl border-l-4 border-foreground-bright pl-4 font-mono text-sm text-muted">
            Images pulled live from a self-hosted Nextcloud folder &mdash; the same server running
            this portfolio&apos;s database and monitoring stack.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
        <div className="mb-6">
          <span className="section-count">
            {photos.length} photo{photos.length === 1 ? "" : "s"}
          </span>
        </div>
        <GalleryGrid photos={photos} />
      </div>
    </div>
  );
}
