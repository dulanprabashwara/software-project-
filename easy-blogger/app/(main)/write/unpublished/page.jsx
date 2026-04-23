//easy-blogger\app\(main)\write\unpublished\page.jsx

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, FileText } from "lucide-react";
import { getMyDrafts } from "../../../../lib/articles/api";

const PAGE_SIZE = 6;

const FILTERS = {
  REGULAR: "regular",
  AI: "ai",
};

function stripHtml(value) {
  return String(value || "").replace(/<[^>]*>/g, "").trim();
}

function formatDraftDate(value) {
  if (!value) return "Recently updated";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently updated";

  return date.toLocaleDateString();
}

function buildFilterOptions(activeFilter) {
  return {
    isAiGenerated:
      activeFilter === FILTERS.AI
        ? true
        : activeFilter === FILTERS.REGULAR
          ? false
          : undefined,
  };
}

function EmptyState({ type, onCreate }) {
  const isAi = type === FILTERS.AI;

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#D1D5DB] bg-[#F9FAFB] px-6 py-16 text-center animate-pulse">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
        {isAi ? (
          <Bot className="h-8 w-8 text-[#6B7280]" />
        ) : (
          <FileText className="h-8 w-8 text-[#6B7280]" />
        )}
      </div>

      <h2 className="text-2xl font-semibold text-[#111827]">
        {isAi
          ? "You haven't created AI Generated articles yet"
          : "You haven't created Regular articles yet"}
      </h2>

      <p className="mt-3 max-w-xl text-[#6B7280]">
        {isAi
          ? "Start with AI and save your generated work as a draft to view it here."
          : "Start writing and save your article as a draft to view it here."}
      </p>

      <button
        type="button"
        onClick={onCreate}
        className="mt-8 rounded-full bg-[#10B981] px-8 py-3 text-white font-medium shadow-md transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#0EA371]"
      >
        Let&apos;s Create your Article now
      </button>
    </div>
  );
}

