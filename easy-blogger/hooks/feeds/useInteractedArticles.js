import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../app/context/AuthContext"; 
 import { api } from "../../lib/api"

 //get interacted articles as a whole
export function useInteractedArticles() {
  const { user, profileLoading } = useAuth();
  const [interactedArticles, setInteractedArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInteractedArticles = useCallback(async () => {
    if (!user) {
      setInteractedArticles([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const token = await user.getIdToken();
      const data = await api.getInteractedArticles(token);
      setInteractedArticles(data);
    } catch (error) {
      console.error("Hook Error:", error.message);
    } finally {
      setIsLoading(false);
    }
  }, [user]); 

  useEffect(() => {
    if (profileLoading) return;
    fetchInteractedArticles();
  }, [profileLoading, fetchInteractedArticles]);

  return { interactedArticles, isLoading, refetch: fetchInteractedArticles };
}


//get the id list of interacted articles
  export function useInteractedList() {
  const { user, profileLoading } = useAuth();
  const [interactedList, setInteractedList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInteractedList = useCallback(async () => {
    if (!user) {
      setInteractedList([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const token = await user.getIdToken();
      
      // FIX 1: Use the correct API function
      const list = await api.getInteractedList(token); 
      const data=list.data;
      setInteractedList(data);
    } catch (error) {
      console.error("Hook Error:", error.message);
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (profileLoading) return;
    fetchInteractedList();
  }, [profileLoading, fetchInteractedList]);

  return { 
    interactedList, // FIX 2: Return the correct state variable
    isLoading, 
  };
}
