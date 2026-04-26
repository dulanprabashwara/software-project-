import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/app/context/AuthContext"; 
import { getReadHistoryApi } from "../app/api/userHistory.api";

export function useReadHistory() {
  const { user, profileLoading } = useAuth();
  const [readHistory, setReadHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReadHistory = useCallback(async () => {
    if (!user) {
      setReadHistory([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const token = await user.getIdToken();
      const data = await getReadHistoryApi(token);
      setReadHistory(data);
    } catch (error) {
      console.error("Hook Error:", error.message);
    } finally {
      setIsLoading(false);
    }
  }, [user]); 

  useEffect(() => {
    if (profileLoading) return;
    fetchReadHistory();
  }, [profileLoading, fetchReadHistory]);

  return { readHistory, isLoading, refetch: fetchReadHistory };
}