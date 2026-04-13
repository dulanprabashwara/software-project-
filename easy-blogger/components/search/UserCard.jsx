// components/search/UserCard.jsx
// ────────────────────────────────────────────────────────────────────────────

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
  // isFollowing comes from backend (search.service.js bulk-checks on load).
  // Falls back to false if backend didn't send it (anonymous visitor).
  const [isFollowing,      setIsFollowing]      = useState(user.isFollowing ?? false);

  // Follower count — always sourced from DB. Starts from whatever the search
  // endpoint returned. Refreshed from DB after every follow/unfollow toggle.
  const [followerCount,    setFollowerCount]     = useState(
    stats?.totalFollowers ?? _count?.followers ?? 0
  );

  // True while api.toggleFollow() is in-flight — shows spinner in button
  const [isTogglingFollow, setIsTogglingFollow] = useState(false);

  // True while api.getUserProfile() re-fetch is in-flight — shows spinner
  // next to the follower count instead of the stale number
  const [isRefetchingCount, setIsRefetchingCount] = useState(false);

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

  // ── Refetch the real follower count from DB ───────────────────────────────
  // Called after every successful follow/unfollow so the count always reflects
  // the database value — no client-side arithmetic.
  const refetchFollowerCount = async () => {
    if (!username) return;
    setIsRefetchingCount(true);
    try {
      const res = await api.getUserProfile(username);
      if (res?.data?._count?.followers !== undefined) {
        setFollowerCount(res.data._count.followers);
      } else if (res?._count?.followers !== undefined) {
        // Handle response without wrapper
        setFollowerCount(res._count.followers);
      }
    } catch (err) {
      // Non-critical — silently ignore, stale count is still shown
      console.error("UserCard: failed to refetch follower count:", err);
    } finally {
      setIsRefetchingCount(false);
    }
  };

  // ── Follow / Unfollow ─────────────────────────────────────────────────────
  const handleFollow = async (e) => {
    e.stopPropagation();
    if (!firebaseUser || !id || isTogglingFollow) return;

    setIsTogglingFollow(true);

    // Flip the follow button state immediately so the UI feels responsive,
    // but DO NOT touch the follower count — that waits for the DB refetch.
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);

    try {
      const token = await firebaseUser.getIdToken();
      const res   = await api.toggleFollow(id, token);

      // Reconcile button state with what the server actually did
      if (res?.success && res?.data) {
        setIsFollowing(res.data.followed);
      }

      // Now fetch the real count from the DB — this is the only place the
      // follower count number changes. No ±1 arithmetic anywhere.
      await refetchFollowerCount();

    } catch (err) {
      console.error("Follow toggle failed:", err);
      // Revert the button state on error
      setIsFollowing(wasFollowing);
    } finally {
      setIsTogglingFollow(false);
    }
  };

  return (
    <div className="flex items-center gap-4 py-5 border-b border-[#E5E7EB] last:border-0">

      {/* Avatar */}
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

      {/* Info */}
      <div className="flex-1 min-w-0">
        {/* Name */}
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

        {/* @username */}
        {displayName && username && (
          <p className="text-xs text-[#6B7280] mt-0.5">@{username}</p>
        )}

        {/* Bio */}
        {bio && (
          <p className="text-sm text-[#6B7280] mt-1 line-clamp-2 leading-snug">
            {bio}
          </p>
        )}

        {/* Stats — follower count shows a spinner while re-fetching from DB */}
        <div className="flex items-center gap-4 mt-2 text-xs text-[#6B7280]">
          <span>
            <span className="font-semibold text-[#111827]">
              {formatCount(articleCount)}
            </span>{" "}
            {articleCount === 1 ? "Article" : "Articles"}
          </span>

          <span className="flex items-center gap-1">
            {isRefetchingCount ? (
              // Spinner replaces the number while the DB call is in-flight
              <Loader2 className="w-3 h-3 animate-spin text-[#1ABC9C]" />
            ) : (
              <span className="font-semibold text-[#111827]">
                {formatCount(followerCount)}
              </span>
            )}
            {" "}{followerCount === 1 && !isRefetchingCount ? "follower" : "followers"}
          </span>
        </div>
      </div>

      {/* Follow / Unfollow button */}
      <button
        onClick={handleFollow}
        disabled={isTogglingFollow || !firebaseUser}
        className={`flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 flex-shrink-0 min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed ${
          isFollowing
            ? "bg-[#1ABC9C] text-white border-[#1ABC9C] hover:bg-[#17a589] hover:border-[#17a589]"
            : "bg-white text-[#1ABC9C] border-[#1ABC9C] hover:bg-[#E8F8F5]"
        }`}
        aria-pressed={isFollowing}
        title={!firebaseUser ? "Sign in to follow" : undefined}
      >
        {isTogglingFollow ? (
          // Spinner while the follow API call is in-flight
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