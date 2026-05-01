
export const getMainFeedApi = async (page = 1, token = null) => { 
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/homefeed/main?page=${page}`, { headers });
  
  if (!res.ok) throw new Error("Failed to fetch main feed");
  
  const data = await res.json();
  return Array.isArray(data) ? data : data.articles || [];
};