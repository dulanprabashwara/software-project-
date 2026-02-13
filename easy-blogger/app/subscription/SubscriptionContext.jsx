"use client";

import { createContext, useContext, useState, useEffect } from "react";

const SubscriptionContext = createContext({
  isPremium: false,
  togglePremium: () => {},
});

export function SubscriptionProvider({ children }) {
  // Initialize with false, but verify with localStorage if available
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    // Check localStorage on mount
    const savedPremium = localStorage.getItem("isPremium");
    if (savedPremium) {
      setIsPremium(savedPremium === "true");
    }
  }, []);

  const togglePremium = () => {
    setIsPremium((prev) => {
      const newState = !prev;
      localStorage.setItem("isPremium", String(newState));
      return newState;
    });
  };

  return (
    <SubscriptionContext.Provider value={{ isPremium, togglePremium }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider",
    );
  }
  return context;
}
