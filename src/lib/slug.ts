// Auto-slug used by both the project and blog post admin forms while the
// user is typing a title -- lowercase letters, numbers, and hyphens only,
// matching SLUG_PATTERN in the corresponding API routes.
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
