// components/search/UserCard.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Profile card for user search results.
// Matches Search_Profiles.png mockup design.
//
// Changes from previous version:
//  - Follow button wired to real backend via api.toggleFollow() + useAuth
//  - Optimistic UI update (same pattern as profile/[username]/page.jsx)
//  - Following state : teal filled bg, white text/icon
//  - Not following   : teal outlined border, teal text + UserPlus icon
//  - Clicking name/avatar navigates to /profile/[username]
//  - Follower + article counts read from real DB data passed via props
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { useRouter } from "next/navigation";
import { BadgeCheck, UserPlus, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../app/context/AuthContext";
import { api } from "../../lib/api";

/** Compact number formatter: 1200 → "1.2K" */
function formatCount(n = 0) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function UserCard({ user }) {
  const router = useRouter();

  // Auth context — same pattern used in profile/[username]/page.jsx
  const { user: firebaseUser } = useAuth();

  const {
    id,
    username    = "",
    displayName = "",
    avatarUrl,
    bio,
    isPremium   = false,
    stats,
    _count      = {},
  } = user;

  // ── Follow state ──────────────────────────────────────────────────────────
  const [isFollowing,      setIsFollowing]      = useState(user.isFollowing || false);
  const [followerCount,    setFollowerCount]     = useState(
    stats?.totalFollowers ?? _count?.followers ?? 0
  );
  const [isTogglingFollow, setIsTogglingFollow] = useState(false);

  const articleCount = stats?.articleCount ?? _count?.articles ?? 0;

  const avatarSrc =
    avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      displayName || username || "U"
    )}&background=1ABC9C&color=fff`;

  // ── Navigation ────────────────────────────────────────────────────────────
  const handleProfileClick = () => {
    if (username) router.push(`/profile/${username}`);
  };

  // ── Follow / Unfollow ─────────────────────────────────────────────────────
  // Mirrors the exact same pattern in profile/[username]/page.jsx so the
  // behaviour is consistent across the whole app.
  const handleFollow = async (e) => {
    e.stopPropagation();
    if (!firebaseUser || !id || isTogglingFollow) return;

    const wasFollowing = isFollowing;

    // Optimistic update
    setIsFollowing(!wasFollowing);
    setFollowerCount((prev) => (wasFollowing ? prev - 1 : prev + 1));
    setIsTogglingFollow(true);

    try {
      const token = await firebaseUser.getIdToken();
      const res   = await api.toggleFollow(id, token);

      if (res?.success && res?.data) {
        setIsFollowing(res.data.followed);
        // If server result differs from optimistic guess, fix the count
        if (res.data.followed !== !wasFollowing) {
          setFollowerCount((prev) =>
            res.data.followed ? prev + 1 : prev - 1
          );
        }
      }
    } catch (err) {
      console.error("Follow toggle failed:", err);
      // Revert to previous state
      setIsFollowing(wasFollowing);
      setFollowerCount((prev) => (wasFollowing ? prev + 1 : prev - 1));
    } finally {
      setIsTogglingFollow(false);
    }
  };

  return (
    <div className="flex items-center gap-4 py-5 border-b border-[#E5E7EB] last:border-0">

      {/* Avatar ── clickable → profile page */}
      <button
        onClick={handleProfileClick}
        className="flex-shrink-0 focus:outline-none"
        aria-label={`View ${displayName || username}'s profile`}
      >
        <div
          className={`w-16 h-16 rounded-full overflow-hidden border-2 transition-colors duration-150 ${
            isPremium
              ? "border-amber-400"
              : "border-transparent hover:border-[#1ABC9C]"
          }`}
        >
          <img
            src={avatarSrc}
            alt={displayName || username}
            className="w-full h-full object-cover"
          />
        </div>
      </button>

      {/* Info ── name clickable → profile page */}
      <div className="flex-1 min-w-0">
        <button
          onClick={handleProfileClick}
          className="flex items-center gap-1.5 text-left focus:outline-none"
        >
          <span className="font-bold text-[#111827] hover:text-[#1ABC9C] transition-colors duration-150 leading-tight">
            {displayName || username}
          </span>
          {isPremium && (
            <BadgeCheck className="w-4 h-4 text-[#1ABC9C] flex-shrink-0" />
          )}
        </button>

        {/* @username — only shown when displayName is also set */}
        {displayName && username && (
          <p className="text-xs text-[#6B7280] mt-0.5">@{username}</p>
        )}

        {/* Bio */}
        {bio && (
          <p className="text-sm text-[#6B7280] mt-2 line-clamp-2 leading-snug">
            {bio}
          </p>
        )}

        {/* Article + follower counts from DB */}
        <div className="flex items-center gap-4 mt-2 text-xs text-[#6B7280]">
          <span>
            <span className="font-semibold text-[#111827]">
              {formatCount(articleCount)}
            </span>{" "}
            {articleCount === 1 ? "Article" : "Articles"}
          </span>
          <span>
            <span className="font-semibold text-[#111827]">
              {formatCount(followerCount)}
            </span>{" "}
            {followerCount === 1 ? "follower" : "followers"}
          </span>
        </div>
      </div>

      {/* Follow / Unfollow button */}
      <button
        onClick={handleFollow}
        disabled={isTogglingFollow || !firebaseUser}
        className={`flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 flex-shrink-0 min-w-[90px] disabled:opacity-50 disabled:cursor-not-allowed ${
          isFollowing
            ? // Following: solid teal fill, white text
              "bg-[#1ABC9C] text-white border-[#1ABC9C] hover:bg-[#17a589] hover:border-[#17a589]"
            : // Not following: white bg, teal border + text
              "bg-white text-[#1ABC9C] border-[#1ABC9C] hover:bg-[#E8F8F5]"
        }`}
        aria-pressed={isFollowing}
        title={!firebaseUser ? "Sign in to follow" : undefined}
      >
        {isTogglingFollow ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <>
            {!isFollowing && (
              <UserPlus className="w-3.5 h-3.5" strokeWidth={2} />
            )}
            <span>{isFollowing ? "Following" : "Follow"}</span>
          </>
        )}
      </button>
    </div>
  );
}
