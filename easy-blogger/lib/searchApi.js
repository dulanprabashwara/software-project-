// lib/searchApi.js
// ─────────────────────────────────────────────────────────────────────────────
// Search-specific API calls for the Easy Blogger search feature.
// Uses the existing fetchAPI helper from lib/api.js — api.js is NOT modified.
//
// Response shape from backend (after sendSuccess convention fix):
//   { success: true, data: { articles/users: [...], total, page, ... }, message: "..." }
//
// fetchAPI returns the full parsed JSON object, so:
//   res = { success: true, data: { articles: [...], ... }, message: "..." }
//   res.data = { articles: [...], ... }
// ─────────────────────────────────────────────────────────────────────────────

import { fetchAPI } from "./api";

/**
 * Search published articles, ranked by relevance then engagement.
 * @param {string}      query  Search term
 * @param {number}      page   Page number (default 1)
 * @param {string|null} token  Optional Firebase auth token
 */
export const searchArticles = async (query, page = 1, token = null) => {
  const params = new URLSearchParams({ q: query, page: String(page) });
  const res = await fetchAPI(
    `/api/search/articles?${params}`,
    token ? { token } : {}
  );
  // res.data is { articles: [...], total, page, limit, totalPages }
  // Fall back to res itself if data wrapper is absent (defensive)
  return res?.data ?? res;
};

/**
 * Search user profiles by username or display name, ranked by followers.
 * @param {string}      query  Search term
 * @param {number}      page   Page number (default 1)
 * @param {string|null} token  Optional Firebase auth token
 */
export const searchUsers = async (query, page = 1, token = null) => {
  const params = new URLSearchParams({ q: query, page: String(page) });
  const res = await fetchAPI(
    `/api/search/users?${params}`,
    token ? { token } : {}
  );
  return res?.data ?? res;
};

/**
 * Autocomplete suggestions — top 5 article titles + top 3 users.
 * Debounce at 300 ms before calling. Minimum query length: 2 characters.
 * @param {string} query Partial search term
 */
export const getSearchSuggestions = async (query) => {
  if (!query || query.trim().length < 2) return { articles: [], users: [] };
  const params = new URLSearchParams({ q: query.trim() });
  const res = await fetchAPI(`/api/search/suggestions?${params}`);
  return res?.data ?? res;
};
