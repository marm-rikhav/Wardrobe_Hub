/**
 * In-memory token management
 * The refresh token is strictly kept in HTTP-only cookies managed by the browser/server.
 */
let inMemoryAccessToken = null;

export const setAccessToken = (token) => {
  inMemoryAccessToken = token;
};

export const getAccessToken = () => {
  return inMemoryAccessToken;
};

export const clearAccessToken = () => {
  inMemoryAccessToken = null;
};
