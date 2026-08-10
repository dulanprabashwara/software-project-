import { useState, useEffect } from "react";
import { useAuth } from "../app/context/AuthContext";
import { api } from "../lib/api";

export const useComments = (articleId) => {
  const { user } = useAuth();
  
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0); 

  // Helper to dynamically grab a fresh token
  const getToken = async () => {
    return user ? await user.getIdToken() : null;
  };

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

  useEffect(() => {
    if (articleId) fetchComments();
  }, [articleId]);

  const addComment = async (content, parentId = null) => {
    const token = await getToken();
    if (!token) return false;
    
    try {
      await api.addComment({articleId, content, parentId}, token);
      await fetchComments(); 
      return true;
    } catch (err) {
      console.error("Hook Error:", err.message);
      return false;
    }
  };

  const deleteComment = async (commentId) => {
    const token = await getToken();
    if (!token) return false;
    
    try {
      await api.deleteComment(commentId, token);
      
      // Instantly update UI without an extra network request
      setComments(prevComments => prevComments.filter(c => c.id !== commentId));
      return true;
    } catch (err) {
      console.error("Hook Error:", err.message);
      return false;
    }
  };

  const submitRating = async (num) => { 
    const token = await getToken();
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

  return { comments, loading, rating, addComment, deleteComment, submitRating };
};