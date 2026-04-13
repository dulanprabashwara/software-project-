// components/search/UserCard.jsx
// ─────────────────────────────────────────────────────────────────────────────
"use client";

import { useRouter } from "next/navigation";
import { BadgeCheck, UserPlus, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../app/context/AuthContext";
import { api } from "../../lib/api";

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

  // isFollowing comes from backend bulk-check (search.service.js)
  const [isFollowing,       setIsFollowing]       = useState(user.isFollowing ?? false);
  const [followerCount,     setFollowerCount]      = useState(
    stats?.totalFollowers ?? _count?.followers ?? 0
  );
  const [isTogglingFollow,  setIsTogglingFollow]  = useState(false);
  const [isRefetchingCount, setIsRefetchingCount] = useState(false);

  const articleCount = stats?.articleCount ?? _count?.articles ?? 0;

  const avatarSrc =
    avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      displayName || username || "U"
    )}&background=1ABC9C&color=fff`;

  const handleProfileClick = () => {
    if (username) router.push(`/profile/${username}`);
  };

  // Refetch the real follower count from DB after every toggle
  const refetchFollowerCount = async () => {
    if (!username) return;
    setIsRefetchingCount(true);
    try {
      const res = await api.getUserProfile(username);
      const count = res?.data?._count?.followers ?? res?._count?.followers;
      if (count !== undefined) setFollowerCount(count);
    } catch (err) {
      console.error("UserCard: failed to refetch follower count:", err);
    } finally {
      setIsRefetchingCount(false);
    }
  };

  const handleFollow = async (e) => {
    e.stopPropagation();
    if (!firebaseUser || !id || isTogglingFollow) return;

    setIsTogglingFollow(true);
    const wasFollowing = isFollowing;
    // Flip button immediately — count stays until DB confirms
    setIsFollowing(!wasFollowing);

    try {
      const token = await firebaseUser.getIdToken();
      const res   = await api.toggleFollow(id, token);

      if (res?.success && res?.data) {
        setIsFollowing(res.data.followed);
      }

      // Fetch real count from DB — the only place the number changes
      await refetchFollowerCount();

    } catch (err) {
      console.error("Follow toggle failed:", err);
      setIsFollowing(wasFollowing);
    } finally {
      setIsTogglingFollow(false);
    }
  };

  return (
    // BORDER FIX: removed `last:border-0` — last card now keeps its border-b
    <div className="flex items-center gap-4 py-5 border-b border-[#E5E7EB]">

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

        {displayName && username && (
          <p className="text-xs text-[#6B7280] mt-0.5">@{username}</p>
        )}

        {bio && (
          <p className="text-sm text-[#6B7280] mt-1 line-clamp-2 leading-snug">
            {bio}
          </p>
        )}

        {/* Stats — follower count replaced by spinner during DB refetch */}
        <div className="flex items-center gap-4 mt-2 text-xs text-[#6B7280]">
          <span>
            <span className="font-semibold text-[#111827]">
              {formatCount(articleCount)}
            </span>{" "}
            {articleCount === 1 ? "Article" : "Articles"}
          </span>
          <span className="flex items-center gap-1">
            {isRefetchingCount ? (
              <Loader2 className="w-3 h-3 animate-spin text-[#1ABC9C]" />
            ) : (
              <span className="font-semibold text-[#111827]">
                {formatCount(followerCount)}
              </span>
            )}{" "}
            {followerCount === 1 && !isRefetchingCount ? "follower" : "followers"}
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
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <>
            {!isFollowing && <UserPlus className="w-3.5 h-3.5" strokeWidth={2} />}
            <span>{isFollowing ? "Following" : "Follow"}</span>
          </>
        )}
      </button>
    </div>
  );
}