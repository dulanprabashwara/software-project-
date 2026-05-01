// tests/helpers/api.cjs.js
// ─────────────────────────────────────────────────────────────────────────────
// CommonJS re-export wrapper for lib/api.js
//
// Why needed:
//   lib/api.js uses ES module syntax (export const / export async function).
//   Jest runs in CommonJS (require) mode by default. We can't directly
//   require() an ESM file. This wrapper re-declares the same logic in CJS
//   so our tests can use it without needing a Babel/ESM transform pipeline.
//
//   This is the standard approach used for Next.js projects where you want
//   to unit-test utility functions WITHOUT setting up the full Next.js transform.
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

/**
 * Core fetch wrapper — mirrors lib/api.js fetchAPI exactly.
 */
async function fetchAPI(endpoint, options = {}) {
  const { method = "GET", body, token, ...customConfig } = options;

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
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
 * Pre-configured API methods — mirrors lib/api.js exactly.
 */
const api = {
  // Auth
  registerUser:  (data, token) => fetchAPI("/api/auth/register", { method: "POST", body: data, token }),
  syncUser:      (data, token) => fetchAPI("/api/auth/sync",     { method: "POST", body: data, token }),
  getMe:         (token)       => fetchAPI("/api/users/me", { token }),

  // User
  updateProfile:      (data, token)       => fetchAPI("/api/users/profile", { method: "PUT", body: data, token }),
  getUserProfile:     (identifier)        => fetchAPI(`/api/users/${identifier}`),
  getUserProfileAuth: (identifier, token) => fetchAPI(`/api/users/${identifier}`, { token }),
  deleteAccount:      (token)             => fetchAPI("/api/users/me", { method: "DELETE", token }),

  // Follow
  toggleFollow: (userId, token) => fetchAPI(`/api/users/${userId}/follow`, { method: "POST", token }),
  getFollowers: (userId)        => fetchAPI(`/api/users/${userId}/followers`),
  getFollowing: (userId, token) => fetchAPI(`/api/users/${userId}/following`, token ? { token } : {}),

  // Articles
  getArticles:      (queryParams = "") => fetchAPI(`/api/articles${queryParams}`),
  getArticleBySlug: (slug)             => fetchAPI(`/api/articles/${slug}`),
  createArticle:    (data, token)      => fetchAPI("/api/articles", { method: "POST", body: data, token }),

  // Payments
  getActiveOffers:         ()              => fetchAPI("/api/payments/offers"),
  createCheckoutSession:   (offerId, token) => fetchAPI("/api/payments/create-checkout-session", { method: "POST", body: { offerId }, token }),
  getSubscriptionStatus:   (token)          => fetchAPI("/api/payments/subscription", { token }),
  createStripePortalSession: (token)        => fetchAPI("/api/payments/portal", { method: "POST", token }),

  // Messages
  getConversations:      (token)        => fetchAPI("/api/messages/conversations", { token }),
  getMessages:           (userId, token) => fetchAPI(`/api/messages/${userId}`, { token }),
  markMessagesAsRead:    (userId, token) => fetchAPI(`/api/messages/${userId}/read`, { method: "PUT", token }),
  getUnreadMessageCount: (token)         => fetchAPI("/api/messages/unread/count", { token }),
};

module.exports = { fetchAPI, api, API_BASE_URL };
