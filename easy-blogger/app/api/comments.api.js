const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getArticleCommentsApi = async (articleId) => {
  const res = await fetch(`${API_URL}/api/comments/${articleId}`);
  if (!res.ok) throw new Error("Failed to fetch comments");
  return await res.json();
};

export const addCommentApi = async (articleId, content, parentId, token) => {
console.log("reavhed here");
  const res = await fetch(`${API_URL}/api/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ articleId, content, parentId }),
  });
  if (!res.ok) throw new Error("Failed to post comment");
  return await res.json();
};

export const rateArticleApi = async (articleId, rating, token) => {
  const res = await fetch(`${API_URL}/api/comments/${articleId}/rate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ rating }), 
  });
  if (!res.ok) throw new Error("Failed to submit rating");
  return await res.json();
};