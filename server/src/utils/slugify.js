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
    .replaceAll(/[^\w\s-]/g, "") // Remove non-word characters (except spaces & dashes)
    .replaceAll(/[\s_-]+/g, "-") // Replace spaces and underscores with a single dash
    .replaceAll(/(?:^-+)|(?:-+$)/g, ""); // Strip leading/trailing dashes
};

export default slugify;
