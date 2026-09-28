/**
 * Generate a URL-safe lowercase slug from a string
 * @param {string} text
 * @returns {string}
 */
export const slugify = (text) => {
  if (!text || typeof text !== "string") return "";

  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove non-word characters (except spaces & dashes)
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with a single dash
    .replace(/^-+|-+$/g, ""); // Strip leading/trailing dashes
};

export default slugify;
