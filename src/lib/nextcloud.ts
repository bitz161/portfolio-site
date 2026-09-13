import { createClient, type WebDAVClient } from "webdav";

let client: WebDAVClient | undefined;

export function getNextcloudClient() {
  if (!client) {
    client = createClient(
      `${process.env.NEXTCLOUD_URL}/remote.php/dav/files/${process.env.NEXTCLOUD_USER}`,
      {
        username: process.env.NEXTCLOUD_USER!,
        password: process.env.NEXTCLOUD_PASSWORD!,
      },
    );
  }
  return client;
}

export const GALLERY_FOLDER = process.env.NEXTCLOUD_GALLERY_FOLDER ?? "/Portfolio";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"]);

export function isImageFile(filename: string) {
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  return IMAGE_EXTENSIONS.has(ext);
}

export const GALLERY_MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};
