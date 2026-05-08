/**
 * aiApi.js — AI Article Generator API calls
 * Every function that touches a protected endpoint accepts a `getHeaders`
 * async function as its first argument (provided by the page via getAuthHeaders).
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Sends the user's raw prompt to the backend for topic + keyword extraction.
 * Returns { sessionId, topic, keywords, hasArticleLengthInPrompt, hasToneInPrompt }.
 */
export const analyzePrompt = async (getHeaders, userInput) => {
  const headers = await getHeaders();
  const res     = await fetch(`${BACKEND_URL}/api/ai/analyze`, {
    method: "POST", headers,
    body: JSON.stringify({ userInput }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || `Server error: ${res.status}`);
  return data;
};

/**
 * Generates a new AI article from the given settings.
 * Returns { article: { title, content, wordCount, logId } }.
 */
export const generateArticle = async (getHeaders, payload) => {
  const headers = await getHeaders();
  const res     = await fetch(`${BACKEND_URL}/api/ai/generate`, {
    method: "POST", headers,
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || `Server error: ${res.status}`);
  return data.article;
};

/**
 * Regenerates a fresh version of the article using the same settings.
 * Returns { article: { title, content, wordCount, logId } }.
 */
export const regenerateArticle = async (getHeaders, payload) => {
  const headers = await getHeaders();
  const res     = await fetch(`${BACKEND_URL}/api/ai/regenerate`, {
    method: "POST", headers,
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || `Server error: ${res.status}`);
  return data.article;
};

/**
 * Saves the AI-generated article as a DRAFT in the articles table.
 * Returns { alreadySaved, message, draft }.
 */
export const saveDraft = async (getHeaders, logId) => {
  const headers = await getHeaders();
  const res     = await fetch(`${BACKEND_URL}/api/ai/save-draft`, {
    method: "POST", headers,
    body: JSON.stringify({ logId }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || `Server error: ${res.status}`);
  return data;
};

/**
 * Loads the AI article into the TinyMCE editor (sets status = EDITING).
 * Returns { articleId }.
 */
export const loadToEditor = async (getHeaders, logId) => {
  const headers = await getHeaders();
  const res     = await fetch(`${BACKEND_URL}/api/ai/load-to-editor`, {
    method: "POST", headers,
    body: JSON.stringify({ logId }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || `Server error: ${res.status}`);
  return data;
};

 // Returns the user's list of AI-generated article logs (unsaved drafts). 
 
export const getArticleLogs = async (getHeaders) => {
  const headers = await getHeaders();
  const res     = await fetch(`${BACKEND_URL}/api/ai/logs`, { headers });
  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  const data = await res.json();
  if (!data.success) throw new Error("Failed to fetch article logs");
  return data.logs;
};

 //Soft-deletes an AI article log. It can be restored within 1 hour. 

export const deleteLog = async (getHeaders, logId) => {
  const headers = await getHeaders();
  await fetch(`${BACKEND_URL}/api/ai/logs/${logId}`, { method: "DELETE", headers });
};

 // Restores a soft-deleted log within the 1-hour restore window. 

export const restoreLog = async (getHeaders, logId) => {
  const headers = await getHeaders();
  const res     = await fetch(`${BACKEND_URL}/api/ai/logs/${logId}/restore`, {
    method: "POST", headers,
  });
  if (!res.ok) throw new Error("Restore failed");
};

/**
 * Sets or toggles the user's like/dislike reaction on an article log.
 * Returns the new userResponse value (null or "satisfied" or "dissatisfied").
 */
export const setUserResponse = async (getHeaders, logId, response) => {
  const headers = await getHeaders();
  const res     = await fetch(`${BACKEND_URL}/api/ai/logs/${logId}/response`, {
    method: "PATCH", headers,
    body: JSON.stringify({ response }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error("Response update failed");
  return data.userResponse;
};

// Returns top AI-assisted articles for the Insights sidebar. 

export const getTopAIArticles = async (getHeaders) => {
  const headers = await getHeaders();
  const res     = await fetch(`${BACKEND_URL}/api/ai/top-ai-articles`, { headers });
  const data    = await res.json();
  if (!data.success) throw new Error("Failed to fetch top AI articles");
  return data.articles;
};


// Returns trending keyword topics for the Insights sidebar.

export const getTrendingKeywords = async (getHeaders) => {
  const headers = await getHeaders();
  const res     = await fetch(`${BACKEND_URL}/api/ai/trending-keywords`, { headers });
  const data    = await res.json();
  if (!data.success) throw new Error("Failed to fetch trending keywords");
  return data.keywords ?? [];
};


//Returns all published articles sorted by trendingScore (for the slider).

export const getTrendingArticles = async () => {
  const res  = await fetch(`${BACKEND_URL}/api/trendingArticles/trendingArticles`);
  const data = await res.json();
  return Array.isArray(data) ? data : data.articles || data.trending || [];
};
