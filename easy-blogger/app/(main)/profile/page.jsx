// Profile page - Shows user's profile with their articles
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { X, Loader2, MessageCircle } from "lucide-react";
import { useSubscription } from "../../subscription/SubscriptionContext";
import { useAuth } from "../../context/AuthContext";
import ArticleCard from "../../../components/article/ArticleCard";
import { api } from "../../../lib/api";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("home");
  const { isPremium } = useSubscription();
  const {
    user: firebaseUser,
    userProfile,
    loading: authLoading,
    updateProfile: updateContextProfile,
  } = useAuth();

  const searchParams = useSearchParams();
  const router = useRouter();

  // When ?modal=followers/following/reads/shares is present, show the stats modal
  const modalTab = searchParams.get("modal");

  // Show spinner only while Firebase auth state is being determined (fast, ~50ms).
  const loading = authLoading;
  // Derive display values — Firebase is available immediately as fallback
  // while the backend userProfile loads asynchronously.
  const displayName =
    userProfile?.displayName ||
    firebaseUser?.displayName ||
    firebaseUser?.email?.split("@")[0] ||
    "User";
  const avatarUrl =
    userProfile?.avatarUrl ||
    firebaseUser?.photoURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=1ABC9C&color=fff`;

  const fallbackAvatar = (name) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "?")}&background=1ABC9C&color=fff`;

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // About Section State
  const [aboutText, setAboutText] = useState("");
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [hasAbout, setHasAbout] = useState(false);

  // Stats modal state
  const [statsActiveTab, setStatsActiveTab] = useState(modalTab || "followers");
  
  // Real stats data
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [followingSet, setFollowingSet] = useState(new Set());
  const [togglingIds, setTogglingIds] = useState(new Set());
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  // Sync stats tab when URL changes
  useEffect(() => {
    if (modalTab) setStatsActiveTab(modalTab);
  }, [modalTab]);

  // Sync about text when profile data arrives
  useEffect(() => {
    if (userProfile) {
      setAboutText(userProfile.bio || "");
      setHasAbout(!!userProfile.bio);
    }
  }, [userProfile]);

  // Fetch live unread message count on mount
  useEffect(() => {
    if (!firebaseUser) return;
    const fetchUnread = async () => {
      try {
        const token = await firebaseUser.getIdToken();
        const res = await api.getUnreadMessageCount(token);
        setUnreadMessageCount(res?.data?.unreadCount ?? 0);
      } catch (err) {
        console.error("Failed to fetch unread count:", err);
      }
    };
    fetchUnread();
  }, [firebaseUser]);

  // Fetch real followers/following when modal opens
  useEffect(() => {
    if (!modalTab || !userProfile?.id) return;

    const loadStats = async () => {
      setStatsLoading(true);
      try {
        const [followersRes, followingRes] = await Promise.all([
          api.getFollowers(userProfile.id),
          api.getFollowing(userProfile.id),
        ]);

        const followersList = followersRes.success ? followersRes.data : [];
        const followingList = followingRes.success ? followingRes.data : [];

        setFollowers(followersList);
        setFollowing(followingList);

        // Track who we currently follow
         const alreadyFollowing = new Set(followingList.map((u) => u.id));
         setFollowingSet(alreadyFollowing);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setStatsLoading(false);
      }
    };

    loadStats();
  }, [modalTab, userProfile?.id]);

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

  const closeModal = () => router.push("/profile");

  const handleCopyLink = () => {
    const url = window.location.href;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          alert("Profile link copied to clipboard!");
          setShowMenu(false);
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
          fallbackCopyTextToClipboard(url);
        });
    } else {
      fallbackCopyTextToClipboard(url);
    }
  };

  const fallbackCopyTextToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      if (successful) {
        alert("Profile link copied to clipboard!");
        setShowMenu(false);
      } else {
        alert("Failed to copy link.");
      }
    } catch (err) {
      console.error("Fallback: Oops, unable to copy", err);
      alert("Failed to copy link.");
    }

    document.body.removeChild(textArea);
  };

  // About Section Handlers
  const handleGetStartedAbout = () => {
    setIsEditingAbout(true);
  };

  const handleSaveAbout = async () => {
    if (aboutText.trim() && userProfile) {
      try {
        const token = await firebaseUser.getIdToken();
        await api.updateProfile({ bio: aboutText }, token);
        setHasAbout(true);
        setIsEditingAbout(false);
        updateContextProfile({ bio: aboutText });
      } catch (err) {
        console.error("Failed to update bio", err);
        alert("Failed to save about text.");
      }
    }
  };

  const handleCancelAbout = () => {
    setIsEditingAbout(false);
    if (!hasAbout) {
      setAboutText("");
    }
  };

  const handleEditAbout = () => {
    setIsEditingAbout(true);
  };

  const handleDeleteAbout = async () => {
    if (confirm("Are you sure you want to delete your bio?")) {
      try {
        const token = await firebaseUser.getIdToken();
        await api.updateProfile({ bio: null }, token);
        setHasAbout(false);
        setAboutText("");
        updateContextProfile({ bio: null });
      } catch (err) {
        console.error("Failed to delete bio", err);
        alert("Failed to delete bio.");
      }
    }
  };

  const handleToggleFollow = useCallback(
    async (userId) => {
      if (!firebaseUser) return;
      setTogglingIds((prev) => new Set(prev).add(userId));
      try {
        const token = await firebaseUser.getIdToken();
        const res = await api.toggleFollow(userId, token);
        if (res.success) {
          setFollowingSet((prev) => {
            const next = new Set(prev);
            if (res.data.followed) next.add(userId);
            else next.delete(userId);
            return next;
          });
          
          // Optimistically update counts in profile if we are viewing our own modal
          updateContextProfile({
            _count: {
              ...userProfile?._count,
              following: (userProfile?._count?.following || 0) + (res.data.followed ? 1 : -1)
            }
          });
        }
      } catch (err) {
        console.error("Toggle follow failed:", err);
      } finally {
        setTogglingIds((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      }
    },
    [firebaseUser, userProfile, updateContextProfile]
  );

  // Mock articles data
  const articles = [
    {
      id: 1,
      authorName: "Emma Richardson",
      authorAvatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
      verified: false,
      date: "Dec 4, 2025",
      title: "How AI is Transforming Content Creation in 2025",
      content:
        "Explore the latest developments in artificial intelligence and how they are revolutionizing the way we create, curate, and consume content across digital platforms.",
      thumbnail:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=300&fit=crop",
      comments: 42,
      likes: 4.8,
    },
    {
      id: 2,
      authorName: "Emma Richardson",
      authorAvatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
      verified: false,
      date: "Nov 25, 2025",
      title: "Designing for Accessibility in 2025",
      content:
        "A deep dive into the design thinking process and how it can help teams solve complex problems, innovate faster, and create products that truly resonate with users.",
      thumbnail:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
      comments: 35,
      likes: 4.9,
    },
  ];

  const shares = [
    {
      id: 1,
      title: "The Future of AI in 2026",
      platform: "Twitter",
      date: "Jan 2, 2026",
      likes: 12,
    },
    {
      id: 2,
      title: "Mastering React Patterns",
      platform: "LinkedIn",
      date: "Jan 1, 2026",
      comments: 5,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-[calc(100vh-64px)] pt-20 bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#1ABC9C] opacity-50" />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full">
      {/* Main Content Area */}
      <div
        className="flex-1 overflow-y-auto h-[calc(100vh-64px)] relative"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="absolute top-0 right-0 w-3 h-full bg-white z-10 pointer-events-none" />
        <div className="max-w-3xl mx-auto px-8 py-8 pr-12">
          {/* Profile Header */}
          <div className="flex items-center justify-between mb-6">
            <h1
              className="text-3xl font-bold text-[#111827]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {displayName}
            </h1>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-[#F8FAFC] rounded-full transition-colors duration-150"
              >
                <svg
                  className="w-6 h-6 text-[#6B7280]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
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

          {/* Tabs */}
          <div className="border-b border-[#E5E7EB] mb-6">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab("home")}
                className={`pb-3 text-sm font-medium transition-colors ${
                  activeTab === "home"
                    ? "text-[#111827] border-b-2 border-[#111827]"
                    : "text-[#6B7280] hover:text-[#111827]"
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveTab("about")}
                className={`pb-3 text-sm font-medium transition-colors ${
                  activeTab === "about"
                    ? "text-[#111827] border-b-2 border-[#111827]"
                    : "text-[#6B7280] hover:text-[#111827]"
                }`}
              >
                About
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "home" ? (
            <div>
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="py-8">
              {!hasAbout && !isEditingAbout ? (
                <div className="border border-[#E5E7EB] rounded-lg p-8 text-center max-w-xl mx-auto bg-[#F9FAFB] relative z-10 overflow-hidden">
                  <h3 className="text-lg font-semibold text-[#111827] mb-3">
                    Tell the world about yourself
                  </h3>
                  <p className="text-[#6B7280] text-sm mb-6 leading-relaxed">
                    Here's where you can share more about yourself: your
                    history, work experience, accomplishments, interests,
                    dreams, and more.
                  </p>
                  <button
                    onClick={handleGetStartedAbout}
                    className="px-6 py-2.5 border border-[#111827] text-[#111827] rounded-full text-sm font-medium hover:bg-[#111827] hover:text-white transition-colors duration-150"
                  >
                    Get started
                  </button>
                </div>
              ) : isEditingAbout ? (
                <div className="max-w-xl mx-auto relative z-10 overflow-hidden p-1">
                  <label className="block text-sm font-semibold text-[#374151] mb-2">
                    About You
                  </label>
                  <textarea
                    value={aboutText}
                    onChange={(e) => setAboutText(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1ABC9C] focus:border-transparent resize-none mb-4 bg-white"
                    placeholder="Tell your story..."
                  />
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={handleCancelAbout}
                      className="px-6 py-2 border border-black text-black rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveAbout}
                      disabled={!aboutText.trim()}
                      className="px-6 py-2 bg-[#1ABC9C] hover:bg-[#17a589] text-white rounded-full text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="max-w-xl mx-auto group relative z-10 overflow-hidden">
                  <div className="border border-[#E5E7EB] rounded-lg p-8 bg-white mb-3">
                    <div className="prose prose-slate max-w-none text-[#374151] leading-relaxed whitespace-pre-wrap">
                      {aboutText}
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={handleDeleteAbout}
                      className="px-6 py-2 border border-black text-black rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={handleEditAbout}
                      className="px-6 py-2 bg-[#1ABC9C] hover:bg-[#17a589] text-white rounded-full text-sm font-medium transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="w-70 shrink-0 bg-white px-6 py-8 overflow-y-auto h-[calc(100vh-64px)] scrollbar-hide">
        <div className="flex flex-col justify-between h-full">
          <div>
            <div className="mb-4 relative inline-block">
              <img
                src={avatarUrl}
                alt={displayName}
                referrerPolicy="no-referrer"
                className={`w-20 h-20 rounded-full object-cover border-2 ${
                  userProfile?.isPremium ? "border-[#F59E0B]" : "border-[#E5E7EB]"
                }`}
              />
              {userProfile?.isPremium && (
                <div className="absolute -bottom-1 -right-1 transform translate-x-1/4 translate-y-1/4 drop-shadow-md">
                  <svg
                    width="24"
                    height="24"
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

            <h2 className="text-base font-bold text-[#111827] mb-2 flex items-center gap-2">
              {displayName}
            </h2>

            <p className="text-sm text-[#6B7280] mb-1">
              <Link
                href="/profile?modal=followers"
                className="hover:underline cursor-pointer"
              >
                {userProfile?._count?.followers || 0} Followers
              </Link>
              {" · "}
              <Link
                href="/profile?modal=following"
                className="hover:underline cursor-pointer"
              >
                {userProfile?._count?.following || 0} Following
              </Link>
            </p>

            <p className="text-sm text-[#6B7280] mb-4">
              <Link
                href="/profile?modal=shares"
                className="hover:underline cursor-pointer"
              >
                {userProfile?.stats?.totalShares || 0} Shares
              </Link>
              {" · "}
              <Link href="/chat" className="hover:underline cursor-pointer">
                {unreadMessageCount} Messages
              </Link>
            </p>

            <a
              href="/profile/edit"
              className="text-sm text-[#1ABC9C] hover:text-[#17a589] transition-colors"
            >
              Edit profile
            </a>
          </div>

        </div>
      </aside>

      {/* Stats Modal */}
      {modalTab && (
        <>
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[1001]"
            onClick={closeModal}
          />

          <div className="fixed inset-0 flex items-center justify-center z-[1002] p-4 pointer-events-none">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col pointer-events-auto">
              <div className="p-6 border-b border-[#E5E7EB]">
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className="text-2xl font-bold text-[#111827]"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {displayName}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="p-1 hover:bg-[#F9FAFB] rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-[#6B7280]" />
                  </button>
                </div>

                <div className="flex gap-6">
                  {[
                    { key: "followers", label: "Followers", count: userProfile?._count?.followers || followers.length || 0 },
                    { key: "following", label: "Following", count: userProfile?._count?.following || following.length || 0 },
                    { key: "shares", label: "Shares", count: userProfile?.stats?.totalShares || 0 },
                  ].map(({ key, label, count }) => (
                    <button
                      key={key}
                      onClick={() => {
                        setStatsActiveTab(key);
                        router.replace(`/profile?modal=${key}`, {
                          scroll: false,
                        });
                      }}
                      className={`pb-3 text-sm font-medium transition-colors relative ${
                        statsActiveTab === key
                          ? "text-[#111827]"
                          : "text-[#6B7280]"
                      }`}
                    >
                      <span className="mr-1">{label}</span>
                      <span className="text-[#6B7280]">{count}</span>
                      {statsActiveTab === key && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1ABC9C]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-y-auto p-6 flex-1">
                {statsLoading ? (
                  <div className="space-y-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center justify-between animate-pulse">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                          <div className="space-y-2">
                            <div className="h-4 w-32 bg-gray-200 rounded"></div>
                            <div className="h-3 w-20 bg-gray-100 rounded"></div>
                          </div>
                        </div>
                        <div className="w-24 h-8 bg-gray-200 rounded-full"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Followers Tab */}
                    {statsActiveTab === "followers" && (
                      <div className="space-y-4">
                        {followers.length === 0 ? (
                           <p className="text-center text-gray-400 py-8 text-sm">
                             You have no followers yet. Share your profile to gain some!
                           </p>
                        ) : (
                          followers.map((person) => {
                            const isFollowingPerson = followingSet.has(person.id);
                            const isToggling = togglingIds.has(person.id);
                            const isSelf = userProfile?.id === person.id;
                            return (
                              <div
                                key={person.id}
                                className="flex items-center justify-between"
                              >
                                <Link
                                  href={isSelf ? "/profile" : `/profile/${person.username}`}
                                  className="flex items-center gap-3 min-w-0"
                                >
                                  <img
                                    src={person.avatarUrl || fallbackAvatar(person.displayName)}
                                    alt={person.displayName}
                                    referrerPolicy="no-referrer"
                                    className="w-12 h-12 rounded-full object-cover shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <p className="font-semibold text-[#111827] text-sm truncate">
                                      {person.displayName || person.username}
                                    </p>
                                    <p className="text-xs text-[#6B7280] truncate">
                                      @{person.username}
                                    </p>
                                  </div>
                                </Link>
                                {!isSelf && (
                                  <div className="flex items-center gap-2 ml-4 shrink-0">
                                    <button
                                      onClick={() => handleToggleFollow(person.id)}
                                      disabled={isToggling}
                                      className={`shrink-0 px-4 py-1.5 text-sm rounded-full transition-colors disabled:opacity-50 ${
                                        isFollowingPerson
                                          ? "text-[#6B7280] border border-[#E5E7EB] hover:bg-[#F9FAFB]"
                                          : "text-white bg-[#1ABC9C] hover:bg-[#17a589]"
                                      }`}
                                    >
                                      {isToggling ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : isFollowingPerson ? (
                                        "Following"
                                      ) : (
                                        "Follow Back"
                                      )}
                                    </button>
                                    {isFollowingPerson && (
                                      <Link
                                        href={`/chat?userId=${person.id}`}
                                        className="shrink-0 px-4 py-1.5 text-sm rounded-full border border-[#1ABC9C] text-[#1ABC9C] hover:bg-[#1ABC9C] hover:text-white transition-colors"
                                      >
                                        Message
                                      </Link>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}

                    {/* Following Tab */}
                    {statsActiveTab === "following" && (
                      <div className="space-y-4">
                        {following.length === 0 ? (
                          <p className="text-center text-gray-400 py-8 text-sm">
                            You are not following anyone yet. Discover writers!
                          </p>
                        ) : (
                          following.map((person) => {
                            const stillFollowing = followingSet.has(person.id);
                            const isToggling = togglingIds.has(person.id);
                            const isSelf = userProfile?.id === person.id;
                            return (
                              <div
                                key={person.id}
                                className="flex items-center justify-between"
                              >
                                <Link
                                  href={isSelf ? "/profile" : `/profile/${person.username}`}
                                  className="flex items-center gap-3 min-w-0"
                                >
                                  <img
                                    src={person.avatarUrl || fallbackAvatar(person.displayName)}
                                    alt={person.displayName}
                                    referrerPolicy="no-referrer"
                                    className="w-12 h-12 rounded-full object-cover shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <p className="font-semibold text-[#111827] text-sm truncate">
                                      {person.displayName || person.username}
                                    </p>
                                    <p className="text-xs text-[#6B7280] truncate">
                                      @{person.username}
                                    </p>
                                  </div>
                                </Link>
                                {!isSelf && (
                                  <div className="flex items-center gap-2 ml-4 shrink-0">
                                    <button
                                      onClick={() => handleToggleFollow(person.id)}
                                      disabled={isToggling}
                                      className={`shrink-0 px-4 py-1.5 text-sm rounded-full transition-colors disabled:opacity-50 ${
                                        stillFollowing
                                          ? "text-[#6B7280] border border-[#E5E7EB] hover:border-red-300 hover:text-red-500 hover:bg-red-50"
                                          : "text-white bg-[#1ABC9C] hover:bg-[#17a589]"
                                      }`}
                                    >
                                      {isToggling ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : stillFollowing ? (
                                        "Following"
                                      ) : (
                                        "Follow"
                                      )}
                                    </button>
                                    <Link
                                      href={`/chat?userId=${person.id}`}
                                      className="shrink-0 px-4 py-1.5 text-sm rounded-full border border-[#1ABC9C] text-[#1ABC9C] hover:bg-[#1ABC9C] hover:text-white transition-colors"
                                    >
                                      Message
                                    </Link>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}

                    {/* Shares Tab */}
                    {statsActiveTab === "shares" && (
                      <div className="space-y-5">
                        {shares.map((share) => (
                          <div
                            key={share.id}
                            className="border-b border-[#E5E7EB] pb-4 last:border-0"
                          >
                            <h3 className="font-semibold text-[#111827] mb-2">
                              {share.title}
                            </h3>
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-[#6B7280]">
                                Shared to {share.platform} · {share.date}
                              </p>
                              {share.likes && (
                                <span className="px-2 py-1 bg-[#D1FAE5] text-[#059669] text-xs font-medium rounded">
                                  {share.likes} likes
                                </span>
                              )}
                              {share.comments && (
                                <span className="px-2 py-1 bg-[#DBEAFE] text-[#2563EB] text-xs font-medium rounded">
                                  {share.comments} comments
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
