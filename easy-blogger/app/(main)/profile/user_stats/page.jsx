/**
 * Current User Stats Page - Modal-Style Statistics View
 *
 * Route: /profile/user_stats
 *
 * Purpose: Displays YOUR OWN Followers, Following, Reads, and Shares
 * in a centered modal-style card with horizontal tabs.
 * The outside of the modal appears blurred.
 *
 * Used for: Logged-in user viewing their own stats only
 * isOwnProfile is always true here
 */

"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { X } from "lucide-react";

export default function UserStatsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get tab from URL parameter, default to "followers"
  const urlTab = searchParams.get("tab") || "followers";

  // Track which tab/section is currently active
  const [activeTab, setActiveTab] = useState(urlTab);

  // Update active tab when URL changes
  useEffect(() => {
    if (urlTab) {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  // This page is ALWAYS for the current user's own profile
  const isOwnProfile = true;

  // Mock user data - would come from auth/session
  const stats = {
    name: "Emma Richardson",
    followers: "2,400",
    following: 142,
    reads: "45.2K",
    shares: 892,
  };

  // Mock data for lists
  const followers = [
    {
      id: 1,
      name: "Sarah Chen",
      title: "AI Researcher & Tech Writer",
      avatar: "https://i.pravatar.cc/150?img=1",
      isFollowing: false,
    },
    {
      id: 2,
      name: "David Miller",
      title: "Frontend Developer",
      avatar: "https://i.pravatar.cc/150?img=2",
      isFollowing: true,
    },
    {
      id: 3,
      name: "James Wilson",
      title: "Product Manager",
      avatar: "https://i.pravatar.cc/150?img=3",
      isFollowing: false,
    },
    {
      id: 4,
      name: "Emily Davis",
      title: "UX Designer",
      avatar: "https://i.pravatar.cc/150?img=4",
      isFollowing: true,
    },
    {
      id: 5,
      name: "Michael Brown",
      title: "Data Scientist",
      avatar: "https://i.pravatar.cc/150?img=5",
      isFollowing: false,
    },
  ];

  const following = [
    {
      id: 1,
      name: "David Miller",
      title: "Frontend Developer",
      avatar: "https://i.pravatar.cc/150?img=2",
    },
    {
      id: 2,
      name: "Emily Davis",
      title: "UX Designer",
      avatar: "https://i.pravatar.cc/150?img=4",
    },
    {
      id: 3,
      name: "Jessica Taylor",
      title: "Digital Nomad",
      avatar: "https://i.pravatar.cc/150?img=6",
    },
  ];

  const reads = [
    {
      id: 1,
      title: "The Future of AI in 2026",
      author: "Sarah Chen",
      date: "Jan 2, 2026",
      readTime: "5 min read",
    },
    {
      id: 2,
      title: "Mastering React Patterns",
      author: "David Miller",
      date: "Jan 1, 2026",
      readTime: "8 min read",
    },
    {
      id: 3,
      title: "Design Systems 101",
      author: "Emily Davis",
      date: "Dec 28, 2025",
      readTime: "6 min read",
    },
    {
      id: 4,
      title: "Remote Work Culture",
      author: "Jessica Taylor",
      date: "Dec 25, 2025",
      readTime: "4 min read",
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

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-100"
        onClick={() => router.back()}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-101 p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-150 flex flex-col pointer-events-auto">
          {/* Modal Header */}
          <div className="p-6 border-b border-[#E5E7EB]">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-2xl font-bold text-[#111827]"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {stats.name}
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
                <span className="text-[#6B7280]">{stats.followers}</span>
                {activeTab === "followers" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1ABC9C]"></div>
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
                <span className="text-[#6B7280]">{stats.following}</span>
                {activeTab === "following" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1ABC9C]"></div>
                )}
              </button>

              <button
                onClick={() => setActiveTab("reads")}
                className={`pb-3 text-sm font-medium transition-colors relative ${
                  activeTab === "reads" ? "text-[#111827]" : "text-[#6B7280]"
                }`}
              >
                <span className="mr-1">Reads</span>
                <span className="text-[#6B7280]">{stats.reads}</span>
                {activeTab === "reads" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1ABC9C]"></div>
                )}
              </button>

              <button
                onClick={() => setActiveTab("shares")}
                className={`pb-3 text-sm font-medium transition-colors relative ${
                  activeTab === "shares" ? "text-[#111827]" : "text-[#6B7280]"
                }`}
              >
                <span className="mr-1">Shares</span>
                <span className="text-[#6B7280]">{stats.shares}</span>
                {activeTab === "shares" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1ABC9C]"></div>
                )}
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="overflow-y-auto p-6 h-112.5">
            {/* Followers Tab */}
            {activeTab === "followers" && (
              <div className="space-y-4">
                {followers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <p className="font-semibold text-[#111827] text-sm">
                          {user.name}
                        </p>
                        <p className="text-xs text-[#6B7280]">{user.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {user.isFollowing ? (
                        <button className="px-4 py-1.5 text-sm text-[#6B7280] border border-[#E5E7EB] rounded-full hover:bg-[#F9FAFB] transition-colors">
                          Following
                        </button>
                      ) : (
                        <button className="px-4 py-1.5 text-sm text-white bg-[#1ABC9C] rounded-full hover:bg-[#17a589] transition-colors">
                          Follow
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Following Tab */}
            {activeTab === "following" && (
              <div className="space-y-4">
                {following.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <p className="font-semibold text-[#111827] text-sm">
                          {user.name}
                        </p>
                        <p className="text-xs text-[#6B7280]">{user.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-4 py-1.5 text-sm text-[#6B7280] border border-[#E5E7EB] rounded-full hover:bg-[#F9FAFB] transition-colors">
                        Message
                      </button>
                      <button className="px-4 py-1.5 text-sm text-[#6B7280] border border-[#E5E7EB] rounded-full hover:bg-[#F9FAFB] transition-colors">
                        Unfollow
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reads Tab */}
            {activeTab === "reads" && (
              <div className="space-y-5">
                {reads.map((article) => (
                  <div
                    key={article.id}
                    className="border-b border-[#E5E7EB] pb-4 last:border-0"
                  >
                    <h3 className="font-semibold text-[#111827] mb-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-[#6B7280]">
                      {article.author} · {article.date} · {article.readTime}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Shares Tab */}
            {activeTab === "shares" && (
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
          </div>
        </div>
      </div>
    </>
  );
}
