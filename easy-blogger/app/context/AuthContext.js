"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
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
  const [profileLoading, setProfileLoading] = useState(true);

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

  const hasSynced = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser ?? null);

      if (!firebaseUser) {
        // User logged out — clear everything and reset the sync flag
        setUserProfile(null);
        setIsAdmin(false);
        setLoading(false);
        setProfileLoading(false);
        hasSynced.current = false;
        return;
      }

      // Firebase confirmed the user — unlock the UI immediately.
      setLoading(false);

      // If we already synced this session, skip backend call to avoid rate limits.
      // hasSynced is a ref — always up-to-date inside closures, no stale value issue.
      if (hasSynced.current) {
        setProfileLoading(false);
        return;
      }

      // First time login: sync with backend to get role and full profile.
      setProfileLoading(true);
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
          hasSynced.current = true;
        }
      } catch (error) {
        console.error("Failed to sync user with backend database:", error);
      } finally {
        setProfileLoading(false);
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
        profileLoading,
        logout,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
