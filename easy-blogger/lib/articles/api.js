/* easy-blogger/lib/articles/api.js */

import { getAuth, onAuthStateChanged } from "firebase/auth";

const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:5000";

const API_PREFIX = "/api";
const AUTH_READY_TIMEOUT_MS = 5000;

// Custom API error wrapper for consistent frontend error handling
class ApiError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

// Build consistent backend API URLs from a single source
function buildApiUrl(endpoint) {
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  return `${API_ORIGIN}${API_PREFIX}${normalizedEndpoint}`;
}

// Wait for Firebase auth to be ready before protected API calls
async function waitForAuthenticatedUser() {
  const auth = getAuth();

  // Reuse current authenticated user when already available
  if (auth.currentUser) {
    return auth.currentUser;
  }

  return new Promise((resolve, reject) => {
    let finished = false;

    const cleanup = () => {
      finished = true;
      clearTimeout(timeoutId);
      unsubscribe();
    };

    // Prevent infinite waiting if auth state takes too long
    const timeoutId = setTimeout(() => {
      if (finished) return;
      cleanup();
      reject(
        new ApiError("Authentication required. Please log in again.", 401),
      );
    }, AUTH_READY_TIMEOUT_MS);

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (finished) return;
        cleanup();

        // Reject protected requests when user is not logged in
        if (!user) {
          reject(
            new ApiError("Authentication required. Please log in again.", 401),
          );
          return;
        }
        resolve(user);
      },
      (error) => {
        if (finished) return;
        cleanup();

        // Standardize auth initialization failures
        reject(
          new ApiError(
            error?.message || "Failed to initialize authentication.",
            401,
          ),
        );
      },
    );
  });
}

// Attach Firebase token for authenticated backend routes
async function getAuthHeaders() {
  const user = await waitForAuthenticatedUser();
  const token = await user.getIdToken();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// Centralized API response parsing for consistent success/error handling
async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      `Request failed with status ${response.status}`;

    throw new ApiError(message, response.status, payload);
  }

  return payload;
}

//Protected routes need Firebase tokens, so this helper keeps auth handling centralized.
async function apiRequest(endpoint, options = {}) {
  const headers = await getAuthHeaders();
  const url = buildApiUrl(endpoint);

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },

    // Prevent stale editor/article data from browser cache
    cache: options.cache || "no-store",
  });

  return parseResponse(response);
}

// Public API requests used for public profile/article pages since Public pages should work without user login.
async function publicApiRequest(endpoint, options = {}) {
  const url = buildApiUrl(endpoint);

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  return parseResponse(response);
}

export async function getDraftById(articleId) {
  if (!articleId) {
    throw new ApiError("Article id is required.", 400);
  }

  return apiRequest(`/articles/id/${encodeURIComponent(articleId)}`, {
    method: "GET",
  });
}

export async function getCurrentEditingDraft() {
  return apiRequest("/articles/user/editing", {
    method: "GET",
  });
}

export async function createDraft(payload) {
  return apiRequest("/articles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateDraft(articleId, payload) {
  if (!articleId) {
    throw new ApiError("Article id is required for update.", 400);
  }

  return apiRequest(`/articles/${encodeURIComponent(articleId)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteDraft(articleId) {
  if (!articleId) {
    throw new ApiError("Article id is required for delete.", 400);
  }

  return apiRequest(`/articles/${encodeURIComponent(articleId)}`, {
    method: "DELETE",
  });
}

export async function getMyDrafts(page = 1, limit = 10, options = {}) {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (typeof options.isAiGenerated === "boolean") {
    query.set("isAiGenerated", String(options.isAiGenerated));
  }

  return apiRequest(`/articles/user/drafts?${query.toString()}`, {
    method: "GET",
  });
}

export async function getMyPublishedArticles(page = 1, limit = 10) {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  return apiRequest(`/articles/user/published?${query.toString()}`, {
    method: "GET",
  });
}

export async function getMyScheduledArticles(page = 1, limit = 10) {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  return apiRequest(`/articles/user/scheduled?${query.toString()}`, {
    method: "GET",
  });
}

export async function publishArticle(articleId, payload) {
  if (!articleId) {
    throw new ApiError("Article id is required.", 400);
  }

  return apiRequest(`/articles/${encodeURIComponent(articleId)}/publish`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function startEditExisting(articleId) {
  if (!articleId) {
    throw new ApiError("Article id is required.", 400);
  }

  return apiRequest(
    `/articles/${encodeURIComponent(articleId)}/edit-existing/start`,
    {
      method: "POST",
    },
  );
}

export async function autosaveEditExisting(articleId, payload) {
  if (!articleId) {
    throw new ApiError("Article id is required.", 400);
  }

  return apiRequest(
    `/articles/${encodeURIComponent(articleId)}/edit-existing/autosave`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

export async function saveEditExistingAsDraft(articleId, payload) {
  if (!articleId) {
    throw new ApiError("Article id is required.", 400);
  }

  return apiRequest(
    `/articles/${encodeURIComponent(articleId)}/edit-existing/save-draft`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

export async function discardEditExisting(articleId) {
  if (!articleId) {
    throw new ApiError("Article id is required.", 400);
  }

  return apiRequest(
    `/articles/${encodeURIComponent(articleId)}/edit-existing/discard`,
    {
      method: "POST",
    },
  );
}

/*
 Edit-as-new flow
 */
export async function startEditAsNew(sourceArticleId) {
  if (!sourceArticleId) {
    throw new ApiError("Source article id is required.", 400);
  }

  return apiRequest(
    `/articles/${encodeURIComponent(sourceArticleId)}/edit-as-new/start`,
    {
      method: "POST",
    },
  );
}

export async function autosaveEditAsNew(articleId, payload) {
  if (!articleId) {
    throw new ApiError("Article id is required.", 400);
  }

  return apiRequest(
    `/articles/${encodeURIComponent(articleId)}/edit-as-new/autosave`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

export async function saveEditAsNewAsDraft(articleId, payload) {
  if (!articleId) {
    throw new ApiError("Article id is required.", 400);
  }

  return apiRequest(
    `/articles/${encodeURIComponent(articleId)}/edit-as-new/save-draft`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

export async function discardEditAsNew(articleId) {
  if (!articleId) {
    throw new ApiError("Article id is required.", 400);
  }

  return apiRequest(
    `/articles/${encodeURIComponent(articleId)}/edit-as-new/discard`,
    {
      method: "POST",
    },
  );
}

export async function getPublishedArticlesByUsername(username, page = 1, limit = 10) {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  return publicApiRequest(
    `/articles/author/${encodeURIComponent(username)}/published?${query.toString()}`,
    { method: "GET" },
  );
}