"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { api } from "../../lib/api";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  // loading = true only until Firebase confirms auth state (fast, ~50ms from cache).
  // userProfile fills in separately after the backend syncUser call completes.
  const [loading, setLoading] = useState(true);

  const updateProfile = useCallback((data) => {
    setUserProfile((prev) => (prev ? { ...prev, ...data } : prev));
  }, []);

  const refreshProfile = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    try {
      const token = await currentUser.getIdToken();
      const res = await api.getMe(token);
      if (res.success && res.data) {
        setUserProfile(res.data);
        setIsAdmin(res.data.role === "ADMIN");
        return res.data;
      }
    } catch (error) {
      console.error("Failed to refresh profile:", error);
    }
    return null;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser ?? null);

      if (!firebaseUser) {
        setUserProfile(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Firebase confirmed the user — unlock the UI immediately.
      // Pages can render as soon as loading = false.
      setLoading(false);

      // Sync with backend in the background (non-blocking for the UI).
      try {
        const token = await firebaseUser.getIdToken();
        const res = await api.syncUser(
          {
            email: firebaseUser.email,
            displayName:
              firebaseUser.displayName || firebaseUser.email.split("@")[0],
            photoURL: firebaseUser.photoURL,
          },
          token,
        );
        if (res.success && res.data) {
          setUserProfile(res.data);
          setIsAdmin(res.data.role === "ADMIN");
        }
      } catch (error) {
        console.error("Failed to sync user with backend database:", error);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isAdmin,
        loading,
        logout,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
