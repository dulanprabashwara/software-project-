const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getPopularTagsApi = async (limit = 10) => {
  const res = await fetch(`${API_URL}/api/popularTopics?limit=${limit}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Failed to fetch popular tags");
  return json.data || [];
};