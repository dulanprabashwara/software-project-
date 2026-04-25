"use client";
//display a user profile other than the one currently logged in
import { useState, use, useRef, useEffect } from "react";
import Link from "next/link";
import {
  MoreHorizontal,
  MessageCircle,
  UserPlus,
  FileText,
  Loader2,
} from "lucide-react";
import ArticleCard from "../../../../components/article/ArticleCard";
import { useAuth } from "../../../context/AuthContext";
import { api } from "../../../../lib/api";
import { getPublishedArticlesByUsername } from "../../../../lib/articles/api"; // Fetch published articles for the viewed profile user from database

export default function UserProfilePage({ params }) {
  const unwrappedParams = use(params);
  const username = unwrappedParams.username;

  const { user: firebaseUser, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState("home");
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // ── Profile data from backend ──
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);

  // ── Follow state ──
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isTogglingFollow, setIsTogglingFollow] = useState(false);

  // Store published articles and loading state for Home tab
  const [articles, setArticles] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(true);

  useEffect(() => {
    const fetchPublishedArticles = async () => {
      // Stop request if username is missing
      if (!username) 
        return;

      try {
        // Show loading state while fetching articles
        setArticlesLoading(true);

        // Get only published articles of this profile user
        const response = await getPublishedArticlesByUsername(username, 1, 20);

        // Save articles from backend response
        setArticles(response?.data || []);
      } catch (error) {
        // Prevent UI breaking if request fails
        console.error("Failed to fetch published articles:", error);
        setArticles([]);
      } finally {
        // Stop loading state after request completes
        setArticlesLoading(false);
      }
    };

    void fetchPublishedArticles();
  }, [username]);

  // ── Fetch profile from backend ──
  useEffect(() => {
    const fetchProfile = async () => {
      setProfileLoading(true);
      setProfileError(null);
      try {
        let res;
        // If the user is logged in send the token with username to get the user data
        if (firebaseUser) {
          const token = await firebaseUser.getIdToken();
          res = await api.getUserProfileAuth(username, token);
        } else {
          res = await api.getUserProfile(username);
        }

        if (res.success && res.data) {
          setProfile(res.data);
          setIsFollowing(res.data.isFollowing || false);
          setFollowerCount(res.data._count?.followers || 0);
          setFollowingCount(res.data._count?.following || 0);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setProfileError(err.message || "User not found.");
      } finally {
        setProfileLoading(false);
      }
    };

    // Wait for Firebase to finish checking auth state before fetching user data
    if (username && !authLoading) {
      fetchProfile();
    }
  }, [username, firebaseUser, authLoading]);

  // ── Follow / Unfollow functionality ──
  const handleFollowToggle = async () => {
    if (!firebaseUser || !profile?.id || isTogglingFollow) return;

    //when click follow or unfollow update the button and the follower count
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);
    setFollowerCount((prev) => (wasFollowing ? prev - 1 : prev + 1));
    setIsTogglingFollow(true);

    try {
      //tell backend to update the follow or following the user
      const token = await firebaseUser.getIdToken();
      const res = await api.toggleFollow(profile.id, token);

      if (res.success && res.data) {
        setIsFollowing(res.data.followed);

        if (res.data.followed !== !wasFollowing) {
          setFollowerCount((prev) => (res.data.followed ? prev + 1 : prev - 1));
        }
      }
    } catch (err) {
      //if failed toggling return the button to original state and reset follower count
      console.error("Follow toggle failed:", err);
      setIsFollowing(wasFollowing);
      setFollowerCount((prev) => (wasFollowing ? prev + 1 : prev - 1));
    } finally {
      setIsTogglingFollow(false);
    }
  };

  //close the dropdown menu when clicked outside after clicking 3 dots
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // grab the URL of the profile page and copy it to the clipboard
  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        alert("Profile link copied to clipboard!");
        setShowMenu(false);
      })
      .catch((err) => {
        console.error("Failed to copy link:", err);
        alert("Failed to copy link. Please copy the URL manually.");
      });
  };

  // ── Derived display values ──
  const displayName = profile?.displayName || username;
  const avatarUrl =
    profile?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=1ABC9C&color=fff`;
  const bio = profile?.bio || "";
  const isPremium = profile?.isPremium || false;

  // Check if this is the logged-in user's own profile
  const isOwnProfile = firebaseUser && profile && profile.id === profile?.id;

  // ── Loading state ──
  if (profileLoading) {
    return (
      <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-white">
        {/* Main Content Area Skeleton */}
        <div className="flex-1 overflow-y-auto border-r border-[#E5E7EB] p-8">
          <div className="max-w-3xl mx-auto space-y-8 animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded mb-8"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-[#E5E7EB] rounded-xl p-6">
                <div className="flex gap-4 mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    <div className="h-3 w-24 bg-gray-100 rounded"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                  <div className="h-4 w-full bg-gray-100 rounded"></div>
                  <div className="h-4 w-5/6 bg-gray-100 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar Skeleton */}
        <aside className="w-80 shrink-0 bg-[#F9FAFB] px-6 py-8 border-l border-[#E5E7EB]">
          <div className="animate-pulse flex flex-col pt-4">
            <div className="w-24 h-24 bg-gray-200 rounded-full mb-4"></div>
            <div className="h-6 w-32 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-24 bg-gray-200 rounded mb-6"></div>
            <div className="h-10 w-full bg-gray-200 rounded-full mb-8"></div>

            <div className="space-y-3 w-full">
              <div className="h-4 w-full bg-gray-200 rounded"></div>
              <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
              <div className="h-4 w-4/6 bg-gray-200 rounded"></div>
            </div>
          </div>
        </aside>
      </div>
    );
  }

  // ── Error state ──
  if (profileError) {
    return (
      <div className="flex h-[calc(100vh-64px)] w-full items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            User Not Found
          </h2>
          <p className="text-gray-500 mb-4">{profileError}</p>
          <Link
            href="/home"
            className="px-6 py-2 bg-[#1ABC9C] text-white rounded-full text-sm font-medium hover:bg-[#16a085] transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-white">
      {/* Main Content Area - Left Side */}
      <div className="flex-1 overflow-y-auto scrollbar-hide border-r border-[#E5E7EB]">
        <div className="max-w-3xl mx-auto px-8 py-10">
          {/* Header Name & Options */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-[40px] font-bold text-[#111827] font-serif">
              {displayName}
            </h1>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-gray-500 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <MoreHorizontal className="w-6 h-6" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                  <button
                    onClick={handleCopyLink}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                      />
                    </svg>
                    Copy link to profile
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-100 mb-8">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab("home")}
                className={`pb-4 text-[15px] font-medium transition-colors relative ${
                  activeTab === "home"
                    ? "text-[#111827]"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Home
                {activeTab === "home" && (
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-[#111827]" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("about")}
                className={`pb-4 text-[15px] font-medium transition-colors relative ${
                  activeTab === "about"
                    ? "text-[#111827]"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                About
                {activeTab === "about" && (
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-[#111827]" />
                )}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "home" ? (
            <div className="space-y-8">
              {articlesLoading ? (
                <p className="text-sm text-gray-500">Loading articles...</p>
              ) : articles.length === 0 ? (
                <div className="py-10 text-center text-gray-500">
                  <FileText className="mx-auto mb-3 h-8 w-8 text-gray-300" />
                  <p className="text-sm">No published articles yet.</p>
                </div>
              ) : (
                articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))
              )}
            </div>
          ) : (
            <div className="py-8">
              <h3 className="text-lg font-semibold text-[#111827] mb-3">
                About {displayName}
              </h3>
              <p className="text-gray-600 leading-relaxed text-[15px]">
                {bio || "This user hasn't added a bio yet."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - User Info */}
      <div className="w-90 shrink-0 overflow-y-auto border-l border-[#F2F2F2] px-8 py-10">
        <div className="sticky top-10">
          <div className="mb-4">
            <img
              src={avatarUrl}
              alt={displayName}
              referrerPolicy="no-referrer"
              className="w-24 h-24 rounded-full object-cover"
            />
          </div>

          <h2 className="text-base font-bold text-[#111827] mb-1 font-serif">
            {displayName}
          </h2>

          <div className="flex items-center gap-1 text-[13px] text-gray-500 mb-3">
            <Link
              href={`/profile/${username}/stats?tab=followers`}
              className="hover:text-gray-900 transition-colors"
            >
              <span className="font-medium text-[#111827]">
                {followerCount}
              </span>{" "}
              Followers
            </Link>
            <span>·</span>
            <Link
              href={`/profile/${username}/stats?tab=following`}
              className="hover:text-gray-900 transition-colors"
            >
              <span className="font-medium text-[#111827]">
                {followingCount}
              </span>{" "}
              Following
            </Link>
          </div>

          <p className="text-[13px] text-gray-500 leading-relaxed mb-6">
            {bio || "No bio yet."}
          </p>

          {/* Follow / Message Buttons — Only show if not viewing own profile */}
          {firebaseUser && (
            <div className="flex gap-3 mb-8">
              <button
                onClick={handleFollowToggle}
                disabled={isTogglingFollow}
                className={`px-4 py-2 rounded-full text-[14px] font-medium transition-all duration-200 ${
                  isFollowing ? "flex-1" : "w-full"
                } ${
                  isFollowing
                    ? "border border-gray-300 text-gray-700 hover:border-red-400 hover:text-red-500 hover:bg-red-50"
                    : "bg-[#1ABC9C] text-white hover:bg-[#16a085]"
                } disabled:opacity-50`}
              >
                {isTogglingFollow ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : isFollowing ? (
                  "Following"
                ) : (
                  "Follow"
                )}
              </button>
              {isFollowing && (
                <Link
                  href={`/chat?userId=${profile.id}`}
                  className="flex-1 px-4 py-2 rounded-full text-[14px] font-medium bg-[#1ABC9C] text-white hover:bg-[#16a085] transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Message
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
