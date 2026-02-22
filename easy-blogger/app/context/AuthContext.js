"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { api } from "../../lib/api";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null); // The backend PostgreSQL profile
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // 1. Instantly update Firebase state
      setUser(firebaseUser ?? null);

      // 2. Fetch Backend Database Profile (for Roles, Premium status, etc.)
      if (firebaseUser) {
        setLoading(true); // <--- CRITICAL FIX: Ensure loading is true while we fetch the backend profile
        firebaseUser.getIdToken().then((token) => {
          api
            .syncUser(
              {
                email: firebaseUser.email,
                displayName:
                  firebaseUser.displayName || firebaseUser.email.split("@")[0],
                photoURL: firebaseUser.photoURL,
              },
              token,
            )
            .then(async (res) => {
              // syncUser already returns the full user profile including their role
              if (res.success && res.data) {
                setUserProfile(res.data);
                setIsAdmin(res.data.role === "ADMIN");
              }
            })
            .catch((error) => {
              console.error(
                "Failed to sync user with backend database:",
                error,
              );
            })
            .finally(() => {
              // Always unlock the UI once the backend finishes loading
              setLoading(false);
            });
        });
      } else {
        setUserProfile(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{ user, userProfile, isAdmin, loading, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
