/**
 * Shared validation utilities for strict email and phone validation.
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
const CONSECUTIVE_CONSONANTS_REGEX = /[bcdfghjklmnpqrstvwxyz]{6,}/i;
const REPEATED_CHARS_REGEX = /([a-zA-Z0-9])\1{3,}/;
const VOWELS_REGEX = /[aeiouy]/i;
const LETTERS_ONLY_REGEX = /^[a-zA-Z]+$/;

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

  // Local-part sanity checks (disallow keyboard mash and repeated characters)
  if (REPEATED_CHARS_REGEX.test(localPart)) {
    return { isValid: false, message: 'Email username cannot contain 4 or more repeated characters' };
  }

  if (CONSECUTIVE_CONSONANTS_REGEX.test(localPart)) {
    return { isValid: false, message: 'Email username contains invalid random character patterns' };
  }

  if (localPart.length >= 5 && LETTERS_ONLY_REGEX.test(localPart) && !VOWELS_REGEX.test(localPart)) {
    return { isValid: false, message: 'Email username must contain valid pronounceable characters' };
  }

  return { isValid: true };
};

/**
 * Validates whether a mobile phone string meets strict Indian 10-digit mobile standards.
 * @param {string} phone
 * @returns {{ isValid: boolean, message?: string }}
 */
export const validateStrictPhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, message: 'Phone number is required' };
  }

  const trimmed = phone.trim();

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
