/**
 * Shared validation utilities for strict email and phone validation.
 * Mirrored from storefront client validation standards.
 */

// Common mistyped email domains
const TYPO_DOMAINS = new Set([
  'gamil.com',
  'gmial.com',
  'gmaill.com',
  'gmai.com',
  'gmal.com',
  'gmaik.com',
  'gamil.co',
  'gamil.in',
  'gmai.in',
  'gmai.co',
  'yaho.com',
  'yahooo.com',
  'yhaoo.com',
  'yaho.co',
  'ymail.co',
  'yaho.in',
  'yaho.net',
  'hotmial.com',
  'hotmai.com',
  'hotmaill.com',
  'hotmial.co',
  'outlok.com',
  'outloo.com',
  'outlok.co',
  'redifmail.com',
  'rediffmial.com',
  'redif.com',
  'icld.com',
  'icloud.co',
]);

const DUMMY_SEQUENTIAL_NUMBERS = new Set([
  '0123456789',
  '1234567890',
  '9876543210',
]);

const STANDARD_EMAIL_REGEX =
  /^[a-zA-Z0-9]+([._%+-][a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.-][a-zA-Z0-9]+)*\.[a-zA-Z]{2,24}$/;
const CONSECUTIVE_CONSONANTS_REGEX = /[bcdfghjklmnpqrstvwxyz]{5,}/i;
const ALLOWED_5_CONSONANTS = /^(ngths|rchts)$/i;
const REPEATED_3_CHARS_REGEX = /([a-zA-Z0-9])\1{2,}/;
const REPEATED_CHUNK_REGEX = /([a-zA-Z0-9]{3,})\1+/i;
const REPEATED_2CHAR_REGEX = /([a-zA-Z0-9]{2,})\1{2,}/i;
const VOWELS_REGEX = /[aeiouy]/i;
const KEYBOARD_MASH_PATTERNS = [
  'asdf', 'sdfg', 'dfgh', 'fghj', 'ghjk', 'hjkl', 'lkjh', 'kjhg', 'jhgf', 'hgfd', 'gfds', 'fdsa',
  'qwerty', 'qwer', 'wert', 'erty', 'rtyu', 'tyui', 'yuio', 'uiop', 'poiuy', 'oiuyt', 'iuytr', 'uytre', 'ytrew', 'trewq',
  'zxcv', 'xcvb', 'cvbn', 'vbnm', 'mnbv', 'nbvc', 'bvcx', 'vcxz',
  '1234', '2345', '3456', '4567', '5678', '6789', '7890', '0987', '9876', '8765', '7654', '6543', '5432', '4321',
];
const IMPOSSIBLE_CONSONANT_CLUSTERS = /(bf[wjf]|fw[jb]|q[^ue]|j[kxz]|z[bcdfghjklmnpqrstvwxyz]{2,}|[bcdfghjklmnpqrstvwxyz]x[bcdfghjklmnpqrstvwxyz])/i;

/**
 * Validates whether an email string meets strict formatting, domain, and sanity requirements.
 * @param {string} email
 * @returns {{ isValid: boolean, message?: string }}
 */
