//easy-blogger\app\(main)\write\unpublished\page.jsx

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  FileText,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit,
  User,
  AlertCircle
} from "lucide-react";
import { getMyDrafts, deleteDraft } from "../../../../lib/articles/api";

const PAGE_SIZE = 20; // Load more at once for the slider

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
  // Track which article is being deleted to show the inline confirmation prompt
  const [deletingId, setDeletingId] = useState(null);
  // Track which article is being edited to show the 'As New' vs 'Existing' options
  const [editingId, setEditingId] = useState(null);
  // Controls the starting index of the horizontal carousel view
  const [currentIndex, setCurrentIndex] = useState(0);

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
    // We use a global click listener to automatically close any open edit or delete 
    // confirmation menus when the user clicks elsewhere, providing a cleaner UX.
    const handleClickOutside = (event) => {
      if (!event.target.closest(".interactive-controls")) {
        setEditingId(null);
        setDeletingId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setSelectedId(null);
    setCurrentIndex(0);
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
      isAiGenerated: Boolean(article.isAiGenerated),
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

  const handleDelete = async (id) => {
    try {
      await deleteDraft(id);
      setDraftArticles((prev) => prev.filter((a) => a.id !== id));
      setDeletingId(null);
      // If we delete the last visible article, move the slider back to prevent an empty view
      if (currentIndex > 0 && currentIndex >= draftArticles.length - 1) {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      showError(error.message || "Failed to delete article");
    }
  };

  const nextSlide = () => {
    // Ensures we don't scroll past the end of the article list (showing max 4 per view)
    if (currentIndex + 4 < displayedArticles.length) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    // Prevents negative indexing when scrolling back
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header same as Currently Developed Page (Stories) */}
      <header className="px-8 pt-10 pb-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold font-[Georgia] text-[#111827] mb-2">
              Unpublished Articles
            </h1>
            <p className="text-gray-400 text-sm">
              You can edit your Unpublished Articles here
            </p>
          </div>

          {/* Filter Section centered and styled as per image */}
          <div className="mt-12 flex flex-col items-center">
            <div className="flex gap-65 w-full max-w-4xl justify-center px-10">
              <button
                type="button"
                onClick={() => setActiveFilter(FILTERS.REGULAR)}
                className={`px-8 py-3 rounded-t-2xl font-bold text-sm transition-all ${activeFilter === FILTERS.REGULAR
                  ? "bg-[#E9FFF7] text-[#10B981]"
                  : "text-[#10B981]/60 hover:text-[#10B981]"
                  }`}
              >
                Regular Articles
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter(FILTERS.AI)}
                className={`px-8 py-3 rounded-t-2xl font-bold text-sm transition-all ${activeFilter === FILTERS.AI
                  ? "bg-[#E9FFF7] text-[#10B981]"
                  : "text-[#10B981]/60 hover:text-[#10B981]"
                  }`}
              >
                AI Generated Articles
              </button>
            </div>
            <div className="w-full max-w-7xl h-[2px] bg-[#99F6E4]" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        {errorMsg && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-red-600 border border-red-100 animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{errorMsg}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-10 h-10 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 font-medium">Loading your drafts...</p>
          </div>
        ) : displayedArticles.length === 0 ? (
          <EmptyState type={activeFilter} onCreate={handleCreateArticle} />
        ) : (
          <div className="relative group">
            {/* Slider Controls */}
            {currentIndex > 0 && (
              <button
                onClick={prevSlide}
                className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-xl border border-gray-100 flex items-center justify-center text-gray-400 hover:text-black hover:scale-110 transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {currentIndex + 4 < displayedArticles.length && (
              <button
                onClick={nextSlide}
                className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-xl border border-gray-100 flex items-center justify-center text-gray-400 hover:text-black hover:scale-110 transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Slider Content */}
            <div className="overflow-hidden">
              <div
                className="flex gap-6 transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentIndex * (100 / 4)}%)` }}
              >
                {displayedArticles.map((article) => (
                  <div
                    key={article.id}
                    className="min-w-[calc(25%-18px)] max-w-[calc(25%-18px)] flex-shrink-0"
                  >
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full group/card">
                      {/* We display the author and date prominently to help users identify their drafts quickly */}
                      <div className="p-4 flex items-center gap-3">
                        <img
                          src={article.profileImage}
                          alt={article.author}
                          className="h-8 w-8 rounded-full object-cover bg-gray-100"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold text-gray-900 truncate">
                            {article.author}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {article.date}
                          </span>
                        </div>
                      </div>

                      {/* Card Image */}
                      <div className="relative aspect-video w-full bg-gray-50 overflow-hidden">
                        {article.hasCover ? (
                          <img
                            src={article.image}
                            alt={article.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                            <FileText className="w-8 h-8" />
                            <span className="text-[10px] font-medium uppercase tracking-wider">No Cover Image</span>
                          </div>
                        )}
                      </div>

                      {/* Card Content */}
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex items-start gap-2 mb-2">
                          <h2 className="text-lg font-bold text-gray-900 leading-tight line-clamp-2 font-serif group-hover/card:text-[#10B981] transition-colors">
                            {article.title}
                          </h2>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {/* 
                             Badges provide immediate visual feedback on the article's 
                             origin (AI vs Human) and its current lifecycle state.
                          */}
                          {article.isEdited && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-tighter">
                              Edited
                            </span>
                          )}
                          {article.isEditAsNew && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-tighter">
                              Recreated
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed mb-4">
                          {article.desc}
                        </p>

                        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between interactive-controls">
                          {/* 
                            Inline confirmation prevents accidental deletions 
                            without requiring a disruptive modal popup. 
                          */}
                          {deletingId === article.id ? (
                            <div className="w-full animate-in fade-in zoom-in duration-200">
                              <p className="text-[11px] font-bold text-red-600 mb-2">
                                Do you want to delete this article?
                              </p>
                              <div className="flex gap-4 items-center mt-2">
                                <button
                                  onClick={() => handleDelete(article.id)}
                                  className="text-[11px] font-bold bg-red-600 text-white px-4 py-1.5 rounded-lg shadow-md hover:bg-red-700 transition-all active:scale-95"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setDeletingId(null)}
                                  className="text-[11px] font-bold text-gray-500 hover:text-black transition-colors"
                                >
                                  No
                                </button>
                              </div>
                            </div>
                          ) : editingId === article.id ? (
                            /* 
                              Split edit options allow the user to choose their 
                              preferred workflow (cloning vs modifying) directly from the card. 
                            */
                            <div className="flex w-full gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                              <button
                                onClick={() => router.push(`/write/edit-as-new?id=${article.id}`)}
                                className="flex-1 bg-black text-white text-[10px] font-bold py-2 rounded-lg hover:bg-gray-800 transition-colors"
                              >
                                EDIT AS NEW
                              </button>
                              <button
                                onClick={() => router.push(`/write/edit-existing?id=${article.id}`)}
                                className="flex-1 border border-black text-black text-[10px] font-bold py-2 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                EDIT EXISTING
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => setEditingId(article.id)}
                                className="flex items-center gap-2 text-sm font-bold text-black hover:text-[#10B981] transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                                <span>EDIT</span>
                              </button>
                              <button
                                onClick={() => setDeletingId(article.id)}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
