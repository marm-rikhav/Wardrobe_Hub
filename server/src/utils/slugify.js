/**
 * Generate a URL-safe lowercase slug from a string
 * @param {string} text
 * @returns {string}
 */
export const slugify = (text) => {
  if (!text || typeof text !== "string") return "";

  let slug = text
    .toString()
    .toLowerCase()
    .trim()
    .replaceAll(/[^\w\s-]/g, "") // Remove non-word characters (except spaces & dashes)
    .replaceAll(/[\s_-]+/g, "-"); // Replace spaces and underscores with a single dash

  while (slug.startsWith("-")) {
    slug = slug.slice(1);
  }
  while (slug.endsWith("-")) {
    slug = slug.slice(0, -1);
  }

  return slug;
};

export default slugify;
