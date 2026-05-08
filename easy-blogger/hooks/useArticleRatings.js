//get ratings of a certain article of a ceratin user
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../app/context/AuthContext"; 
 import { api } from "../lib/api"

export function useArticleRatings(articleId) {
  //for loading and setting ratings
  const { user, profileLoading } = useAuth();
  const [articleRatings, setArticleRatings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchArticleRatings = useCallback(async () => {
    if (!user) {
      setArticleRatings([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const token = await user.getIdToken(); //userId 
      const data = await api.getArticleRatings(articleId,token); //article ID
      setArticleRatings(data);
    } catch (error) {
      console.error("Hook Error:", error.message);
    } finally {
      setIsLoading(false);
    }
  }, [user]); 

  useEffect(() => {
    if (profileLoading) return;
    fetchArticleRatings();
  }, [profileLoading, fetchArticleRatings]);

  return { articleRatings, isLoading, refetch: fetchArticleRatings };
}