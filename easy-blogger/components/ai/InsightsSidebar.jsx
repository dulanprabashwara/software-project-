"use client";

import { useRouter } from "next/navigation";

// Reusable sidebar that appears on all AI generator views.
// Shows top AI-assisted articles (fetched from backend) and trending keyword buttons.
// topAIArticles and trendingKeywords are passed in as props from the parent page.

export default function InsightsSidebar({ topAIArticles = [], trendingKeywords = [] }) {
  const router = useRouter();

  const handleArticleClick = (id) => router.push(`/home/read?id=${id}`);

  return (
    <div className="insights-sidebar">
      <div className="insights-header">
        <h2 className="insights-title">Insights</h2>
        <div className="insights-dots">
          <div className="insights-dot-1"></div>
          <div className="insights-dot-2"></div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="insights-section-title">Top AI Assisted Articles</h3>
        <div className="space-y-3">
          {topAIArticles.map((article, index) => (
            <div key={article.id || index} className="insights-article-section">
              <div className="insights-article-header">
                <span className="insights-article-number">{index + 1}</span>
                <h4
                  className="insights-article-name"
                  onClick={() => handleArticleClick(article.id)}
                >
                  {article.title}
                </h4>
              </div>
              <div className="insights-author-section">
                <p className="insights-author-name">{article.author?.displayName || "Unknown"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="insights-section-title">Trending Keywords</h3>
        <div className="trending-topics-buttons">
          {trendingKeywords.map((topic, index) => (
            <button key={index} className="topic-button">{topic.keyword}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