export const validateStrictEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, message: 'Email is required' };
  }

  const normalized = email.trim().toLowerCase();

  if (normalized.length < 5 || normalized.length > 150) {
    return { isValid: false, message: 'Email length must be between 5 and 150 characters' };
  }

  if (normalized.includes('..')) {
    return { isValid: false, message: 'Email cannot contain consecutive dots' };
  }

  if (!STANDARD_EMAIL_REGEX.test(normalized)) {
    return { isValid: false, message: 'Invalid email address format' };
  }

  const parts = normalized.split('@');
  if (parts.length !== 2) {
    return { isValid: false, message: 'Invalid email address format' };
  }

  const [localPart, domainPart] = parts;

  if (localPart.length < 3) {
    return { isValid: false, message: 'Email username must be at least 3 characters' };
  }

  // Domain checks
  if (TYPO_DOMAINS.has(domainPart)) {
    return {
      isValid: false,
      message: 'Invalid email domain (did you mean @gmail.com or another major provider?)',
    };
  }

  const domainLabels = domainPart.split('.');
  const tld = domainLabels[domainLabels.length - 1];
  if (!tld || tld.length < 2 || !/^[a-z]+$/.test(tld)) {
    return { isValid: false, message: 'Email has an invalid top-level domain' };
  }

  // Local-part sanity checks: disallow 3 or more repeated identical characters (e.g. aaa, 111, zzz)
  if (REPEATED_3_CHARS_REGEX.test(localPart)) {
    return { isValid: false, message: 'Email username cannot contain 3 or more repeated characters' };
  }

  // Disallow repeated multi-character sequence / n-grams (e.g. webfwebf, abcabc, asdfasdf)
  if (REPEATED_CHUNK_REGEX.test(localPart)) {
    return { isValid: false, message: 'Email username contains repeating character patterns' };
  }

  // Disallow 2-character repeated sequences 3+ times (e.g. ababab, 121212)
  if (REPEATED_2CHAR_REGEX.test(localPart)) {
    return { isValid: false, message: 'Email username contains repeating character patterns' };
  }

  // Disallow keyboard mash patterns
  for (const mash of KEYBOARD_MASH_PATTERNS) {
    if (localPart.includes(mash)) {
      return { isValid: false, message: 'Email username contains keyboard mash patterns' };
    }
  }

  // Disallow impossible random consonant clusters (e.g. bfw, bfj, etc.)
  if (IMPOSSIBLE_CONSONANT_CLUSTERS.test(localPart)) {
    return { isValid: false, message: 'Email username contains invalid random character patterns' };
  }

  // Disallow 5 or more consecutive consonants unless standard exception
  const consonantMatch = localPart.match(CONSECUTIVE_CONSONANTS_REGEX);
  if (consonantMatch && !ALLOWED_5_CONSONANTS.test(consonantMatch[0])) {
    return { isValid: false, message: 'Email username contains invalid consonant patterns' };
  }

  // Ensure alpha characters contain pronounceable vowels
  const alphaChars = localPart.replace(/[^a-z]/g, '');
  if (alphaChars.length >= 4 && !VOWELS_REGEX.test(alphaChars)) {
    return { isValid: false, message: 'Email username must contain valid pronounceable characters' };
  }

  return { isValid: true };
};

/**
 * Validates whether a mobile phone string meets strict Indian 10-digit mobile standards.
 * @param {string} phone
 * @param {boolean} isOptional
 * @returns {{ isValid: boolean, message?: string }}
 */
export const validateStrictPhone = (phone, isOptional = false) => {
  if (!phone || typeof phone !== 'string') {
    if (isOptional) return { isValid: true };
    return { isValid: false, message: 'Phone number is required' };
  }

  const trimmed = phone.trim();
  if (!trimmed) {
    if (isOptional) return { isValid: true };
    return { isValid: false, message: 'Phone number is required' };
  }

  // Exactly 10 digits
  if (!/^\d{10}$/.test(trimmed)) {
    return { isValid: false, message: 'Phone number must be exactly 10 digits' };
  }

  // Valid mobile prefixes: 6, 7, 8, or 9
  if (!/^[6-9]/.test(trimmed)) {
    return { isValid: false, message: 'Phone number must start with 6, 7, 8, or 9' };
  }

  // All identical digits check (e.g., 9999999999)
  if (/^(\d)\1{9}$/.test(trimmed)) {
    return { isValid: false, message: 'Phone number cannot contain all identical digits' };
  }

  // Sequential dummy numbers check
  if (DUMMY_SEQUENTIAL_NUMBERS.has(trimmed)) {
    return { isValid: false, message: 'Sequential or dummy phone numbers are not allowed' };
  }

  // Digit variety check (must have at least 4 unique digits to prevent 9898989898 or 9988998899)
  const uniqueDigits = new Set(trimmed);
  if (uniqueDigits.size < 4) {
    return { isValid: false, message: 'Please enter a valid, non-repeating mobile number' };
  }

  return { isValid: true };
};

export default {
  validateStrictEmail,
  validateStrictPhone,
};
