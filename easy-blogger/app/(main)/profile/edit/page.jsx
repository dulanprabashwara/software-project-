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
} from "lucide-react";

/**
 * Edit Profile Page
 *
 * Purpose: Allows users to update their profile information and manage account settings
 * Features: Profile photo upload, bio editing, email settings, password change, account deletion
 */

import { useSubscription } from "../../../subscription/SubscriptionContext";
import { useAuth } from "../../../context/AuthContext";
import { api } from "../../../../lib/api";

export default function EditProfilePage() {
  const router = useRouter();
  // Use global subscription context
  const { isPremium, togglePremium } = useSubscription();
  const {
    user: firebaseUser,
    userProfile,
    loading,
    updateProfile: updateContextProfile,
  } = useAuth();

  // Firebase data is available almost instantly (cached auth state).
  // Use it as the immediate fallback so the form renders with real data
  // on first paint. Backend-only fields (username, bio) fill in via
  // useEffect once syncUser completes.
  const [displayName, setDisplayName] = useState(
    userProfile?.displayName || firebaseUser?.displayName || "",
  );
  const [username, setUsername] = useState(userProfile?.username || "");
  const [email] = useState(
    firebaseUser?.email || userProfile?.email || "",
  );
  const [about, setAbout] = useState(userProfile?.bio || "");
  const [profilePhoto, setProfilePhoto] = useState(
    userProfile?.avatarUrl || firebaseUser?.photoURL || "/api/placeholder/120/120",
  );

  const backendFieldsPopulated = useRef(false);

  // Populate backend-only fields once userProfile arrives (handles cold start).
  useEffect(() => {
    if (!userProfile || backendFieldsPopulated.current) return;
    backendFieldsPopulated.current = true;
    setDisplayName((prev) => prev || userProfile.displayName || "");
    setUsername(userProfile.username || "");
    setAbout(userProfile.bio || "");
    if (userProfile.avatarUrl) setProfilePhoto(userProfile.avatarUrl);
  }, [userProfile]);

  // Redirect to login if user is definitively not authenticated.
  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push("/login");
    }
  }, [loading, firebaseUser, router]);

  const [weeklyDigestEnabled, setWeeklyDigestEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [linkedInConnected, setLinkedInConnected] = useState(false);
  const [wordpressConnected, setWordpressConnected] = useState(false);

  const fileInputRef = useRef(null);

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

      // 1. Update backend Database
      await api.updateProfile(updateData, token);

      // 2. Update Firebase Auth Profile (displayName only)
      // photoURL is intentionally omitted — Firebase Auth rejects base64 data URLs.
      // The avatar is stored in our backend DB and read from userProfile.avatarUrl.
      if (displayName !== firebaseUser.displayName) {
        const { updateProfile: updateFirebaseAuthProfile } =
          await import("firebase/auth");
        await updateFirebaseAuthProfile(firebaseUser, {
          displayName: displayName,
        });
      }

      // 3. Update AuthContext so all components reflect changes instantly
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

  const handleChangePassword = () => {
    setShowPasswordChange(!showPasswordChange);
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill in all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    if (!firebaseUser || !firebaseUser.email) return;

    try {
      // 1. Dyanmically import Firebase Auth functions
      const {
        EmailAuthProvider,
        reauthenticateWithCredential,
        updatePassword,
      } = await import("firebase/auth");

      // 2. Create the credential for re-authentication
      const credential = EmailAuthProvider.credential(
        firebaseUser.email,
        currentPassword,
      );

      // 3. Re-authenticate user
      await reauthenticateWithCredential(firebaseUser, credential);

      // 4. Safely update to the new password
      await updatePassword(firebaseUser, newPassword);

      alert("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordChange(false);
    } catch (err) {
      console.error("Failed to update password:", err);
      // Firebase specific error handling
      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-mismatch"
      ) {
        alert("The current password you entered is incorrect.");
      } else if (err.code === "auth/weak-password") {
        alert(
          "The new password is too weak. Please choose a stronger password.",
        );
      } else if (err.code === "auth/requires-recent-login") {
        alert(
          "This operation is sensitive and requires recent authentication. Please log out and log back in.",
        );
      } else {
        alert(err.message || "An error occurred while updating the password.");
      }
    }
  };

  const handleCancelPasswordChange = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswordChange(false);
  };

  const handleDeleteAccount = () => {
    if (
      confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    ) {
      alert("Account deletion - to be implemented");
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

  const handleWordPressToggle = () => {
    if (wordpressConnected) {
      if (confirm("Do you want to disconnect from WordPress?")) {
        setWordpressConnected(false);
      }
    } else {
      setWordpressConnected(true);
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
          {/* Dev Toggle for testing */}
          <button
            onClick={togglePremium}
            className="px-3 py-1 text-xs bg-gray-200 rounded mr-2 hover:bg-gray-300 transition-colors"
          >
            Toggle Premium ({isPremium ? "ON" : "OFF"})
          </button>

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
                className={`w-32 h-32 rounded-full overflow-hidden bg-[#F3F4F6] border-4 shadow-lg ${
                  isPremium ? "border-[#F59E0B]" : "border-white"
                }`}
              >
                <img
                  src={profilePhoto}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-10 h-10 bg-[#1ABC9C] hover:bg-[#17a589] rounded-full flex items-center justify-center shadow-lg transition-colors"
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
          </div>
        </div>
      </div>

      {/* Subscription Card - Conditional */}
      {isPremium ? (
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
                  Your subscription renews on Jan 22, 2026
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
              {/* Current Password */}
              <div>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current password"
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-[#1ABC9C] focus:border-transparent"
                />
              </div>

              {/* New Password */}
              <div>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-[#1ABC9C] focus:border-transparent"
                />
              </div>

              {/* Confirm New Password */}
              <div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-[#1ABC9C] focus:border-transparent"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleUpdatePassword}
                  className="px-6 py-2.5 bg-[#111827] hover:bg-[#1F2937] text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Update Password
                </button>
                <button
                  onClick={handleCancelPasswordChange}
                  className="px-6 py-2.5 text-[#6B7280] hover:text-[#111827] text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
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
                  placeholder="emma.richardson@example.com"
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
                    ? "Publish articles directly to your WordPress site"
                    : "Connect to publish articles"}
                </p>
              </div>
            </div>
            <button
              onClick={handleWordPressToggle}
              className={`text-sm font-medium transition-colors ${
                wordpressConnected
                  ? "text-red-500 hover:text-red-600"
                  : "text-[#21759B] hover:text-[#1A5F7A]"
              }`}
            >
              {wordpressConnected ? "Disconnect" : "Connect"}
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
              className="px-5 py-2 border-2 border-[#DC2626] hover:bg-[#DC2626] text-[#DC2626] hover:text-white rounded-lg text-sm font-medium transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
