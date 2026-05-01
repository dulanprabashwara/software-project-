const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getInteractedArticlesApi = async (token) => {
  const res = await fetch(`${API_URL}/api/interactedArticles`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Failed to fetch interacted articles");
  return json.data || [];
};

export const getArticleRatingsApi = async (token) => {
  const res = await fetch(`${API_URL}/api/articleRatings`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Failed to fetch article ratings");
  return json.data || [];
};