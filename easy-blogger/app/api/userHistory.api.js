const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getReadHistoryApi = async (token) => {
  const res = await fetch(`${API_URL}/api/readHistory`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Failed to fetch read history");
  return json.data || [];
};

export const getPublishedArticlesApi = async (token) => {
  const res = await fetch(`${API_URL}/api/publishedArticles`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Failed to fetch published articles");
  return json.data || [];
};