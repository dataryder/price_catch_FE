/**
 * Slugify a string by converting it to lowercase, removing non-alphanumeric characters,
 * replacing spaces with hyphens, and trimming trailing hyphens.
 */
export function slugify(text: string | null | undefined): string {
  if (!text) return "unknown";
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD") // split accented characters into components
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric chars with hyphens
    .replace(/^-+/, "") // trim leading hyphens
    .replace(/-+$/, ""); // trim trailing hyphens
}
