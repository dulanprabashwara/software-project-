"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ARTICLES = [
  {
    id: "a1",
    author: "Emma Richardson",
    date: "Dec 4, 2025",
    title: "How AI is Transforming Content Creation in 2025",
    desc:
      "Explore the latest developments in artificial intelligence and how they are revolutionizing the way we create, curate, and consume content across digital platforms.",
    image: "/images/Unpublished_IMG/robot.jpg",
    profileImage: "/images/Unpublished_IMG/profile.jpg",
  },
  {
    id: "a2",
    author: "Emma Richardson",
    date: "Dec 3, 2025",
    title: "The Complete Guide to Building Scalable Web Applications",
    desc:
      "Learn the essential principles, patterns, and best practices for creating web applications that can handle millions of users while maintaining performance and reliability.",
    image: "/images/Unpublished_IMG/code.jpg",
    profileImage: "/images/Unpublished_IMG/profile.jpg",
  },
];

const MORE_ARTICLES = [
  {
    id: "a3",
    author: "Emma Richardson",
    date: "Dec 2, 2025",
    title: "UI/UX Principles for Modern Web Apps",
    desc:
      "A practical guide to spacing, typography, colors, and interaction patterns that make web apps feel clean and professional.",
    image: "/images/Unpublished_IMG/uiux.jpg",
    profileImage: "/images/Unpublished_IMG/profile.jpg",
  },
  {
    id: "a4",
    author: "Emma Richardson",
    date: "Dec 1, 2025",
    title: "Optimizing React Performance for Large Projects",
    desc:
      "Learn how to avoid unnecessary re-renders, use memoization effectively, and keep your React app fast as it grows.",
    image: "/images/Unpublished_IMG/react.jpg",
    profileImage: "/images/Unpublished_IMG/profile.jpg",
  },
  {
    id: "a5",
    author: "Emma Richardson",
    date: "Nov 30, 2025",
    title: "Best Practices for API Design in 2025",
    desc:
      "From REST conventions to pagination and error handling—build APIs that are easy to use and maintain.",
    image: "/images/Unpublished_IMG/api.jpg",
    profileImage: "/images/Unpublished_IMG/profile.jpg",
  },
  {
    id: "a6",
    author: "Emma Richardson",
    date: "Nov 29, 2025",
    title: "PostgreSQL Tips for Content Platforms",
    desc:
      "Indexes, full-text search, schema design, and query optimization ideas for article-based applications.",
    image: "/images/Unpublished_IMG/postgres.jpg",
    profileImage: "/images/Unpublished_IMG/profile.jpg",
  },
];

