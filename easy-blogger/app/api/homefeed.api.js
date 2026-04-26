const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getMainFeedApi = async (token = null) => {
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}/api/homefeed/main`, { headers });
  if (!res.ok) throw new Error("Failed to fetch main feed");
  
  const data = await res.json();
  return Array.isArray(data) ? data : data.articles || [];
};