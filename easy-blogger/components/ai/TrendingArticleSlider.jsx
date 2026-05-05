"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, Star, Clock, Bookmark, MoreHorizontal, BadgeCheck, Sparkles, Flag } from "lucide-react";
import { useAuth } from "../../app/context/AuthContext";
import { useRouter } from "next/navigation";

const SLIDE_INTERVAL_MS = 15000;

function formatPublishDate(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

// Truncates plain text at the last word boundary before maxChars.
function truncateAtWordBoundary(text, maxChars = 200) {
  if (!text || text.length <= maxChars) return text;
  const cut = text.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + "...";
}

// Rotating slider that displays one trending article at a time.
export default function TrendingArticleSlider({ articles = [], savedArticles = [] }) {
  const router = useRouter();
  const { user, profileLoading } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedMap,     setSavedMap]     = useState({});
  const [savingMap,    setSavingMap]    = useState({});
  const intervalRef = useRef(null);

  // Report state applies to whichever article is currently displayed.
  const [moreOptions,       setMoreOptions]       = useState(false);
  const [isReportOpen,      setIsReportOpen]      = useState(false);
  const [reportReason,      setReportReason]      = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [isReporting,       setIsReporting]       = useState(false);

  // Derive stable string keys to avoid infinite re-renders caused by new
  // array references on every parent render.
  const articleIdKey   = articles.map((a) => a.id).join(",");
  const savedIdKey     = savedArticles.map((a) => a.id).join(",");

  useEffect(() => {
    if (!articles.length) return;
    const savedIds = new Set(savedArticles.map((a) => a.id));
    setSavedMap(Object.fromEntries(articles.map((a) => [a.id, savedIds.has(a.id)])));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleIdKey, savedIdKey]);

  useEffect(() => {
    if (!articles.length) return;
    intervalRef.current = setInterval(
      () => setCurrentIndex((prev) => (prev + 1) % articles.length),
      SLIDE_INTERVAL_MS
    );
    return () => clearInterval(intervalRef.current);
  }, [articles.length]);

  // Close dropdowns when the slide changes.
  useEffect(() => {
    setMoreOptions(false);
    setIsReportOpen(false);
  }, [currentIndex]);

  const resetInterval = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(
      () => setCurrentIndex((prev) => (prev + 1) % articles.length),
      SLIDE_INTERVAL_MS
    );
  };

  const handleSlide = (direction) => {
    if (!articles.length) return;
    setCurrentIndex((prev) =>
      direction === "next"
        ? (prev + 1) % articles.length
        : (prev - 1 + articles.length) % articles.length
    );
    resetInterval();
  };

  const handleDotClick = (index) => { setCurrentIndex(index); resetInterval(); };
  const handleArticleClick = (id) => router.push(`/home/read?id=${id}`);

  const handleBookmarkToggle = async (articleId) => {
    if (!user || savingMap[articleId]) return;
    const next = !savedMap[articleId];
    setSavedMap((prev)  => ({ ...prev, [articleId]: next }));
    setSavingMap((prev) => ({ ...prev, [articleId]: true }));
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/savedArticle`, {
        method:  next ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body:    JSON.stringify({ articleId }),
      });
      if (!res.ok) throw new Error("Failed to sync bookmark.");
    } catch (err) {
      setSavedMap((prev) => ({ ...prev, [articleId]: !next }));
      console.error("Bookmark toggle failed:", err.message || err);
    } finally {
      setSavingMap((prev) => ({ ...prev, [articleId]: false }));
    }
  };

  const handleReportSubmit = async () => {
    if (!user) { alert("You must be logged in to report an article."); return; }
    setIsReporting(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/articleReports`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body:    JSON.stringify({ articleId: article.id, reason: reportReason, description: reportDescription }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit report");
      }
      alert("Thank you. The report has been sent to our team.");
      setIsReportOpen(false);
      setReportReason("");
      setReportDescription("");
    } catch (err) {
      alert(err.message || "Something went wrong.");
    } finally {
      setIsReporting(false);
    }
  };

  if (!articles.length) return null;

  const article  = articles[currentIndex];
  const isSaved  = savedMap[article.id]  ?? false;
  const isSaving = savingMap[article.id] ?? false;
  const DOT_COUNT = Math.min(articles.length, 5);

  return (
    <div className="trending-slider">

      <button onClick={() => handleSlide("prev")} className="slider-chevron slider-chevron-left">
        <img src="/icons/doble chevron icon  (2).png" alt="Previous" />
      </button>

      <div className="slider-body">

        <div className="slider-content">
          <div className="slider-left-content">

            {/* Author row with username, premium badge and AI tag */}
            <div className="author-info">
              {article.author?.avatarUrl ? (
                <img src={article.author.avatarUrl} alt={article.author.displayName} className="author-image" />
              ) : (
                <div className="author-image author-image-fallback">
                  {article.author?.displayName?.[0]?.toUpperCase() || "?"}
                </div>
              )}
              <div className="author-details">
                <span className="author-name">
                  {article.author?.displayName || "Unknown"}
                  {article.author?.username && (
                    <span className="text-xs text-gray-400 ml-1">@{article.author.username}</span>
                  )}
                  {article.author?.isPremium && (
                    <BadgeCheck className="inline w-4 h-4 text-[#1ABC9C] ml-1 align-middle" title="Premium Author" />
                  )}
                </span>
                <span className="publish-date">
                  · {formatPublishDate(article.publishedAt || article.createdAt)}
                </span>
              </div>
              {article.isAiGenerated && (
                <span className="flex items-center gap-1 text-[10px] font-semibold border border-[#1ABC9C] text-[#1ABC9C] bg-purple-50 px-2 py-0.5 rounded-full ml-2">
                  <Sparkles className="w-3 h-3" /> AI Generated
                </span>
              )}
            </div>

            <h3 className="slider-article-title" onClick={() => handleArticleClick(article.id)}>
              {article.title}
            </h3>

            {article.summary ? (
              <p className="article-description line-clamp-3">
                {truncateAtWordBoundary(article.summary)}
              </p>
            ) : article.content ? (
              <div
                className="article-description line-clamp-3"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            ) : null}
          </div>

          <div className="slider-right-content">
            {article.coverImage ? (
              <img src={article.coverImage} alt="Article cover" className="cover-image" />
            ) : (
              <div className="cover-image cover-image-placeholder">
                <svg width="40" height="40" fill="none" stroke="#1ABC9C" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
        </div>

        <div className="article-stats">

          <button className="stat-item stat-button">
            <MessageCircle className="stat-icon-lucide" strokeWidth={1.5} />
            <span className="stat-number">{article.commentCount ?? 0}</span>
          </button>

          {/* Star intentionally not filled — outline only */}
          <button className="stat-item stat-button">
            <Star className="stat-icon-lucide" strokeWidth={1.5} />
            <span className="stat-number">
              {article.averageRating > 0 ? Number(article.averageRating).toFixed(1) : "New"}
            </span>
            <span className="stat-number">({article.ratingCount ?? 0})</span>
          </button>

          {article.readingTime > 0 && (
            <div className="stat-item stat-button">
              <Clock className="stat-icon-lucide" strokeWidth={1.5} />
              <span className="stat-number">{article.readingTime} min read</span>
            </div>
          )}

          <div className="slider-actions-right relative">
            <button
              className={`slider-icon-btn${isSaved ? " slider-icon-btn--saved" : ""}`}
              onClick={() => handleBookmarkToggle(article.id)}
              disabled={isSaving || profileLoading || !user}
              aria-pressed={isSaved}
              title={!user ? "Sign in to save" : isSaved ? "Saved" : "Save for later"}
            >
              <Bookmark
                className={`slider-icon-lucide${isSaved ? " slider-icon-lucide--saved" : ""}`}
                strokeWidth={1.5}
              />
            </button>

            <button
              className="slider-icon-btn"
              onClick={() => setMoreOptions(!moreOptions)}
            >
              <MoreHorizontal className="slider-icon-lucide" strokeWidth={1.5} />
            </button>

            {moreOptions && (
              <div className="absolute right-0 top-full mt-1 flex flex-col bg-white w-36 border border-[#e5e7eb] rounded-xl drop-shadow-lg z-50 overflow-hidden">
                <button
                  onClick={() => { setIsReportOpen(true); setMoreOptions(false); }}
                  className="flex items-center gap-3 w-full h-10 px-4 hover:bg-red-50 transition-colors"
                >
                  <Flag className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-red-500">Report</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {articles.length > 1 && (
          <div className="slider-dots">
            {Array.from({ length: DOT_COUNT }).map((_, i) => (
              <button
                key={i}
                className={`slider-dot${i === currentIndex % DOT_COUNT ? " slider-dot--active" : ""}`}
                onClick={() => handleDotClick(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <button onClick={() => handleSlide("next")} className="slider-chevron slider-chevron-right">
        <img src="/icons/doble chevron icon  (1).png" alt="Next" />
      </button>

      {isReportOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Report Article</h3>
            <input
              type="text"
              className="w-full border border-gray-200 rounded-lg p-2 mb-3 focus:ring-2 focus:ring-red-500 outline-none"
              placeholder="Reason (e.g. Spam, Harassment)"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            />
            <textarea
              className="w-full border border-gray-200 rounded-lg p-2 mb-4 h-24 focus:ring-2 focus:ring-red-500 outline-none resize-none"
              placeholder="Provide details..."
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setIsReportOpen(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleReportSubmit}
                disabled={isReporting || !reportReason}
                className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg disabled:opacity-50 hover:bg-red-600 transition-colors"
              >
                {isReporting ? "Sending..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}