import { customAlphabet } from "nanoid";

/**
 * Generate a short random suffix using nanoid
 */
const suffixNanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 4);

/**
 * Create a URL-friendly slug from text
 * Removes special characters, converts to lowercase, replaces spaces with hyphens
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics (Vietnamese accents)
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Generate a unique event slug from couple names
 * Format: bride-groom-suffix
 */
export function generateEventSlug(groomName: string, brideName: string): string {
  const groomSlug = slugify(groomName);
  const brideSlug = slugify(brideName);
  const suffix = suffixNanoid();
  return `${brideSlug}-${groomSlug}-${suffix}`;
}