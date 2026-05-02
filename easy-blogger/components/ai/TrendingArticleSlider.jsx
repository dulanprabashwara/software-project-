"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, Star, Clock, Bookmark, MoreHorizontal } from "lucide-react";
import { useAuth } from "../../app/context/AuthContext";
import { useRouter } from "next/navigation";

const SLIDE_INTERVAL_MS = 15000;

function formatPublishDate(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

// Rotating slider that displays one trending article at a time.
export default function TrendingArticleSlider({ articles = [] }) {
  const router = useRouter();
  const { user: firebaseUser } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedMap, setSavedMap]         = useState({});
  const [savingMap, setSavingMap]       = useState({});
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!articles.length) return;
    setSavedMap(Object.fromEntries(articles.map((a) => [a.id, Boolean(a.isSaved)])));
  }, [articles]);

  useEffect(() => {
    if (!articles.length) return;
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, [articles.length]);

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

  const handleDotClick = (index) => {
    setCurrentIndex(index);
    resetInterval();
  };

  const handleArticleClick = (id) => router.push(`/home/read?id=${id}`);

  // Saves or unsaves an article using the same endpoint as ArticleCard and SearchArticleCard.
  const handleBookmarkToggle = async (articleId) => {
    if (!firebaseUser || savingMap[articleId]) return;

    const next = !savedMap[articleId];
    setSavedMap((prev)  => ({ ...prev, [articleId]: next }));
    setSavingMap((prev) => ({ ...prev, [articleId]: true }));

    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/savedArticle`, {
        method:  next ? "POST" : "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ articleId }),
      });

      if (!res.ok) throw new Error("Failed to sync bookmark.");
    } catch (err) {
      setSavedMap((prev) => ({ ...prev, [articleId]: !next }));
      console.error("Bookmark toggle failed:", err.message || err);
    } finally {
      setSavingMap((prev) => ({ ...prev, [articleId]: false }));
    }
  };

  if (!articles.length) return null;

  const article  = articles[currentIndex];
  const isSaved  = savedMap[article.id] ?? false;
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

            <div className="author-info">
              {article.author?.avatarUrl ? (
                <img
                  src={article.author.avatarUrl}
                  alt={article.author.displayName}
                  className="author-image"
                />
              ) : (
                <div className="author-image author-image-fallback">
                  {article.author?.displayName?.[0]?.toUpperCase() || "?"}
                </div>
              )}
              <div className="author-details">
                <span className="author-name">
                  {article.author?.displayName || "Unknown"}
                </span>
                <span className="publish-date">
                  · {formatPublishDate(article.publishedAt || article.createdAt)}
                </span>
              </div>
            </div>

            <h3
              className="slider-article-title"
              onClick={() => handleArticleClick(article.id)}
            >
              {article.title}
            </h3>

            {article.summary && (
              <p className="article-description line-clamp-3">{article.summary}</p>
            )}

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

          <div className="stat-item stat-rating">
            <Star className="stat-icon-lucide stat-icon-rating" strokeWidth={1.5} />
            <span className="stat-number stat-number-rating">
              {article.averageRating > 0
                ? Number(article.averageRating).toFixed(1)
                : "New"}
            </span>
            <span className="stat-number stat-number-muted">
              ({article.ratingCount ?? 0})
            </span>
          </div>

          {article.readingTime > 0 && (
            <div className="stat-item stat-button">
              <Clock className="stat-icon-lucide" strokeWidth={1.5} />
              <span className="stat-number">{article.readingTime} min read</span>
            </div>
          )}

          <div className="slider-actions-right">
            <button
              className={`slider-icon-btn${isSaved ? " slider-icon-btn--saved" : ""}`}
              onClick={() => handleBookmarkToggle(article.id)}
              disabled={isSaving || !firebaseUser}
              aria-pressed={isSaved}
              title={!firebaseUser ? "Sign in to save" : isSaved ? "Saved" : "Save for later"}
            >
              <Bookmark
                className={`slider-icon-lucide${isSaved ? " slider-icon-lucide--saved" : ""}`}
                strokeWidth={1.5}
              />
            </button>
            <button className="slider-icon-btn">
              <MoreHorizontal className="slider-icon-lucide" strokeWidth={1.5} />
            </button>
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

    </div>
  );
}