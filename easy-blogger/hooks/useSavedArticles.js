import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../app/context/AuthContext"; 
import { getSavedArticlesApi } from "../app/api/savedArticles.api"; 



export function useSavedArticles() {
  const { user, profileLoading } = useAuth(); //get user object
  const [savedArticles, setSavedArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  //get the saved articles
  const fetchSavedArticles = useCallback(async () => {
    if (!user) {
      setSavedArticles([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const token = await user.getIdToken();
      
      // Call the function to get the saved articles
      const data = await getSavedArticlesApi(token);
      setSavedArticles(data);
    } catch (error) {
      console.error("Hook Error:", error.message); //get the error 
     } finally {
      setIsLoading(false); //stop loading whatever happens
    }
  }, [user]);

  useEffect(() => {
    if (profileLoading) return;
    fetchSavedArticles();
  }, [profileLoading, fetchSavedArticles]);

  return { 
    savedArticles, 
    isLoading, 
   };
}