"use client";

import { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Star,
  Bookmark,
  MoreHorizontal,
} from "lucide-react";

const SLIDE_INTERVAL_MS = 15000;

// Formats an ISO date string to a short readable form: "Dec 1, 2021"
function formatPublishDate(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

// Rotating slider that displays one trending article at a time.
// Articles are passed in from the parent — the parent is responsible for fetching.
// Article fields used: id, title, summary, coverImage, createdAt, ratingCount,
// commentCount, author.displayName, author.avatarUrl
export default function TrendingArticleSlider({ articles = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);

  // Auto-advances every 15 seconds — resets when user navigates manually.
  useEffect(() => {
    if (!articles.length) return;
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, [articles.length]);

  const handleSlide = (direction) => {
    if (!articles.length) return;
    setCurrentIndex((prev) =>
      direction === "next"
        ? (prev + 1) % articles.length
        : (prev - 1 + articles.length) % articles.length
    );
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(
      () => setCurrentIndex((prev) => (prev + 1) % articles.length),
      SLIDE_INTERVAL_MS
    );
  };

  if (!articles.length) return null;

  const article = articles[currentIndex];

  return (
    <div className="trending-slider">
      <button onClick={() => handleSlide("prev")} className="slider-chevron slider-chevron-left">
        <img src="/icons/doble chevron icon  (2).png" alt="Previous" />
      </button>

      <div className="slider-content">
        <div className="slider-left-content">
          <div className="author-info">
            {article.author?.avatarUrl ? (
              <img src={article.author.avatarUrl} alt={article.author.displayName} className="author-image" />
            ) : (
              <div className="author-image author-image-fallback">
                {article.author?.displayName?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <div className="author-details">
              <span className="author-name">{article.author?.displayName || "Unknown"}</span>
              <span className="publish-date">· {formatPublishDate(article.createdAt)}</span>
            </div>
          </div>

          <h3 className="slider-article-title">{article.title}</h3>

          {article.summary && (
            <p className="article-description line-clamp-3">{article.summary}</p>
          )}

          <div className="article-stats">
            <button className="stat-item stat-button">
              <MessageCircle className="stat-icon-lucide" strokeWidth={1.5} />
              <span className="stat-number">{article.commentCount ?? 0}</span>
            </button>
            <button className="stat-item stat-button">
              <Star className="stat-icon-lucide" strokeWidth={1.5} />
              <span className="stat-number">{article.ratingCount ?? 0}</span>
            </button>
            <div className="slider-actions-right">
              <button className="slider-icon-btn">
                <Bookmark className="slider-icon-lucide" strokeWidth={1.5} />
              </button>
              <button className="slider-icon-btn">
                <MoreHorizontal className="slider-icon-lucide" strokeWidth={1.5} />
              </button>
            </div>
          </div>
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

      <button onClick={() => handleSlide("next")} className="slider-chevron slider-chevron-right">
        <img src="/icons/doble chevron icon  (1).png" alt="Next" />
      </button>
    </div>
  );
}
