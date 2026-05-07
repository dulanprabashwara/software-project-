"use client";

import { useRouter } from "next/navigation";
import InsightsSidebar from "../../../components/ai/InsightsSidebar";

/**
 * ArticlesView — "Previous Generations" view
 * Shows the user's AI article log list with delete / restore controls.
 */
export default function ArticlesView({
  articles,
  articlesLoading,
  deletedLog,
  restoreCountdown,
  showDeleteWarning,
  pendingSecondDelete,
  topAIArticles,
  trendingKeywords,
  setCurrentView,
  handleDeleteArticle,
  handleRestoreArticle,
  handleConfirmSecondDelete,
  handleCancelSecondDelete,
  fetchArticleLogs,
}) {
  const router = useRouter();

  return (
    <div className="flex min-h-full overflow-y-auto">
      <div className="ai-generator-main flex-1">
        <div className="ai-content-wrapper">

          {/* ── Header ── */}
          <div className="ai-generator-title justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView("input")}
                className="p-2 hover:bg-[#F8FAFC] rounded-lg transition-colors duration-150"
              >
                <img src="/icons/menu icon.png" alt="Menu" className="ai-generator-menu-icon" />
              </button>
              <img src="/icons/Ai article generator icon teel color.png" alt="AI" className="ai-generator-ai-icon" />
              <h1 className="ai-generator-title-text">AI Article Generator</h1>
            </div>
          </div>

          {/* ── Subheader: title + restore + new article button ── */}
          <div className="flex items-center justify-between mt-5">
            <div className="previous-generations">
              <div className="previous-generations-icon">
                <img src="/icons/chat.png" alt="Chat" className="w-4 h-4 icon-inverted" />
              </div>
              <span className="previous-generations-text">Previous Generations</span>
            </div>
            <div className="flex items-center gap-3">
              {deletedLog && (
                <div className="restore-wrapper">
                  <button
                    onClick={handleRestoreArticle}
                    className="restore-article-btn"
                    title={`Restore "${deletedLog.title}" (${restoreCountdown ?? 59}min left)`}
                  >
                    <img src="/icons/refresh-ccw-01.png" alt="Restore" className="w-4 h-4" />
                    {restoreCountdown !== null && (
                      <span className="restore-countdown">{restoreCountdown}m</span>
                    )}
                  </button>
                  {showDeleteWarning && (
                    <div className="delete-warning-callout">
                      <span className="delete-warning-icon">!</span>
                      Restore within 1 hour or this article will be permanently deleted.
                    </div>
                  )}
                </div>
              )}
              <button onClick={() => setCurrentView("input")} className="new-article-button">
                <span>+ New Article</span>
              </button>
            </div>
          </div>

          {/* ── Article list ── */}
          <div className="px-6 py-8">
            {articlesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1ABC9C]"></div>
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-12">
                <p className="articles-empty-message">
                  No unsaved articles. Generate a new one or check your drafts!
                </p>
              </div>
            ) : (
              <div className="articles-list">
                {articles.map((article) => (
                  <div
                    key={article.id}
                    className="article-label cursor-pointer hover:bg-gray-50 transition-colors article-label-container"
                    onClick={() => router.push(`/ai-generate/article/${article.id}`)}
                  >
                    <div className="article-title"><span>{article.title}</span></div>
                    <div className="article-date"><span>{article.date}</span></div>
                    <button
                      className="delete-article-btn"
                      onClick={(e) => handleDeleteArticle(article.id, e)}
                      title="Delete"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M3 6H5H21"                                                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6"             stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6"                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      <InsightsSidebar topAIArticles={topAIArticles} trendingKeywords={trendingKeywords} />

      {/* ── Second-delete confirmation overlay ── */}
      {pendingSecondDelete && (
        <div className="second-delete-overlay">
          <div className="second-delete-modal">
            <div className="second-delete-modal-header">
              <span className="second-delete-modal-icon">!</span>
              <h3 className="second-delete-modal-title">Permanent Deletion Warning</h3>
            </div>
            <p className="second-delete-modal-message">
              Your previously deleted article is still in the restore window. Proceeding will
              permanently remove it. Are you sure?
            </p>
            <div className="second-delete-modal-actions">
              <button className="second-delete-back"    onClick={handleCancelSecondDelete}>Back</button>
              <button className="second-delete-proceed" onClick={handleConfirmSecondDelete}>Proceed</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
