const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getTrendingTitlesApi = async () => {
  const response = await fetch(`${API_URL}/api/trendingArticles/trendingTitles`);
  if (!response.ok) throw new Error("Failed to fetch trending titles");
  const data = await response.json();
  return Array.isArray(data) ? data : data.trending || [];
};

export const getTrendingArticlesApi = async () => {
  const response = await fetch(`${API_URL}/api/trendingArticles/trendingArticles`);
  if (!response.ok) throw new Error("Failed to fetch trending articles");
  const data = await response.json();
  return Array.isArray(data) ? data : data.trending || [];
};