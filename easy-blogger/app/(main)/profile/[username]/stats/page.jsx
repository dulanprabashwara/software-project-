"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../../../../context/AuthContext";
import { api } from "../../../../../lib/api";

export default function OtherUserStatsPage({ params }) {
  const unwrappedParams = use(params);
  const { username } = unwrappedParams;
  const searchParams = useSearchParams();
  const router = useRouter();

  const { user: firebaseUser, loading: authLoading } = useAuth();

  const urlTab = searchParams.get("tab") || "followers";
  const [activeTab, setActiveTab] = useState(urlTab);

  // Profile info (for the header name & counts)
  const [profile, setProfile] = useState(null);

  // Lists
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  // Track which users the logged-in user is following (in this list)
  const [followingSet, setFollowingSet] = useState(new Set());
  const [togglingIds, setTogglingIds] = useState(new Set());

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (urlTab) setActiveTab(urlTab);
  }, [urlTab]);

  // Fetch profile + lists once auth is resolved
  useEffect(() => {
    if (!username || authLoading) return;

    const load = async () => {
      setLoading(true);
      try {
        // 1. Fetch the profile to get the user's DB id and counts
        let profileRes;
        if (firebaseUser) {
          const token = await firebaseUser.getIdToken();
          profileRes = await api.getUserProfileAuth(username, token);
        } else {
          profileRes = await api.getUserProfile(username);
        }

        if (!profileRes.success) return;
        const profileData = profileRes.data;
        setProfile(profileData);

        // 2. Fetch followers & following in parallel using the DB id
        const [followersRes, followingRes] = await Promise.all([
          api.getFollowers(profileData.id),
          api.getFollowing(profileData.id),
        ]);

        const followersList = followersRes.success ? followersRes.data : [];
        const followingList = followingRes.success ? followingRes.data : [];

        setFollowers(followersList);
        setFollowing(followingList);

        // 3. If we are logged in, we already know who WE follow from  
        //    the [username]/page.jsx — but simpler here: mark profileData.isFollowing
        //    and also check the following list for mutual follows
        //    (Backend doesn't return isFollowing per person in these lists yet, 
        //     so we'll just pass an empty set for now — the toggle will work regardless)
      } catch (err) {
        console.error("Failed to load stats:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [username, firebaseUser, authLoading]);

  const handleToggleFollow = useCallback(
    async (userId, isCurrentlyFollowing) => {
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
    [firebaseUser]
  );

  const displayName = profile?.displayName || username;
  const fallbackAvatar = (name) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "?")}&background=1ABC9C&color=fff`;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
        onClick={() => router.back()}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[600px] flex flex-col pointer-events-auto">
          {/* Header */}
          <div className="p-6 border-b border-[#E5E7EB] shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-2xl font-bold text-[#111827]"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {displayName}
              </h2>
              <button
                onClick={() => router.back()}
                className="p-1 hover:bg-[#F9FAFB] rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-[#6B7280]" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab("followers")}
                className={`pb-3 text-sm font-medium transition-colors relative ${
                  activeTab === "followers" ? "text-[#111827]" : "text-[#6B7280]"
                }`}
              >
                <span className="mr-1">Followers</span>
                <span className="text-[#6B7280]">
                  {profile?._count?.followers ?? ""}
                </span>
                {activeTab === "followers" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1ABC9C]" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("following")}
                className={`pb-3 text-sm font-medium transition-colors relative ${
                  activeTab === "following" ? "text-[#111827]" : "text-[#6B7280]"
                }`}
              >
                <span className="mr-1">Following</span>
                <span className="text-[#6B7280]">
                  {profile?._count?.following ?? ""}
                </span>
                {activeTab === "following" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1ABC9C]" />
                )}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-6 flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-[#1ABC9C]" />
              </div>
            ) : (
              <>
                {/* Followers list */}
                {activeTab === "followers" && (
                  <div className="space-y-4">
                    {followers.length === 0 ? (
                      <p className="text-center text-gray-400 py-8 text-sm">
                        No followers yet.
                      </p>
                    ) : (
                      followers.map((person) => {
                        const isFollowing = followingSet.has(person.id);
                        const isToggling = togglingIds.has(person.id);
                        return (
                          <div
                            key={person.id}
                            className="flex items-center justify-between"
                          >
                            <Link
                              href={`/profile/${person.username}`}
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
                            {firebaseUser && (
                              <button
                                onClick={() =>
                                  handleToggleFollow(person.id, isFollowing)
                                }
                                disabled={isToggling}
                                className={`ml-4 shrink-0 px-4 py-1.5 text-sm rounded-full transition-colors disabled:opacity-50 ${
                                  isFollowing
                                    ? "text-[#6B7280] border border-[#E5E7EB] hover:bg-[#F9FAFB]"
                                    : "text-white bg-[#1ABC9C] hover:bg-[#17a589]"
                                }`}
                              >
                                {isToggling ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : isFollowing ? (
                                  "Following"
                                ) : (
                                  "Follow"
                                )}
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Following list */}
                {activeTab === "following" && (
                  <div className="space-y-4">
                    {following.length === 0 ? (
                      <p className="text-center text-gray-400 py-8 text-sm">
                        Not following anyone yet.
                      </p>
                    ) : (
                      following.map((person) => {
                        const isFollowing = followingSet.has(person.id);
                        const isToggling = togglingIds.has(person.id);
                        return (
                          <div
                            key={person.id}
                            className="flex items-center justify-between"
                          >
                            <Link
                              href={`/profile/${person.username}`}
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
                            {firebaseUser && (
                              <button
                                onClick={() =>
                                  handleToggleFollow(person.id, isFollowing)
                                }
                                disabled={isToggling}
                                className={`ml-4 shrink-0 px-4 py-1.5 text-sm rounded-full transition-colors disabled:opacity-50 ${
                                  isFollowing
                                    ? "text-[#6B7280] border border-[#E5E7EB] hover:bg-[#F9FAFB]"
                                    : "text-white bg-[#1ABC9C] hover:bg-[#17a589]"
                                }`}
                              >
                                {isToggling ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : isFollowing ? (
                                  "Following"
                                ) : (
                                  "Follow"
                                )}
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