export default function UnpublishedArticlesPage() {
  const router = useRouter();

  const [activeFilter, setActiveFilter] = useState(FILTERS.REGULAR);
  const [selectedId, setSelectedId] = useState(null);
  const [draftArticles, setDraftArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [totalDrafts, setTotalDrafts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const toggleSelect = useCallback((id) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  const showError = useCallback((message) => {
    setErrorMsg(message);

    window.setTimeout(() => {
      setErrorMsg("");
    }, 2500);
  }, []);

  const loadDrafts = useCallback(
    async (nextPage = 1, filter = activeFilter) => {
      const isFirstPage = nextPage === 1;

      try {
        if (isFirstPage) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }

        const response = await getMyDrafts(
          nextPage,
          PAGE_SIZE,
          buildFilterOptions(filter),
        );

        const drafts = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.articles)
            ? response.articles
            : [];

        const total =
          response?.pagination?.total ??
          response?.meta?.total ??
          response?.total ??
          0;

        setDraftArticles((prev) =>
          isFirstPage ? drafts : [...prev, ...drafts],
        );
        setTotalDrafts(total);
        setPage(nextPage);
      } catch (error) {
        console.error("Failed to load draft articles:", error);
        showError(error?.message || "Failed to load drafts.");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [activeFilter, showError],
  );

  useEffect(() => {
    setSelectedId(null);
    void loadDrafts(1, activeFilter);
  }, [activeFilter, loadDrafts]);

  const displayedArticles = useMemo(() => {
    return draftArticles.map((article) => ({
      id: article.id,
      author:
        article.author?.displayName ||
        article.author?.username ||
        "Unknown Writer",
      date: formatDraftDate(article.updatedAt),
      title: article.title || "Untitled",
      desc: stripHtml(article.content).slice(0, 160) || "No content yet.",
      image: article.coverImage || null,
      hasCover: Boolean(article.coverImage),
      isEdited: Boolean(article.isEdited),
      isEditAsNew: Boolean(article.isEditAsNew),
      profileImage:
        article.author?.avatarUrl || "/images/Unpublished_IMG/profile.jpg",
    }));
  }, [draftArticles]);

  const hasMore = totalDrafts > draftArticles.length;

  const handleSeeMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return;
    void loadDrafts(page + 1, activeFilter);
  }, [activeFilter, hasMore, isLoadingMore, loadDrafts, page]);

  const handleEditAsNew = useCallback(() => {
    if (!selectedId) {
      showError("Select an article before editing.");
      return;
    }

    router.push(`/write/edit-as-new?id=${selectedId}`);
  }, [router, selectedId, showError]);

  const handleEditExisting = useCallback(() => {
    if (!selectedId) {
      showError("Select an article before editing.");
      return;
    }

    router.push(`/write/edit-existing?id=${selectedId}`);
  }, [router, selectedId, showError]);

  const handleCreateArticle = useCallback(() => {
    router.push("/write/choose-method");
  }, [router]);

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
            <p className="text-[#9CA3AF] text-base">
              You can edit your Unpublished Articles
            </p>

            <div className="mt-10 flex justify-center">
              <div className="w-full max-w-4xl">
                <div className="flex items-end justify-between px-16">
                  <button
                    type="button"
                    onClick={() => setActiveFilter(FILTERS.REGULAR)}
                    className={`px-12 py-3 rounded-t-xl text-base font-medium transition ${
                      activeFilter === FILTERS.REGULAR
                        ? "bg-[#E9FFF7] text-[#10B981]"
                        : "text-[#10B981]/70 hover:text-[#10B981]"
                    }`}
                  >
                    Regular Articles
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveFilter(FILTERS.AI)}
                    className={`px-12 py-3 rounded-t-xl text-base font-medium transition ${
                      activeFilter === FILTERS.AI
                        ? "bg-[#E9FFF7] text-[#10B981]"
                        : "text-[#10B981]/70 hover:text-[#10B981]"
                    }`}
                  >
                    AI Generated Articles
                  </button>
                </div>

                <div className="mt-1 border-t-2 border-[#99F6E4]" />
              </div>
            </div>
          </div>

          {errorMsg ? (
            <div className="mb-6 rounded-lg bg-red-100 px-4 py-3 text-red-700">
              {errorMsg}
            </div>
          ) : null}

          {isLoading ? (
            <div className="py-16 text-center text-[#6B7280]">
              Loading drafts...
            </div>
          ) : displayedArticles.length === 0 ? (
            <EmptyState type={activeFilter} onCreate={handleCreateArticle} />
          ) : (
            <>
              <div className="mt-10 space-y-10">
                {displayedArticles.map((article, index) => {
                  const isActive = article.id === selectedId;

                  return (
                    <div key={article.id}>
                      <button
                        type="button"
                        onClick={() => toggleSelect(article.id)}
                        className="w-full text-left"
                      >
                        <div className="flex items-start gap-10">
                          <div className="w-14 shrink-0 flex justify-center">
                            {!isActive ? (
                              <div className="mt-1 h-10 w-10 rounded bg-gray-200 border border-gray-400" />
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

                          <div className="flex flex-1 items-start justify-between gap-10">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 text-sm text-[#6B7280]">
                                <img
                                  src={article.profileImage}
                                  alt={article.author}
                                  className="h-8 w-8 rounded-full object-cover border border-black/10"
                                />
                                <span className="font-medium">
                                  {article.author}
                                </span>
                                <span className="opacity-60">·</span>
                                <span>{article.date}</span>
                              </div>

                              <div className="mt-4 flex items-center gap-3">
                                <h2 className="text-3xl font-serif font-bold text-[#111827]">
                                  {article.title}
                                </h2>

                                {article.isEdited ? (
                                  <span className="rounded-full bg-[#FEF3C7] px-3 py-1 text-xs font-medium text-[#92400E]">
                                    Edited
                                  </span>
                                ) : null}

                                {article.isEditAsNew ? (
                                  <span className="rounded-full bg-[#DBEAFE] px-3 py-1 text-xs font-medium text-[#1D4ED8]">
                                    Recreated
                                  </span>
                                ) : null}
                              </div>

                              <p className="mt-3 text-[#6B7280] leading-relaxed max-w-2xl">
                                {article.desc}
                              </p>
                            </div>

                            <div className="w-55 shrink-0 flex justify-end">
                              <div className="h-28 w-40 overflow-hidden rounded-md bg-black/10 flex items-center justify-center">
                                {article.hasCover ? (
                                  <img
                                    src={article.image}
                                    alt={article.title}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex flex-col items-center gap-2 text-[#6B7280]">
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

                                    <span className="text-[11px]">
                                      Add cover later
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>

                      {index !== displayedArticles.length - 1 ? (
                        <div className="mt-10 border-t border-black/10" />
                      ) : null}
                    </div>
                  );
                })}
              </div>

              {hasMore ? (
                <div className="mt-10 flex justify-center">
                  <button
                    type="button"
                    onClick={handleSeeMore}
                    disabled={isLoadingMore}
                    className="rounded-full bg-[#6B7280] px-8 py-3 text-white shadow-md transition hover:bg-[#4B5563] disabled:opacity-60"
                  >
                    {isLoadingMore ? "Loading..." : "See more"}
                  </button>
                </div>
              ) : null}
            </>
          )}

          <div className="mt-10 border-t-2 border-black" />

          <div className="mt-8 flex items-center justify-between px-6">
            <button
              onClick={handleEditAsNew}
              className="rounded-full bg-black px-10 py-4 text-white shadow-lg hover:opacity-90"
            >
              Edit as New
            </button>

            <button
              onClick={() => router.push("/write/choose-method")}
              className="rounded-full bg-[#10B981] px-14 py-4 text-white font-medium shadow-lg hover:bg-[#0EA371]"
            >
              Back
            </button>

            <button
              onClick={handleEditExisting}
              className="rounded-full bg-black px-10 py-4 text-white shadow-lg hover:opacity-90"
            >
              Edit Existing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}