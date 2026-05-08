import { fetchAPI } from "./api";

const FIRST_PAGE              = 1;
const MIN_SUGGESTION_LENGTH   = 2;

// Searches published articles and returns paginated results.
// Pass a token to receive personalised isSaved flags per article.
export const searchArticles = async (query, page = FIRST_PAGE, token = null) => {
  const params = new URLSearchParams({ q: query, page: String(page) });
  const res = await fetchAPI(`/api/search/articles?${params}`, token ? { token } : {});
  return res?.data ?? res;
};

// Searches user profiles and returns paginated results.
// Pass a token to receive personalised isFollowing flags per user.
export const searchUsers = async (query, page = FIRST_PAGE, token = null) => {
  const params = new URLSearchParams({ q: query, page: String(page) });
  const res = await fetchAPI(`/api/search/users?${params}`, token ? { token } : {});
  return res?.data ?? res;
};

// Returns autocomplete suggestions (articles + users) for a partial query.
export const getSearchSuggestions = async (query) => {
  if (!query || query.trim().length < MIN_SUGGESTION_LENGTH) return { articles: [], users: [] };
  const params = new URLSearchParams({ q: query.trim() });
  const res = await fetchAPI(`/api/search/suggestions?${params}`);
  return res?.data ?? res;
};