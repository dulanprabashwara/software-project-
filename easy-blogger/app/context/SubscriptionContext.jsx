"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const SubscriptionContext = createContext();

export function SubscriptionProvider({ children }) {
  const { userProfile, loading: authLoading } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Sync premium status from backend profile
  useEffect(() => {
    if (authLoading) return;
    if (userProfile) {
      setIsPremium(!!userProfile.isPremium);
    }
    setIsLoading(false);
  }, [userProfile, authLoading]);

  return (
    <SubscriptionContext.Provider value={{ isPremium, isLoading }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}
