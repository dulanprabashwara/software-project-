export const getFollowingFeedApi = async (page = 1, token = null) => { 
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // CHANGED: Point to the '/following' endpoint instead of '/main'
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/homefeed/following?page=${page}`, { headers });
  
  // CHANGED: Updated error message to reflect the correct feed
  if (!res.ok) throw new Error("Failed to fetch following feed");
  
  const data = await res.json();
  return Array.isArray(data) ? data : data.articles || [];
};