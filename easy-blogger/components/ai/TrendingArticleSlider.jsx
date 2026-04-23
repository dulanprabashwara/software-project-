"use client";

import { useState, useEffect, useRef } from "react";

const SLIDE_INTERVAL_MS = 15000;

// Formats an ISO date string into a readable "Jan 1, 2025" format.
function formatPublishDate(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

// Displays a rotating slider of trending articles with navigation chevrons.
// Receives the articles array as a prop — the parent is responsible for fetching.
export default function TrendingArticleSlider({ articles = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);

  // Auto-advance the slider every 15 seconds.
  useEffect(() => {
    if (!articles.length) return;
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, [articles.length]);

  // Manual navigation resets the auto-advance timer.
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
      <button onClick={() => handleSlide("prev")} className="slider-chevron">
        <img src="/icons/doble chevron icon  (2).png" alt="Previous" className="slider-chevron" />
      </button>

      <div className="slider-content">
        <div className="slider-left-content">
          <div className="author-info">
            {article.author?.avatarUrl ? (
              <img src={article.author.avatarUrl} alt={article.author.displayName} className="author-image" />
            ) : (
              <div className="author-image" style={{ backgroundColor: "#D6EFEB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#1ABC9C" }}>
                {article.author?.displayName?.[0] || "?"}
              </div>
            )}
            <div className="author-details">
              <span className="author-name">{article.author?.displayName || "Unknown"}</span>
              <span className="publish-date">{formatPublishDate(article.createdAt)}</span>
            </div>
          </div>

          <h3 className="article-title">{article.title}</h3>

          {article.summary && (
            <p className="article-description">{article.summary}</p>
          )}

          <div className="article-stats">
            <div className="stat-item">
              <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="stat-number">{article._count?.comments ?? 0}</span>
            </div>
            <div className="stat-item">
              <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span className="stat-number">{article._count?.likes ?? 0}</span>
            </div>
          </div>
        </div>

        <div className="slider-right-content">
          {article.coverImage ? (
            <img src={article.coverImage} alt="Article cover" className="cover-image" />
          ) : (
            <div className="cover-image" style={{ backgroundColor: "#D6EFEB", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="40" height="40" fill="none" stroke="#1ABC9C" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <div className="bookmark-wrapper">
            <svg className="bookmark-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <svg className="three-dots-icon" fill="none" stroke="#1ABC9C" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="1" fill="#1ABC9C" />
              <circle cx="19" cy="12" r="1" fill="#1ABC9C" />
              <circle cx="5"  cy="12" r="1" fill="#1ABC9C" />
            </svg>
          </div>
        </div>
      </div>

      <button onClick={() => handleSlide("next")} className="slider-chevron">
        <img src="/icons/doble chevron icon  (1).png" alt="Next" className="slider-chevron" />
      </button>
    </div>
  );
}