export default function Page() {
  const [selectedId, setSelectedId] = useState(null); // none selected initially
  const [errorMsg, setErrorMsg] = useState(""); //popup error message
  const [errorTarget, setErrorTarget] = useState(null); 
  const router = useRouter();  

  const [activeTab, setActiveTab] = useState("regular"); // "regular" | "ai"

  const [draftArticles, setDraftArticles] = useState([]);

  const PAGE_SIZE = 3;

  // Regular tab pagination (drafts)
  const [regularVisibleCount, setRegularVisibleCount] = useState(PAGE_SIZE);

  // AI tab pagination (dummy list)
  const AI_ALL = [...ARTICLES, ...MORE_ARTICLES];
  const [aiVisibleCount, setAiVisibleCount] = useState(PAGE_SIZE);


  const toggleSelect = (id) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  // show popup and auto-hide after 2.5s
  const showError = (msg, target) => {
    setErrorMsg(msg);
    setErrorTarget(target);

    setTimeout(() => {
      setErrorMsg("");
      setErrorTarget(null);
    }, 2500);
  };

  const handleEditAsNew = () => {
    if (!selectedId) return showError("Select an article before edit", "new");

    //use the real draftArticles list (full content + coverImage)
    const original = draftArticles.find((a) => a.id === selectedId);
    if (!original) return showError("Selected article not found", "new");

    localStorage.removeItem("draft_edit_as_new");
    sessionStorage.setItem(
      "edit_as_new_seed",
      JSON.stringify({
        sourceId: original.id,
        title: original.title || "",
        content: original.content || "",
        coverImage: original.coverImage || null,
        writerName: original.writerName || "Unknown Writer",
      })
    );

    router.push("/write/edit-as-new");
  };

  const handleEditExisting = () => {
    if (!selectedId) return showError("Select an article before edit", "existing");
    router.push(`/write/edit-existing/${selectedId}`);
  };

  const handleSeeMore = () => {
    if (activeTab === "regular") {
      setRegularVisibleCount((prev) => Math.min(prev + PAGE_SIZE, draftArticles.length));
    } else {
      setAiVisibleCount((prev) => Math.min(prev + PAGE_SIZE, AI_ALL.length));
    }
  };

  const hasMore =
    activeTab === "regular"
      ? regularVisibleCount < draftArticles.length
      : aiVisibleCount < AI_ALL.length;
    const loadDrafts = async () => {
      const res = await fetch("/api/articles?status=draft");
      const data = await res.json();
      setDraftArticles(data.articles || []);
    };

  useEffect(() => {
    loadDrafts();
  }, []);

  useEffect(() => {
    if (activeTab === "regular") {
      setRegularVisibleCount(PAGE_SIZE);
    }
  }, [draftArticles, activeTab]);

  // Decide which list to show in the UI
  const displayedArticles =
  activeTab === "regular"
    ? draftArticles
        .slice(0, regularVisibleCount) //show only first N drafts
        .map((d) => ({
          id: d.id,
          author: d.writerName || "Unknown Writer",
          date: new Date(d.updatedAt || d.date || Date.now()).toLocaleDateString(),
          title: d.title || "(Untitled)",
          desc: d.content
            ? String(d.content).replace(/<[^>]*>/g, "").slice(0, 160) + "..."
            : "No content yet.",
          image: d.coverImage || null,
          hasCover: Boolean(d.coverImage),
          profileImage: "/images/Unpublished_IMG/profile.jpg",
        }))
    : AI_ALL.slice(0, aiVisibleCount); //show only first N AI dummy articles

  return (
    <div className="min-h-screen bg-linear-to-br from-[#E8F5F1] via-[#F0F9FF] to-[#FDF4FF] flex items-center justify-center p-6">
       
        
      <div className="w-full max-w-6xl">
        <div className="bg-white rounded-2xl shadow-2xl p-12">
                <div className="mb-6 flex justify-start">
                  <button
                    onClick={() => router.push("/stories")}
                    className="rounded-full bg-[#10B981] px-6 py-2 text-white shadow-md hover:bg-[#0EA371] transition"
                  >
                    Go to Stories
                  </button>
                </div>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif font-bold text-[#111827] mb-3">
              Unpublished Articles
            </h1>
            <p className="text-[#6B7280] text-base">
              You can edit your unpublished articles here.
            </p>

            {/* Filter Tabs */}
            <div className="flex justify-center mt-10">
              <div className="w-full max-w-4xl">
                <div className="flex items-end justify-between px-15">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("regular");
                      setSelectedId(PAGE_SIZE);
                    }}
                    className={`px-16 py-3 rounded-t-xl text-lg font-medium transition ${
                      activeTab === "regular"
                      ? "bg-[#E9FFF7] text-[#10B981]"
                      : "text-[#10B981]/70 hover:text-[#10B981]"
                    }`}
                  >
                    Regular Articles
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("ai");
                      setSelectedId(PAGE_SIZE);
                    }}
                    className={`px-16 py-3 rounded-t-xl text-lg font-medium transition ${
                      activeTab === "ai"
                      ? "bg-[#E9FFF7] text-[#10B981]"
                      : "text-[#10B981]/70 hover:text-[#10B981]"
                    }`}
                  >
                    AI Generated Articles
                  </button>
                </div>

                <div className="mt-1 border-t-2 border-[#10B981]" />
              </div>
            </div>
          </div>

          {/*<div className="mt-8 border-t border-black/20" />*/}

          {/* Articles */}
          <div className="mt-10 space-y-10">
            {displayedArticles.map((a, idx) => {
              const active = a.id === selectedId;

              return (
                <div key={a.id}>
                  <button
                    type="button"
                    onClick={() => toggleSelect(a.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start gap-10">
                      {/* marker */}
                      <div className="w-14 shrink-0 flex justify-center">
                        {!active ? (
                          <div className="mt-1 h-10 w-10 rounded bg-gray-200 border border-gray-400"/>
                        ) : (
                          <div className="mt-1 h-10 w-10 rounded-full bg-[#22C55E] flex items-center justify-center">
                            <svg
                              width="22"
                              height="22"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M20 6L9 17L4 12"
                                stroke="white"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* content + image (IMPORTANT: same flex row) */}
                      <div className="flex flex-1 items-start justify-between gap-10">
                        {/* text */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 text-sm text-[#6B7280]">
                            <img
                            src={a.profileImage}
                            alt={a.author}
                            className="h-8 w-8 rounded-full object-cover border border-black/10"
                            />

                            <span className="font-medium">{a.author}</span>
                            <span className="opacity-60">·</span>
                            <span>{a.date}</span>
                          </div>

                          <h2 className="mt-4 text-3xl font-serif font-bold text-[#111827]">
                            {a.title}
                          </h2>

                          <p className="mt-3 text-[#6B7280] leading-relaxed max-w-2xl">
                            {a.desc}
                          </p>
                        </div>

                        {/* image */}
                        <div className="w-[220px] shrink-0 flex justify-end">
                          <div className="h-28 w-40 overflow-hidden rounded-md bg-black/10 flex items-center justify-center">
                            {a.hasCover ? (
                              <img
                                src={a.image}
                                alt={a.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex flex-col items-center gap-2 text-[#6B7280]">
                                {/* Image icon */}
                                <svg
                                  width="28"
                                  height="28"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                <path
                                  d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                                <path
                                  d="M3 17l5-5a2 2 0 0 1 3 0l3 3"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                                <path
                                  d="M14 15l1-1a2 2 0 0 1 3 0l3 3"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                                <circle
                                  cx="9"
                                  cy="8"
                                  r="1.5"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                />
                                </svg>

                                <span className="text-[11px]">Add cover later</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>

                  {idx !== displayedArticles.length - 1 ? (
                    <div className="mt-10 border-t border-black/10" />
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="mt-12 border-t border-black/10" />
          {hasMore && (
            <>
            <div className="mt-10 flex justify-center">
              <button
              type="button"
              className="see-more-btn"
              onClick={handleSeeMore}
              >
                See more
              </button>
            </div>
            </>
          )}

          <div className="mt-10 border-t-2 border-black/100" />

          <div className="mt-8 flex items-center justify-between px-6">

          {/* Edit as New */}
          <div className="flex flex-col items-center">
            {errorMsg && errorTarget === "new" && (
              <div className="mb-3 bg-red-100 text-red-700 px-4 py-2 rounded-lg shadow-md">
                {errorMsg}
              </div>
            )}
            <button
              onClick={handleEditAsNew}
              className="rounded-full bg-black px-10 py-4 text-white shadow-lg hover:opacity-90">
                Edit as New
            </button>
            
          </div>

            <button
              onClick={() => router.push("/write/choose-method")}
              className="rounded-full bg-[#10B981] px-14 py-4 text-white font-medium shadow-lg hover:bg-[#0EA371]">
                Back
            </button>

            {/* Edit Existing */}
            <div className="flex flex-col items-center">
              {errorMsg && errorTarget === "existing" && (
              <div className="mb-3 bg-red-100 text-red-700 px-4 py-2 rounded-lg shadow-md">
                {errorMsg}
              </div>
              )}
              <button
                onClick={handleEditExisting}
                className="rounded-full bg-black px-10 py-4 text-white shadow-lg hover:opacity-90">
                  Edit Existing
              </button>
            
            </div>
         </div>
        </div>
      </div>
    </div>
  );
}
