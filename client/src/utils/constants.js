export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const DEFAULT_PAGE_LIMIT = 12;

export const SORT_OPTIONS = [
  { label: 'Newest Arrivals', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
];

export const COMMON_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export const COMMON_COLORS = [
  'White',
  'Black',
  'Navy Blue',
  'Beige',
  'Olive Green',
  'Cream',
  'Grey',
  'Khaki',
];

export const PLACEHOLDER_PRODUCT_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750" fill="%23F5F1EB"><rect width="100%" height="100%" fill="%23F5F1EB"/><text x="50%" y="48%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="28" font-weight="600" fill="%23BFA88A">WARDROBE HUB</text><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="%238A6F4E">No Image Available</text></svg>';
