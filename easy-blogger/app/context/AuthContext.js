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

/**
  provide the user's firebase auth and profile data to other components in the application
  listens to Firebase state changes and conditionally fetches the Postgres profile
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  // loading = true only until Firebase confirms auth state
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [bannedReason, setBannedReason] = useState(null);

  /**
   updates the profile without requiring a full network refetch.
   */
  const updateProfile = useCallback((data) => {
    setUserProfile((prev) => (prev ? { ...prev, ...data } : prev));
  }, []);

  /**
 re-fetches the user's Postgres profile using their current Firebase token.
   */
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

  /**
    When Firebase auth state changes 
  capture the `getIdToken()` and pass it to the backend `/sync` endpoint to fetch the matching Postgres data. .
   */
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

      // Firebase confirmed the user — unlock the UI immediately
      setLoading(false);

      // If we already synced this session skip backend call to avoid rate limits.
      if (hasSynced.current) {
        setProfileLoading(false);
        return;
      }

      // First time login or sign up: sync with backend to get role and full profile.
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
        //Check if this is a ban error (403). If so sign the user out of Firebase
        const statusCode = error?.response?.status || error?.status;
        const message = error?.response?.data?.message || error?.message || "";
        if (statusCode === 403 || message.toLowerCase().includes("suspend")) {
          setBannedReason(
            message ||
              "Your account has been suspended. Please contact support.",
          );
          await signOut(auth);
          setLoading(false);
          setProfileLoading(false);
          return;
        }

        console.error("Failed to sync user with backend database:", error);
        // try fetching the existing profile via getMe when sync fails
        try {
          const token = await firebaseUser.getIdToken();
          const res = await api.getMe(token);
          if (res.success && res.data) {
            setUserProfile(res.data);
            setIsAdmin(res.data.role === "ADMIN");
            hasSynced.current = true;
            return;
          }
        } catch (getmeError) {
          console.error("getMe fallback also failed:", getmeError);
        }
        // build a minimal profile from Firebase so the UI is never stuck
        setUserProfile({
          id: null,
          email: firebaseUser.email,
          displayName:
            firebaseUser.displayName ||
            firebaseUser.email?.split("@")[0] ||
            "User",
          avatarUrl: firebaseUser.photoURL || null,
          username: firebaseUser.email?.split("@")[0] || "",
          bio: "",
          role: "USER",
          isPremium: false,
        });
        hasSynced.current = true;
      } finally {
        setProfileLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  /**
  Resets the bannedReason state so the popup can be dismissed.
   */
  const clearBan = useCallback(() => setBannedReason(null), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isAdmin,
        loading,
        profileLoading,
        bannedReason,
        clearBan,
        logout,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
