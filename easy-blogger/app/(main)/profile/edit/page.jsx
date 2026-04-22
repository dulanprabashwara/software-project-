"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Camera,
  Lock,
  Mail,
  Crown,
  AlertTriangle,
  Linkedin,
  Globe,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";

import { useSubscription } from "../../../context/SubscriptionContext";
import { useAuth } from "../../../context/AuthContext";
import { api, API_BASE_URL } from "../../../../lib/api"; // WordPress OAuth needs API_BASE_URL

export default function EditProfilePage() {
  const router = useRouter();
  // Use global subscription context
  const { isPremium, togglePremium } = useSubscription();
  const {
    user: firebaseUser,
    userProfile,
    loading,
    profileLoading,
    updateProfile: updateContextProfile,
  } = useAuth();

  // Firebase data is available almost instantly as the immediate fallback so the form renders with real data

  const [displayName, setDisplayName] = useState(
    userProfile?.displayName || firebaseUser?.displayName || "",
  );
  const [username, setUsername] = useState(userProfile?.username || "");
  const [email] = useState(firebaseUser?.email || userProfile?.email || "");
  const [about, setAbout] = useState(userProfile?.bio || "");
  const [profilePhoto, setProfilePhoto] = useState(
    userProfile?.avatarUrl ||
      firebaseUser?.photoURL ||
      "/api/placeholder/120/120",
  );

  //Track if we've populated the form from the backend yet so we don't
  // overwrite user edits if the context updates.
  const [hasInitializedForm, setHasInitializedForm] = useState(false);

  const [weeklyDigestEnabled, setWeeklyDigestEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [linkedInConnected, setLinkedInConnected] = useState(false);
  const [wordpressConnected, setWordpressConnected] = useState(false);
  // WordPress connection state
  const [wpUsername, setWpUsername] = useState("");
  const [wpSiteUrl, setWpSiteUrl] = useState("");
  const [wpError, setWpError] = useState("");
  const [wpLoading, setWpLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Password change state
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // fill the form as soon as userProfile arrives
  useEffect(() => {
    if (userProfile && !hasInitializedForm) {
      setDisplayName(
        userProfile.displayName || firebaseUser?.displayName || "",
      );
      setUsername(userProfile.username || "");
      setAbout(userProfile.bio || "");
      if (userProfile.avatarUrl) setProfilePhoto(userProfile.avatarUrl);
      setHasInitializedForm(true);
    }
  }, [userProfile, hasInitializedForm, firebaseUser]);

  // Redirect to login if user is definitively not authenticated.
  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push("/login");
    }
  }, [loading, firebaseUser, router]);

  // Fetch WordPress connection status on load
  useEffect(() => {
    if (!firebaseUser) return;

    const checkWpConnection = async () => {
      try {
        const token = await firebaseUser.getIdToken();
        const res = await fetch(`${API_BASE_URL}/api/wordpress/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data?.data?.connected) {
          setWordpressConnected(true);
          setWpUsername(data.data.wpUsername || "");
          setWpSiteUrl(data.data.siteUrl || "");
        }
      } catch {
        // non-critical: silently ignore, UI defaults to disconnected
      }
    };

    checkWpConnection();
  }, [firebaseUser]);

  // Reads ?wp_status query param set by the OAuth callback redirect
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const wpStatus = params.get("wp_status");
    if (!wpStatus) return;

    if (wpStatus === "connected") {
      setWordpressConnected(true);
      setWpUsername(params.get("wp_username") || "");
      setWpSiteUrl(params.get("wp_site") || "");
      setWpError("");
    } else if (wpStatus === "error") {
      setWpError(
        params.get("wp_message") ||
          "WordPress connection failed. Please try again.",
      );
    }

    // clean wp_* params from the URL bar without reloading
    const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete("wp_status");
    cleanUrl.searchParams.delete("wp_username");
    cleanUrl.searchParams.delete("wp_site");
    cleanUrl.searchParams.delete("wp_message");
    window.history.replaceState({}, "", cleanUrl.toString());
  }, []);

  // Detect if the user signed in via Google
  const isGoogleUser =
    firebaseUser?.providerData?.some((p) => p.providerId === "google.com") &&
    !firebaseUser?.providerData?.some((p) => p.providerId === "password");

  //when user click profile picture get that and convert to a string and sets to profilePhoto
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  //when click save changes get them and send to the backend
  const handleSaveChanges = async () => {
    if (!firebaseUser) return;
    setIsSaving(true);
    try {
      const token = await firebaseUser.getIdToken();

      const newAvatarUrl = profilePhoto.startsWith("data:")
        ? profilePhoto
        : undefined;

      const updateData = {
        displayName,
        bio: about,
        avatarUrl: newAvatarUrl,
      };

      await api.updateProfile(updateData, token);

      // Update Firebase Auth Profile (displayName only)

      if (displayName !== firebaseUser.displayName) {
        const { updateProfile: updateFirebaseAuthProfile } =
          await import("firebase/auth");
        await updateFirebaseAuthProfile(firebaseUser, {
          displayName: displayName,
        });
      }

      //Update AuthContext with the saved data
      updateContextProfile({
        displayName,
        bio: about,
        ...(newAvatarUrl && { avatarUrl: newAvatarUrl }),
      });

      router.push("/profile");
    } catch (err) {
      console.error("Failed to update profile", err);
      alert("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  //clear password states when toggle change password
  const handleChangePassword = () => {
    setShowPasswordChange(!showPasswordChange);
    setPasswordError("");
    setPasswordSuccess(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleUpdatePassword = async () => {
    setPasswordError("");
    setPasswordSuccess(false);

    // chekck if all feilds are filled
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }
    //check if newpassword and confirmpassword match
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    //check new password length is less than 8
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    //check if new password and old password are same
    if (newPassword === currentPassword) {
      setPasswordError(
        "New password must be different from your current password.",
      );
      return;
    }
    //check if the user is logeed in
    if (!firebaseUser || !firebaseUser.email) return;

    setIsUpdatingPassword(true);
    try {
      const {
        EmailAuthProvider,
        reauthenticateWithCredential,
        updatePassword,
      } = await import("firebase/auth");

      // get the user email and entered current password
      const credential = EmailAuthProvider.credential(
        firebaseUser.email,
        currentPassword,
      );
      //reauthenticate the user with the entered credentials
      await reauthenticateWithCredential(firebaseUser, credential);

      // Now update the password
      await updatePassword(firebaseUser, newPassword);

      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      // Auto-collapse the form after 2 seconds
      setTimeout(() => {
        setShowPasswordChange(false);
        setPasswordSuccess(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to update password:", err);
      //define the password error
      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-mismatch"
      ) {
        setPasswordError("The current password you entered is incorrect.");
      } else if (err.code === "auth/weak-password") {
        setPasswordError(
          "The new password is too weak. Please choose a stronger one.",
        );
      } else if (err.code === "auth/requires-recent-login") {
        setPasswordError(
          "Session expired. Please log out and log back in, then try again.",
        );
      } else if (err.code === "auth/too-many-requests") {
        setPasswordError(
          "Too many attempts. Please wait a few minutes and try again.",
        );
      } else {
        setPasswordError(err.message || "An error occurred. Please try again.");
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  //clear the useStates when click cancel password button
  const handleCancelPasswordChange = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswordChange(false);
  };

  //delete the user account
  const [isDeleting, setIsDeleting] = useState(false);
  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Are you sure you want to delete your account? This action cannot be undone. All your articles, comments, and data will be permanently removed.",
      )
    ) {
      return;
    }

    if (!firebaseUser) return;
    setIsDeleting(true);

    try {
      const token = await firebaseUser.getIdToken();

      // Call backend — deletes DB rows + Firebase Auth account via Admin SDK
      await api.deleteAccount(token);

      // Redirect to landing page
      router.push("/");
    } catch (err) {
      console.error("Failed to delete account:", err);
      alert("Failed to delete account. Please try again or contact support.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLinkedInToggle = () => {
    if (linkedInConnected) {
      if (confirm("Do you want to disconnect from LinkedIn?")) {
        setLinkedInConnected(false);
      }
    } else {
      setLinkedInConnected(true);
    }
  };

  // Connects or disconnects WordPress via OAuth
  const handleWordPressToggle = async () => {
    if (!firebaseUser) return;

    if (wordpressConnected) {
      // disconnect
      if (!confirm("Do you want to disconnect from WordPress?")) return;
      setWpLoading(true);
      setWpError("");
      try {
        const token = await firebaseUser.getIdToken();
        const res = await fetch(`${API_BASE_URL}/api/wordpress/disconnect`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Disconnect request failed.");
        }
        setWordpressConnected(false);
        setWpUsername("");
        setWpSiteUrl("");
      } catch (err) {
        setWpError(
          err.message || "Failed to disconnect WordPress. Please try again.",
        );
      } finally {
        setWpLoading(false);
      }
    } else {
      // redirect to WordPress.com; callback handles the response
      setWpLoading(true);
      setWpError("");
      try {
        const token = await firebaseUser.getIdToken();
        const res = await fetch(`${API_BASE_URL}/api/wordpress/auth`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok || !data?.data?.authUrl) {
          throw new Error(
            data?.message || "Could not get WordPress authorization URL.",
          );
        }
        window.location.href = data.data.authUrl;
        // page navigates away; state resets on remount if user cancels
      } catch (err) {
        setWpError(
          err.message ||
            "Failed to initiate WordPress connection. Please try again.",
        );
        setWpLoading(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      {/* Header with Save and Cancel Buttons */}
      <div className="flex items-center justify-between mb-8">
        <h1
          className="text-3xl font-bold text-[#111827]"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Edit Profile
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/profile")}
            className="px-6 py-2.5 bg-white hover:bg-[#F9FAFB] border border-[#E5E7EB] text-[#374151] rounded-full text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="px-6 py-2.5 bg-[#1ABC9C] hover:bg-[#17a589] text-white rounded-full text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Profile Information Card */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 mb-6">
        <div className="flex gap-8">
          {/* Profile Photo */}
          <div className="shrink-0">
            <div className="relative">
              <div
                className={`w-32 h-32 rounded-full overflow-hidden border-4 shadow-lg ${
                  isPremium ? "border-[#F59E0B]" : "border-white"
                } ${profileLoading && !userProfile ? "bg-gray-200 animate-pulse" : "bg-[#F3F4F6]"}`}
              >
                {!(profileLoading && !userProfile) && (
                  <img
                    src={profilePhoto}
                    alt="Profile"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={profileLoading && !userProfile}
                className="absolute bottom-0 right-0 w-10 h-10 bg-[#1ABC9C] hover:bg-[#17a589] rounded-full flex items-center justify-center shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Camera className="w-5 h-5 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              {/* Verified Badge for Premium - Fixed overlap */}
              {isPremium && (
                <div className="absolute top-0 right-0 drop-shadow-md">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22.5 12.5L20.1 15.3L20.4 19L16.8 19.8L14.9 23L11.5 21.6L8.1 23L6.2 19.8L2.6 19L2.9 15.3L0.5 12.5L2.9 9.7L2.6 6L6.2 5.2L8.1 2L11.5 3.4L14.9 2L16.8 5.2L20.4 6L20.1 9.7L22.5 12.5Z"
                      fill="#1ABC9C"
                      stroke="white"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M7 12L10 15L16 9"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Profile Fields */}
          <div className="flex-1 space-y-6">
            {profileLoading && !userProfile ? (
              // Inline Form Skeletons for a smooth loading experience
              <div className="space-y-6 animate-pulse">
                <div>
                  <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                  <div className="h-12 w-full bg-gray-100 rounded-lg"></div>
                </div>
                <div>
                  <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
                  <div className="h-12 w-full bg-gray-100 rounded-lg"></div>
                </div>
                <div>
                  <div className="h-4 w-16 bg-gray-200 rounded mb-2"></div>
                  <div className="h-24 w-full bg-gray-100 rounded-lg"></div>
                </div>
              </div>
            ) : (
              <>
                {/* Display Name */}
                <div>
                  <label className="text-sm font-semibold text-[#374151] mb-2 flex items-center gap-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1ABC9C] focus:border-transparent"
                    placeholder="Enter your name"
                  />
                </div>

                {/* Username (Read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    readOnly
                    className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg text-[#6B7280] bg-[#F9FAFB] cursor-not-allowed"
                  />
                </div>

                {/* About/Bio */}
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-2">
                    About
                  </label>
                  <textarea
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    rows={4}
                    maxLength={200}
                    className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1ABC9C] focus:border-transparent resize-none"
                    placeholder="Tell us about yourself..."
                  />
                  <p className="text-xs text-[#6B7280] mt-1 text-right">
                    {about.length}/200
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Subscription Card - Conditional */}
      {profileLoading && !userProfile ? (
        <div className="bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] p-6 mb-6 animate-pulse h-[100px]"></div>
      ) : isPremium ? (
        /* Premium Member Card */
        <div className="bg-white rounded-xl border border-[#1ABC9C] p-6 mb-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-[#1ABC9C] to-transparent opacity-10 rounded-bl-full pointer-events-none"></div>

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#F59E0B] rounded-full flex items-center justify-center shadow-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3
                    className="text-lg font-bold text-[#111827]"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    You are a Premium Member
                  </h3>
                  <span className="px-2 py-0.5 bg-[#FEF3C7] text-[#D97706] text-[10px] font-bold uppercase tracking-wider rounded-full">
                    PREMIUM
                  </span>
                </div>
                <p className="text-sm text-[#6B7280]">
                  Your subscription is currently active.
                </p>
              </div>
            </div>
            <Link
              href="/subscription/manage"
              className="px-6 py-2.5 bg-[#111827] hover:bg-[#374151] text-white rounded-full text-sm font-medium transition-colors whitespace-nowrap ml-4"
            >
              Manage Subscription
            </Link>
          </div>
        </div>
      ) : (
        /* Free Tier Upgrade Card */
        <div className="bg-linear-to-r from-[#EFF6FF] to-[#DBEAFE] rounded-xl border border-[#BFDBFE] p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-linear-to-br from-[#FBBF24] to-[#F59E0B] rounded-full flex items-center justify-center shadow-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#111827] mb-1">
                  Upgrade to Premium
                </h3>
                <p className="text-sm text-[#6B7280]">
                  Get unlimited stories, advanced analytics, exclusive AI
                  writing tools, and expert support starting today.
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/subscription/upgrade")}
              className="px-6 py-2.5 bg-[#1ABC9C] hover:bg-[#17a589] text-white rounded-full text-sm font-medium transition-colors whitespace-nowrap ml-4"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}

      {/* Account Settings Card */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 mb-6">
        <h2 className="text-xl font-bold text-[#111827] mb-6">
          Account Settings
        </h2>

        {/* Change Password */}
        <div className="pb-6 mb-6 border-b border-[#E5E7EB]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-[#F3F4F6] rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#6B7280]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#111827] mb-1">
                  Change Password
                </h3>
                <p className="text-sm text-[#6B7280]">
                  Update your password to keep your account secure
                </p>
              </div>
            </div>
            <button
              onClick={handleChangePassword}
              className="px-5 py-2 border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#374151] rounded-lg text-sm font-medium transition-colors"
            >
              {showPasswordChange ? "Hide" : "Change Password"}
            </button>
          </div>

          {/* Expandable Password Change Form */}
          {showPasswordChange && (
            <div className="mt-6 bg-[#F9FAFB] rounded-xl p-6 space-y-4 animate-in slide-in-from-top duration-200">
              {isGoogleUser ? (
                /* Google-only users cannot set a password */
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="w-5 h-5 text-blue-500 mt-0.5 shrink-0">
                    ℹ️
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Google Account
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Your account uses Google Sign-In. To change your password,
                      please visit your{" "}
                      <a
                        href="https://myaccount.google.com/security"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-medium"
                      >
                        Google Account settings
                      </a>
                      .
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Success Banner */}
                  {passwordSuccess && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                      <p className="text-sm text-green-700 font-medium">
                        Password updated successfully!
                      </p>
                    </div>
                  )}

                  {/* Error Banner */}
                  {passwordError && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-red-700">{passwordError}</p>
                    </div>
                  )}

                  {/* Current Password */}
                  <div className="relative">
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => {
                        setCurrentPassword(e.target.value);
                        setPasswordError("");
                      }}
                      placeholder="Current password"
                      className="w-full px-4 py-3 pr-11 border border-[#E5E7EB] rounded-lg text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-[#1ABC9C] focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"
                    >
                      {showCurrentPw ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* New Password */}
                  <div className="relative">
                    <input
                      type={showNewPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setPasswordError("");
                      }}
                      placeholder="New password (min. 8 characters)"
                      className="w-full px-4 py-3 pr-11 border border-[#E5E7EB] rounded-lg text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-[#1ABC9C] focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"
                    >
                      {showNewPw ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Confirm New Password */}
                  <div className="relative">
                    <input
                      type={showConfirmPw ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setPasswordError("");
                      }}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3 pr-11 border border-[#E5E7EB] rounded-lg text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-[#1ABC9C] focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"
                    >
                      {showConfirmPw ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleUpdatePassword}
                      disabled={isUpdatingPassword}
                      className="px-6 py-2.5 bg-[#111827] hover:bg-[#1F2937] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isUpdatingPassword ? (
                        <>
                          <svg
                            className="animate-spin w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8H4z"
                            />
                          </svg>
                          Updating...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </button>
                    <button
                      onClick={handleCancelPasswordChange}
                      disabled={isUpdatingPassword}
                      className="px-6 py-2.5 text-[#6B7280] hover:text-[#111827] text-sm font-medium transition-colors disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Email Settings */}
        <div>
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-[#F3F4F6] rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-[#6B7280]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[#111827] mb-1">
                Email Settings
              </h3>
              <p className="text-sm text-[#6B7280] mb-4">
                Manage your email preferences
              </p>

              {/* Email Address */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#374151] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-[#6B7280] bg-[#F9FAFB]"
                  placeholder="your.email@example.com"
                  readOnly
                />
              </div>

              {/* Weekly Digest Toggle */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-[#111827]">Weekly Digest</p>
                  <p className="text-sm text-[#6B7280]">
                    Get a summary of top stories
                  </p>
                </div>
                <button
                  onClick={() => setWeeklyDigestEnabled(!weeklyDigestEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    weeklyDigestEnabled ? "bg-[#1ABC9C]" : "bg-[#E5E7EB]"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      weeklyDigestEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* LinkedIn Integration */}
        <div className="pt-6 mt-6 border-t border-[#E5E7EB]">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-[#EFF6FF] rounded-lg flex items-center justify-center">
              <Linkedin className="w-5 h-5 text-[#0077B5]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#111827] mb-1">
                LinkedIn Integration
              </h3>
              <p className="text-sm text-[#6B7280]">
                Connect your LinkedIn account to easily share your blog articles
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0077B5] rounded-lg flex items-center justify-center">
                <Linkedin className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-medium text-[#111827]">
                  {linkedInConnected
                    ? "LinkedIn Connected"
                    : "LinkedIn Disconnected"}
                </p>
                <p className="text-sm text-[#6B7280]">
                  {linkedInConnected
                    ? "Share articles directly to your LinkedIn profile"
                    : "Connect to share articles"}
                </p>
              </div>
            </div>
            <button
              onClick={handleLinkedInToggle}
              className={`text-sm font-medium transition-colors ${
                linkedInConnected
                  ? "text-red-500 hover:text-red-600"
                  : "text-[#0077B5] hover:text-[#006097]"
              }`}
            >
              {linkedInConnected ? "Disconnect" : "Connect"}
            </button>
          </div>
        </div>

        {/* WordPress Integration */}
        <div className="pt-6 mt-6 border-t border-[#E5E7EB]">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-[#F3F4F6] rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-[#21759B]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#111827] mb-1">
                WordPress Integration
              </h3>
              <p className="text-sm text-[#6B7280]">
                Connect your WordPress site to publish blog articles directly
              </p>
            </div>
          </div>

          {/* Error banner — shown on connect/disconnect failure */}
          {wpError && (
            <div className="mb-3 px-4 py-2 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
              {wpError}
            </div>
          )}

          <div className="bg-white border border-[#E5E7EB] rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#21759B] rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-medium text-[#111827]">
                  {wordpressConnected
                    ? "WordPress Connected"
                    : "WordPress Disconnected"}
                </p>
                <p className="text-sm text-[#6B7280]">
                  {wordpressConnected
                    ? `Connected as ${wpUsername || "WordPress User"}`
                    : "Connect to publish articles"}
                </p>
                {wordpressConnected && wpSiteUrl && (
                  <p className="text-xs text-[#9CA3AF] mt-0.5">{wpSiteUrl}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleWordPressToggle}
              disabled={wpLoading}
              className={`text-sm font-medium transition-colors disabled:opacity-50 ${
                wordpressConnected
                  ? "text-red-500 hover:text-red-600"
                  : "text-[#21759B] hover:text-[#1A5F7A]"
              }`}
            >
              {wpLoading
                ? wordpressConnected
                  ? "Disconnecting..."
                  : "Connecting..."
                : wordpressConnected
                  ? "Disconnect"
                  : "Connect"}
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone Card */}
      <div className="bg-[#FEF2F2] rounded-xl border border-[#FEE2E2] p-8">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-[#FEE2E2] rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-[#DC2626]" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-[#DC2626] mb-1">Danger Zone</h3>
            <p className="text-sm text-[#6B7280] mb-4">
              Once you delete your account, there is no going back. Please be
              certain.
            </p>
            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="px-5 py-2 border-2 border-[#DC2626] hover:bg-[#DC2626] text-[#DC2626] hover:text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
