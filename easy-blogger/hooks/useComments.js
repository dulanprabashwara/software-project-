import { useState, useEffect } from "react";
 import { api } from "../lib/api"

export const useComments = (articleId, token) => {
  //for comment and rating submissions
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0); 

  //get article comments
  const fetchComments = async () => {
    try {
      const data = await api.getArticleComments(articleId);
      setComments(data);
    } catch (err) {
      console.error("Hook Error:", err.message);
    } finally {
      setLoading(false);
    }
  };
//run when article loads
  useEffect(() => {
    if (articleId) fetchComments();
  }, [articleId]);

  const addComment = async (content, parentId = null) => {
    if (!token) return false;
    try {
      await api.addComment({articleId, content, parentId}, token);
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
      await api.rateArticle(articleId, num, token);
      setRating(num); 
      return true;
    } catch (err) {
      console.error("Hook Error:", err.message);
      return false;
    }
  };

  return { comments, loading, rating, addComment, submitRating };
};