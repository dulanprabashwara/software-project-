import { useState, useEffect } from "react";

export const useComments = (articleId, token) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0); // This keeps stars colored

  const fetchComments = async () => {
    try {
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comments/${articleId}`);      
const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (articleId) fetchComments();
  }, [articleId]);

  const addComment = async (content, parentId = null) => {
    if (!token) return false;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ articleId, content, parentId }),
      });
      if (res.ok) {
        await fetchComments();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const submitRating = async (num) => { // 'num' is defined here
    if (!token) return false;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comments/${articleId}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ rating: num }), // 'num' is used here
      });

      if (res.ok) {
        setRating(num); // Update local state to keep stars colored
        return true;
      }
    } catch (err) {
      console.error("Rating Error:", err);
    }
    return false;
  };

  return { comments, loading, rating, addComment, submitRating };
};