export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Core fetch wrapper to simplify backend calls
 * Automatically handles JSON parsing, headers, and error checking
 */
export async function fetchAPI(endpoint, options = {}) {
  const { method = "GET", body, token, ...customConfig } = options;

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`; // Send Firebase token to Express backend
  }

  const config = {
    method,
    headers: { ...headers, ...customConfig.headers },
    ...customConfig,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `API error: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Pre-configured API methods mapped to your backend routes
 * Use these throughout your Next.js frontend components
 */
export const api = {
  // Articles
  getArticles: (queryParams = "") => fetchAPI(`/api/articles${queryParams}`),
  getArticleBySlug: (slug) => fetchAPI(`/api/articles/${slug}`),
  createArticle: (data, token) =>
    fetchAPI("/api/articles", { method: "POST", body: data, token }),

  // AI Features (Requires Premium Token)
  analyzeContent: (content, token) =>
    fetchAPI("/api/ai/analyze", { method: "POST", body: { content }, token }),

  // Users & Auth
  syncUser: (userData, token) =>
    fetchAPI("/api/auth/sync", { method: "POST", body: userData, token }),
  getMe: (token) => fetchAPI("/api/users/me", { token }),
  updateProfile: (data, token) =>
    fetchAPI("/api/users/me", { method: "PUT", body: data, token }),
  getUserProfile: (identifier) => fetchAPI(`/api/users/${identifier}`),

  // Add more as needed...
};
