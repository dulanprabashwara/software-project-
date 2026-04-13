/* easy-blogger/lib/articles/api.js */

import { getAuth, onAuthStateChanged } from "firebase/auth";

const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:5000";

const API_PREFIX = "/api";
const AUTH_READY_TIMEOUT_MS = 5000;

class ApiError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function buildApiUrl(endpoint) {
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  return `${API_ORIGIN}${API_PREFIX}${normalizedEndpoint}`;
}

async function waitForAuthenticatedUser() {
  const auth = getAuth();

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

async function getAuthHeaders() {
  const user = await waitForAuthenticatedUser();
  const token = await user.getIdToken();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

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

async function apiRequest(endpoint, options = {}) {
  const headers = await getAuthHeaders();
  const url = buildApiUrl(endpoint);

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
    cache: options.cache || "no-store",
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

export async function getMyDrafts(page = 1, limit = 10) {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  return apiRequest(`/articles/user/drafts?${query.toString()}`, {
    method: "GET",
  });
}