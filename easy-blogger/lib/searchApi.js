// lib/searchApi.js
import { fetchAPI } from "./api";

/**
 * Search published articles, ranked by relevance then engagement.
 * Pass the Firebase token so the backend resolves isSaved per article.
 * @param {string}      query  Search term
 * @param {number}      page   Page number (default 1)
 * @param {string|null} token  Firebase auth token (pass when user is logged in)
 */
export const searchArticles = async (query, page = 1, token = null) => {
  const params = new URLSearchParams({ q: query, page: String(page) });
  const res = await fetchAPI(
    `/api/search/articles?${params}`,
    token ? { token } : {}
  );
  return res?.data ?? res;
};

/**
 * Search user profiles by username or display name, ranked by followers.
 * Pass the Firebase token so the backend resolves isFollowing per user.
 * @param {string}      query  Search term
 * @param {number}      page   Page number (default 1)
 * @param {string|null} token  Firebase auth token (pass when user is logged in)
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
 * Debounce at 300 ms. Minimum query length: 2 characters.
 * @param {string} query Partial search term
 */
export const getSearchSuggestions = async (query) => {
  if (!query || query.trim().length < 2) return { articles: [], users: [] };
  const params = new URLSearchParams({ q: query.trim() });
  const res = await fetchAPI(`/api/search/suggestions?${params}`);
  return res?.data ?? res;
};
