/**
 * Centralized Access Token Storage
 *
 * Keeps access token in memory with localStorage persistence for session resilience.
 * Note: Refresh token is strictly handled by HttpOnly cookie and never stored here.
 */

const ACCESS_TOKEN_KEY = 'wardrobe_hub_admin_access_token';

let memoryToken = null;

export const getAccessToken = () => {
  if (memoryToken) return memoryToken;
  try {
    const stored = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (stored) {
      memoryToken = stored;
    }
  } catch {
    memoryToken = null;
  }
  return memoryToken;
};

export const setAccessToken = (token) => {
  memoryToken = token || null;
  try {
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  } catch {
    // Graceful fallback if localStorage is disabled
  }
};

export const clearAccessToken = () => {
  memoryToken = null;
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    // Graceful fallback
  }
};
