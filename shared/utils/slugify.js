/**
 * Generate a URL-safe lowercase slug from a string
 * @param {string} text
 * @returns {string}
 */
export const slugify = (text) => {
  if (!text || typeof text !== 'string') return '';

  let slug = text
    .toString()
    .toLowerCase()
    .trim()
    .replaceAll(/[^\w\s-]/g, '')
    .replaceAll(/[\s_-]+/g, '-');

  while (slug.startsWith('-')) {
    slug = slug.slice(1);
  }
  while (slug.endsWith('-')) {
    slug = slug.slice(0, -1);
  }

  return slug;
};

export default slugify;
