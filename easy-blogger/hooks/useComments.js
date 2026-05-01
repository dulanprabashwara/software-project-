import { useState, useEffect } from "react";
import { getArticleCommentsApi, addCommentApi, rateArticleApi } from "../app/api/comments.api";

export const useComments = (articleId, token) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0); 

  const fetchComments = async () => {
    try {
      const data = await getArticleCommentsApi(articleId);
      setComments(data);
    } catch (err) {
      console.error("Hook Error:", err.message);
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
      await addCommentApi(articleId, content, parentId, token);
      await fetchComments(); // Refresh list automatically
      return true;
    } catch (err) {
      console.error("Hook Error:", err.message);
      return false;
    }
  };

  const submitRating = async (num) => { 
    if (!token) return false;
    try {
      await rateArticleApi(articleId, num, token);
      setRating(num); 
      return true;
    } catch (err) {
      console.error("Hook Error:", err.message);
      return false;
    }
  };

  return { comments, loading, rating, addComment, submitRating };
};