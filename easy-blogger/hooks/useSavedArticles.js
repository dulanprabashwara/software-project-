import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../app/context/AuthContext"; 
import { getSavedArticlesApi, getSavedListApi } from "../app/api/savedArticles.api"; 



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
  }, [user?.uid]);

  //wait until the user is loadeed
  useEffect(() => {
    if (profileLoading) return;
    fetchSavedArticles();
  }, [profileLoading, fetchSavedArticles]);

   return { 
    savedArticles, 
    isLoading, 
   };
}


export function useSavedList() {
  const { user, profileLoading } = useAuth();
  const [savedList, setSavedList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSavedList = useCallback(async () => {
    if (!user) {
      setSavedList([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const token = await user.getIdToken();
      
      // FIX 1: Use the correct API function
      const data = await getSavedListApi(token); 
      setSavedList(data);
    } catch (error) {
      console.error("Hook Error:", error.message);
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (profileLoading) return;
    fetchSavedList();
  }, [profileLoading, fetchSavedList]);

  return { 
    savedList, // FIX 2: Return the correct state variable
    isLoading, 
  };
}