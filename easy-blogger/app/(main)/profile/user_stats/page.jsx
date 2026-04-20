"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import { api } from "../../../../lib/api";

export default function UserStatsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const { user: firebaseUser, userProfile, loading: authLoading } = useAuth();

  const urlTab = searchParams.get("tab") || "followers";
  const [activeTab, setActiveTab] = useState(urlTab);

  // Lists
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  // Track live follow state for users in the list
  const [followingSet, setFollowingSet] = useState(new Set());
  const [togglingIds, setTogglingIds] = useState(new Set());

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (urlTab) setActiveTab(urlTab);
  }, [urlTab]);

  // Fetch lists once auth is resolved and we have the userProfile (own id)
  useEffect(() => {
    if (authLoading || !userProfile?.id) return;

    const load = async () => {
      setLoading(true);
      try {
        const [followersRes, followingRes] = await Promise.all([
          api.getFollowers(userProfile.id),
          api.getFollowing(userProfile.id),
        ]);

        const followersList = followersRes.success ? followersRes.data : [];
        const followingList = followingRes.success ? followingRes.data : [];

        setFollowers(followersList);
        setFollowing(followingList);

        // Pre-populate the followingSet with people we already follow
        // (the "following" list contains users that the logged-in user follows)
        const alreadyFollowing = new Set(followingList.map((u) => u.id));
        setFollowingSet(alreadyFollowing);
      } catch (err) {
        console.error("Failed to load stats:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userProfile?.id, authLoading]);

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
    [firebaseUser],
  );

  const displayName = userProfile?.displayName || "My Profile";
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
                  activeTab === "followers"
                    ? "text-[#111827]"
                    : "text-[#6B7280]"
                }`}
              >
                <span className="mr-1">Followers</span>
                <span className="text-[#6B7280]">
                  {userProfile?._count?.followers ?? followers.length}
                </span>
                {activeTab === "followers" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1ABC9C]" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("following")}
                className={`pb-3 text-sm font-medium transition-colors relative ${
                  activeTab === "following"
                    ? "text-[#111827]"
                    : "text-[#6B7280]"
                }`}
              >
                <span className="mr-1">Following</span>
                <span className="text-[#6B7280]">
                  {userProfile?._count?.following ?? following.length}
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
                {/* Followers Tab */}
                {activeTab === "followers" && (
                  <div className="space-y-4">
                    {followers.length === 0 ? (
                      <p className="text-center text-gray-400 py-8 text-sm">
                        You have no followers yet. Share your profile to gain
                        some!
                      </p>
                    ) : (
                      followers.map((person) => {
                        const isFollowingPerson = followingSet.has(person.id);
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
                                src={
                                  person.avatarUrl ||
                                  fallbackAvatar(person.displayName)
                                }
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
                            <button
                              onClick={() => handleToggleFollow(person.id)}
                              disabled={isToggling}
                              className={`ml-4 shrink-0 px-4 py-1.5 text-sm rounded-full transition-colors disabled:opacity-50 ${
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
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Following Tab */}
                {activeTab === "following" && (
                  <div className="space-y-4">
                    {following.length === 0 ? (
                      <p className="text-center text-gray-400 py-8 text-sm">
                        You are not following anyone yet. Discover writers!
                      </p>
                    ) : (
                      following.map((person) => {
                        const isToggling = togglingIds.has(person.id);
                        const stillFollowing = followingSet.has(person.id);
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
                                src={
                                  person.avatarUrl ||
                                  fallbackAvatar(person.displayName)
                                }
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
                            <button
                              onClick={() => handleToggleFollow(person.id)}
                              disabled={isToggling}
                              className={`ml-4 shrink-0 px-4 py-1.5 text-sm rounded-full transition-colors disabled:opacity-50 ${
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
