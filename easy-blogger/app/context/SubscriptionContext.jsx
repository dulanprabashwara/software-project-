"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const SubscriptionContext = createContext();

export function SubscriptionProvider({ children }) {
  const { userProfile, loading: authLoading, profileLoading } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Wait for both authLoad and profileLoad
  useEffect(() => {
    if (authLoading || profileLoading) return;

    if (userProfile) {
      setIsPremium(!!userProfile.isPremium);
    } else {
      setIsPremium(false);
    }
    setIsLoading(false);
  }, [userProfile, authLoading, profileLoading]);

  return (
    <SubscriptionContext.Provider value={{ isPremium, isLoading }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}