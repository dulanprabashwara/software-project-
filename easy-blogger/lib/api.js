export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

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
      const error = new Error(data.message || `API error: ${response.statusText}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Pre-configured API methods mapped to backend routes
 */
export const api = {
  // Articles
  getArticles: (queryParams = "") => 
    fetchAPI(`/api/articles${queryParams}`),

  getArticleBySlug: (slug) => 
    fetchAPI(`/api/articles/${slug}`),

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

  getMe: (token) => 
    fetchAPI("/api/users/me", { token }),

  // User Endpoints
  updateProfile: (data, token) =>
    fetchAPI("/api/users/profile", { method: "PUT", body: data, token }),

  getUserProfile: (identifier) => 
    fetchAPI(`/api/users/${identifier}`),

  getUserProfileAuth: (identifier, token) =>
    fetchAPI(`/api/users/${identifier}`, { token }),

  // Follow System
  toggleFollow: (userId, token) =>
    fetchAPI(`/api/users/${userId}/follow`, { method: "POST", token }),

  getFollowers: (userId) => 
    fetchAPI(`/api/users/${userId}/followers`),

  getFollowing: (userId, token) =>
    fetchAPI(`/api/users/${userId}/following`, token ? { token } : {}),

  //Admin dashboard
  getAdminDashboard: (token) => 
    fetchAPI("/api/admin/dashboard", { token }),

  getEngagementAnalytics: (token, days) => 
    fetchAPI(`/api/admin/engagement?days=${days}`, { token }),

  getAdminMetrics: (token) => 
    fetchAPI(`/api/admin/metrics`, { token }),

  //offer moderation
  getOffers: (token) => 
    fetchAPI("/api/admin/offers", { token }),

  createOffer: (data, token) =>
    fetchAPI("/api/admin/offers", { method: "POST", body: data, token }),

  updateOffer: (id, data, token) =>
    fetchAPI(`/api/admin/offers/${id}`, { method: "PUT", body: data, token }),

  //Scraping Sources Management
  getScrapingSources: (token) =>
    fetchAPI("/api/admin/scraping-sources", { token }),

  createScrapingSource: (data, token) =>
    fetchAPI("/api/admin/scraping-sources", {method: "POST",body: data,token,}),

  validateUrl: (data, token) =>
    fetchAPI("/api/admin/validate-url", { method: "POST", body: data, token }),

  updateScrapingSource: (id, data, token) =>
    fetchAPI(`/api/admin/scraping-sources/${id}`, {method: "PUT",body: data,token,}),

  deleteScrapingSource: (id, token) =>
    fetchAPI(`/api/admin/scraping-sources/${id}`, { method: "DELETE", token }),

  // Scraper Test Endpoints
  triggerScrape: (token) =>
    fetchAPI("/api/scraper/trigger", { method: "POST", token }),

  triggerEnrichment: (token) =>
    fetchAPI("/api/scraper/enrich", { method: "POST", token }),

  // ─── Messages / Chat ──────────────────────
  getConversations: (token) =>
    fetchAPI("/api/messages/conversations", { token }),

  getMessages: (userId, token) =>
    fetchAPI(`/api/messages/${userId}`, { token }),

  markMessagesAsRead: (userId, token) =>
    fetchAPI(`/api/messages/${userId}/read`, { method: "PUT", token }),
  
  getUnreadMessageCount: (token) =>
    fetchAPI("/api/messages/unread/count", { token }),

  //Audit log
  getAuditLogs: (query = "", token) =>
    fetchAPI(`/api/admin/audit-logs${query}`, { token }),

  //Admin Moderation Queue
  getAdminReports: (query = "", token) =>
    fetchAPI(`/api/admin/reports${query}`, { token }),

  resolveReport: (reportId, status, token) =>
    fetchAPI(`/api/admin/reports/${reportId}`, {method: "PUT",body:{ status },token,}),

  banUser: (userId, reason, token) =>
    fetchAPI(`/api/admin/users/${userId}/ban`, {method: 'POST',body: { reason },token,}),

  unbanUser: (userId, token) => 
    fetchAPI(`/api/admin/users/${userId}/ban`, { method: 'DELETE', token}),

  // ─── Payment / Subscription ───────────────
  getActiveOffers: () => fetchAPI("/api/payments/offers"),

  createCheckoutSession: (offerId, token) =>
    fetchAPI("/api/payments/create-checkout-session", {
      method: "POST",
      body: { offerId },
      token,
    }),

  getSubscriptionStatus: (token) =>
    fetchAPI("/api/payments/subscription", { token }),

  cancelSubscription: (token) =>
    fetchAPI("/api/payments/cancel", { method: "POST", token }),

  createPortalSession: (token) =>
    fetchAPI("/api/payments/portal", { method: "POST", token }),

  // Account Management
  deleteAccount: (token) =>
    fetchAPI("/api/users/me", { method: "DELETE", token }),

  // --- Admin User Management ---
  getAdminUsers: (query = "", token) =>
    fetchAPI(`/api/admin/users${query}`, { token }),

  updateUserRole: (userId, role, token) =>
    fetchAPI(`/api/admin/users/${userId}/role`, {method: "PUT",body: JSON.stringify({ role }),token,}),

  getDefaultKeywords: (token) =>
    fetchAPI(`/api/admin/scraping/default-keywords`, { token }),

  getAdminMetrics: (token) => 
    fetchAPI(`/api/admin/metrics`, { token }),

  // Comments and articleRating
  getArticleComments: (articleId) => 
    fetchAPI(`/api/comments/${articleId}`),
  
  addComment: (data, token) => 
    fetchAPI("/api/comments", { method: "POST", body: data, token }),
    
  rateArticle: (articleId, rating, token) => 
    fetchAPI(`/api/comments/${articleId}/rate`, { method: "POST", body: { rating }, token }),

  // Feeds
  getFollowingFeed: (page = 1, token = null) => 
    fetchAPI(`/api/homefeed/following?page=${page}`, { token }),

  getNewFeed: (page = 1, token = null) => 
    fetchAPI(`/api/homefeed/main?page=${page}`, { token }),

  // Notifications
  getNotifications: (token) => 
    fetchAPI("/api/notifications", { token }),

  markNotificationRead: (notificationId, token) =>
    fetchAPI("/api/notifications/mark-read", { 
      method: "POST", 
      body: { notificationId }, 
      token 
    }),

    // Saved Articles
  getSavedArticles: (token) => 
    fetchAPI("/api/savedArticle", { token }),
    
  getSavedList: (token) => 
    fetchAPI("/api/savedArticle/savedList", { token }),

  // Topics / Tags
  getPopularTags: (limit = 10) => 
    fetchAPI(`/api/popularTopics?limit=${limit}`).then(res => res.data || []),

  getTrendingTitles: () => 
    fetchAPI(`/api/trendingArticles/trendingTitles`).then(res=> Array.isArray(res)? res: res.trending || [] ),

  getTrendingArticles: () => 
    fetchAPI(`/api/trendingArticles/trendingArticles`).then(res=> Array.isArray(res)? res: res.trending || [] ),

  // User History & Content
  getReadHistory: (token) => 
    fetchAPI("/api/readHistory", { token }).then(res => res.data || []),

  getPublishedArticles: (token) => 
    fetchAPI("/api/publishedArticles", { token }).then(res => res.data || []),

  // User Interactions & Ratings
  getInteractedArticles: (token) => 
    fetchAPI("/api/interactedArticles", { token }).then(res => res.data || []),

   getInteractedList: (token) => 
    fetchAPI("/api/interactedArticles/interactedList", { token }),

  getArticleRatings: (articleId, token) => 
    fetchAPI(`/api/articleRatings?articleId=${articleId}`, { token }).then(res => res.data || null),

  //for article stats

// for article stats
  // lib/api.js
getUserArticleStats: (token) => 
    fetchAPI("/api/articleStats", { token }).then(res => res.data || []),
  

};
