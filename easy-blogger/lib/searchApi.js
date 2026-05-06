import { fetchAPI } from "./api";

// Searches published articles. Pass token to receive personalised isSaved flags.
export const searchArticles = async (query, page = 1, token = null) => {
  const params = new URLSearchParams({ q: query, page: String(page) });
  const res = await fetchAPI(`/api/search/articles?${params}`, token ? { token } : {});
  return res?.data ?? res;
};

// Searches user profiles. Pass token to receive personalised isFollowing flags.
export const searchUsers = async (query, page = 1, token = null) => {
  const params = new URLSearchParams({ q: query, page: String(page) });
  const res = await fetchAPI(`/api/search/users?${params}`, token ? { token } : {});
  return res?.data ?? res;
};

// Returns autocomplete suggestions for a partial query (min 2 chars).
export const getSearchSuggestions = async (query) => {
  if (!query || query.trim().length < 2) return { articles: [], users: [] };
  const params = new URLSearchParams({ q: query.trim() });
  const res = await fetchAPI(`/api/search/suggestions?${params}`);
  return res?.data ?? res;
};