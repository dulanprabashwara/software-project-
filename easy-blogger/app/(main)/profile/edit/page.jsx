"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../../components/layout/Header";
import Sidebar from "../../../../components/layout/Sidebar";
import { Camera, Lock, Mail, Crown, AlertTriangle } from "lucide-react";

/**
 * Edit Profile Page
 *
 * Purpose: Allows users to update their profile information and manage account settings
 * Features: Profile photo upload, bio editing, email settings, password change, account deletion
 */

export default function EditProfilePage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [displayName, setDisplayName] = useState("Emma Richardson");
  const [username, setUsername] = useState("Emma Richardson");
  const [email, setEmail] = useState("emma.richardson@example.com");
  const [about, setAbout] = useState(
    "Product Designer & Writer. Passionate about UX design, systems, and the future of design creativity. Sharing insights on building better products.",
  );
  const [profilePhoto, setProfilePhoto] = useState("/api/placeholder/120/120");
  const [weeklyDigestEnabled, setWeeklyDigestEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

  const handleSaveChanges = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      alert("Profile updated successfully!");
    }, 1000);
  };

  const handleChangePassword = () => {
    setShowPasswordChange(!showPasswordChange);
  };

  const handleUpdatePassword = () => {
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
    // Simulate API call
    alert("Password updated successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswordChange(false);
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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Header onToggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} />

      <main
        className={`pt-16 transition-all duration-300 ease-in-out ${sidebarOpen ? "ml-60" : "ml-0"}`}
      >
        <div className="max-w-4xl mx-auto px-8 py-8">
          {/* Header with Save and Cancel Buttons */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-[#111827]">Edit Profile</h1>
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
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-[#F3F4F6] border-4 border-white shadow-lg">
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
                </div>
              </div>

              {/* Profile Fields */}
              <div className="flex-1 space-y-6">
                {/* Display Name */}
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-2">
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

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
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

          {/* Premium Upgrade Card */}
          <div className="bg-gradient-to-r from-[#EFF6FF] to-[#DBEAFE] rounded-xl border border-[#BFDBFE] p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#FBBF24] to-[#F59E0B] rounded-full flex items-center justify-center shadow-lg">
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
                      <p className="font-medium text-[#111827]">
                        Weekly Digest
                      </p>
                      <p className="text-sm text-[#6B7280]">
                        Get a summary of top stories
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setWeeklyDigestEnabled(!weeklyDigestEnabled)
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        weeklyDigestEnabled ? "bg-[#1ABC9C]" : "bg-[#E5E7EB]"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          weeklyDigestEnabled
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
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
                  Once you delete your account, there is no going back. Please
                  be certain.
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
      </main>
    </div>
  );
}
