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

  // Auth Endpoints
  registerUser: (data, token) =>
    fetchAPI("/api/auth/register", { method: "POST", body: data, token }),
  syncUser: (data, token) =>
    fetchAPI("/api/auth/sync", { method: "POST", body: data, token }),
  getMe: (token) => fetchAPI("/api/users/me", { token }),

  // User Endpoints
  updateProfile: (data, token) =>
    fetchAPI("/api/users/profile", { method: "PUT", body: data, token }),
  getUserProfile: (identifier) => fetchAPI(`/api/users/${identifier}`),
  getUserProfileAuth: (identifier, token) =>
    fetchAPI(`/api/users/${identifier}`, { token }),

  // Follow System
  toggleFollow: (userId, token) =>
    fetchAPI(`/api/users/${userId}/follow`, { method: "POST", token }),
  getFollowers: (userId) => fetchAPI(`/api/users/${userId}/followers`),
  getFollowing: (userId) => fetchAPI(`/api/users/${userId}/following`),

  getAdminDashboard: (token) => 
    fetchAPI("/api/admin/dashboard", { token }),

  getOffers: (token) => 
    fetchAPI("/api/admin/offers", { token }),

  createOffer: (data, token) => 
    fetchAPI("/api/admin/offers", { method: "POST", body: data, token }),

  updateOffer: (id, data, token) =>  
    fetchAPI(`/api/admin/offers/${id}`, { method: "PUT", body: data, token }),

  getScrapingSources: (token) => 
    fetchAPI("/api/admin/scraping-sources", { token }),

  createScrapingSource: (data, token) => 
    fetchAPI("/api/admin/scraping-sources", { method: "POST", body: data, token }),
  
  validateUrl: (data, token) => 
    fetchAPI("/api/admin/validate-url", { method: "POST", body: data, token }),

  updateScrapingSource: (id, data, token) => 
    fetchAPI(`/api/admin/scraping-sources/${id}`, { method: "PUT", body: data, token }),

  deleteScrapingSource: (id, token) => 
    fetchAPI(`/api/admin/scraping-sources/${id}`, { method: "DELETE", token }),

  // ─── Payment / Subscription ───────────────
  getActiveOffers: () =>
    fetchAPI("/api/payments/offers"),

  createCheckoutSession: (offerId, token) =>
    fetchAPI("/api/payments/create-checkout-session", { method: "POST", body: { offerId }, token }),

  getSubscriptionStatus: (token) =>
    fetchAPI("/api/payments/subscription", { token }),

  cancelSubscription: (token) =>
    fetchAPI("/api/payments/cancel", { method: "POST", token }),

  createPortalSession: (token) =>
    fetchAPI("/api/payments/portal", { method: "POST", token }),

  // Stripe Customer Portal (dedicated endpoint)
  createStripePortalSession: (token) =>
    fetchAPI("/api/stripe/create-portal-session", { method: "POST", token }),
};
