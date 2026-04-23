/**
 * AI Article Details Page
 * Route: /ai-generate/article/[id]
 *
 * Shows a read-only view of a previously AI-generated article log:
 * prompt, keywords used, length/tone settings, and the generated article title.
 * The article content opens in a preview overlay on title click.
 */

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import { useSubscription } from "../../../../context/SubscriptionContext";
import { fetchAPI } from "../../../../../lib/api";
import InsightsSidebar from "../../../../../components/ai/InsightsSidebar";
import "../../../../../styles/ai-article-generator/ai-article-generator.css";
import "../../../../../styles/ai-article-generator/ai-article-generator-view2.css";
import "../../../../../styles/ai-article-generator/ai-article-generator-details.css";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

const ARTICLE_LENGTH_LABELS = {
  short:        { left: "Short",      right: "300-1000"  },
  "mid-length": { left: "Mid-length", right: "1000-2000" },
  long:         { left: "Long",       right: "2000+"     },
};

export default function ArticleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { isPremium, isLoading } = useSubscription();

  const [articleData, setArticleData]       = useState(null);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [showPreview, setShowPreview]       = useState(false);
  const [isCopied, setIsCopied]             = useState(false);
  const [isSavingDraft, setIsSavingDraft]   = useState(false);
  const [draftSaveStatus, setDraftSaveStatus] = useState(null);
  const [isLoadingEditor, setIsLoadingEditor] = useState(false);

  // Sidebar data (same as main page — fetched once on load)
  const [topAIArticles, setTopAIArticles]   = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);

  // Reads the Firebase token from the current session.
  const getAuthHeaders = async () => {
    const token = await getAuth().currentUser?.getIdToken();
    if (!token) { router.push("/login"); throw new Error("Not authenticated"); }
    return { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };
  };

  // Fetches the full article log and sidebar data on mount.
  useEffect(() => {
    if (isLoading) return;
    if (!isPremium) { router.push("/subscription/upgrade"); return; }
    if (!params.id) return;

    const fetchAll = async () => {
      try {
        const headers = await getAuthHeaders();

        // Fetch article log
        const res  = await fetch(`${BACKEND_URL}/api/ai/logs/${params.id}`, { headers });
        if (!res.ok) {
          if (res.status === 404) throw new Error("Article not found.");
          throw new Error(`Server error: ${res.status}`);
        }
        const data = await res.json();
        if (!data.success || !data.log) throw new Error("Invalid response from server.");

        const log = data.log;
        setArticleData({
          textPrompt:            log.userPrompt,
          keywordsPresented:     log.keywordsPresented || [],
          keywordsSelected:      log.keywordsSelected  || [],
          articleLengthSelected: log.articleLength,
          toneSelected:          log.tone,
          title:                 log.articleTitle,
          content:               log.articleContent,
          wordCount:             log.wordCount,
          savedToDraftId:        log.savedToDraftId || null,
          generatedAt:           log.generatedAt,
        });

        if (log.savedToDraftId) setDraftSaveStatus("already_saved");

        // Fetch sidebar data
        const [aiRes, topicsRes] = await Promise.allSettled([
          fetch(`${BACKEND_URL}/api/ai/top-ai-articles`, { headers }),
          fetch(`${BACKEND_URL}/api/ai/trending-topics`, { headers }),
        ]);
        if (aiRes.status === "fulfilled" && aiRes.value.ok) {
          const d = await aiRes.value.json();
          if (d.success) setTopAIArticles(d.articles || []);
        }
        if (topicsRes.status === "fulfilled" && topicsRes.value.ok) {
          const d = await topicsRes.value.json();
          if (d.success) setTrendingTopics(d.topics || []);
        }
      } catch (err) {
        console.error("[ArticleDetail] Fetch failed:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [params.id, isPremium, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveDraftLabel = () => {
    if (isSavingDraft)                       return "saving...";
    if (draftSaveStatus === "saved")         return "saved ✓";
    if (draftSaveStatus === "already_saved") return "already saved";
    if (draftSaveStatus === "error")         return "save failed";
    return "save draft";
  };

  // Copies the full article (title + content) to the clipboard.
  const handleCopyToClipboard = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 6000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Saves the article as a draft in the articles table.
  const handleSaveDraft = async () => {
    if (!articleData) return;
    setIsSavingDraft(true);
    setDraftSaveStatus(null);
    try {
      const headers = await getAuthHeaders();
      const res     = await fetch(`${BACKEND_URL}/api/ai/save-draft`, {
        method: "POST", headers,
        body: JSON.stringify({ logId: params.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Save failed");
      setDraftSaveStatus(data.alreadySaved ? "already_saved" : "saved");
      if (!data.alreadySaved) setArticleData((prev) => ({ ...prev, savedToDraftId: data.draft.id }));
      setTimeout(() => setDraftSaveStatus(null), 4000);
    } catch (err) {
      console.error("[SaveDraft] Failed:", err);
      setDraftSaveStatus("error");
      setTimeout(() => setDraftSaveStatus(null), 4000);
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Opens the article in the TinyMCE editor at /write/create.
  // The editor picks up the most recently updated EDITING article on load.
  const handleEditInEditor = async () => {
    if (!articleData) return;
    setIsLoadingEditor(true);
    try {
      const headers = await getAuthHeaders();
      const res     = await fetch(`${BACKEND_URL}/api/ai/load-to-editor`, {
        method: "POST", headers,
        body: JSON.stringify({ logId: params.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to open in editor");
      router.push("/write/create");
    } catch (err) {
      console.error("[EditInEditor] Failed:", err);
      alert("Could not open in editor. Please try again.");
    } finally {
      setIsLoadingEditor(false);
    }
  };

  // ── Screen states ──────────────────────────────────────────────────────────

  if (isLoading || loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1ABC9C]"></div>
      </div>
    );
  }
  if (!isPremium) return null;

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#dc2626", marginBottom: "1rem" }}>
            Error Loading Article
          </h2>
          <p style={{ color: "#6b7280", marginBottom: "1rem" }}>{error}</p>
          <button
            onClick={() => router.push("/ai-generate")}
            className="px-4 py-2 bg-[#1ABC9C] text-white rounded-lg hover:bg-[#16A085] transition-colors"
          >
            Back to AI Generator
          </button>
        </div>
      </div>
    );
  }

  if (!articleData) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#6b7280", marginBottom: "1rem" }}>
            Article Not Found
          </h2>
          <button
            onClick={() => router.push("/ai-generate")}
            className="px-4 py-2 bg-[#1ABC9C] text-white rounded-lg hover:bg-[#16A085] transition-colors"
          >
            Back to AI Generator
          </button>
        </div>
      </div>
    );
  }

  const lengthDisplay = ARTICLE_LENGTH_LABELS[articleData.articleLengthSelected] || null;
  const isAlreadySaved = !!articleData.savedToDraftId;

  return (
    <div className="flex h-full">
      {/* ── Article Details Main Section ── */}
      <div className="ai-generator-main flex-1 overflow-y-auto article-details-page">
        <div className="ai-content-wrapper">

          <div className="ai-generator-title justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/ai-generate")}
                className="p-2 hover:bg-[#F8FAFC] rounded-lg transition-colors duration-150"
              >
                <img src="/icons/menu icon.png" alt="Menu" className="ai-generator-menu-icon" />
              </button>
              <img src="/icons/Ai article generator icon teel color.png" alt="AI Article Generator" className="ai-generator-ai-icon" />
              <h1 className="ai-generator-title-text">AI Article Generator</h1>
            </div>
          </div>

          {/* Original prompt — read-only */}
          <div className="user-input-section">
            <div className="user-textbox">
              <textarea
                value={articleData.textPrompt}
                readOnly
                className="bg-gray-50 cursor-not-allowed"
              />
              <span className="word-count">
                {articleData.textPrompt.trim().split(" ").filter((w) => w.length > 0).length}/50 words
              </span>
            </div>
          </div>

          {/* Keywords — read-only, selected ones highlighted */}
          <div className="selected-keywords-section">
            <div className="keyword-buttons-container">
              {articleData.keywordsPresented.length > 0 ? (
                articleData.keywordsPresented.map((keyword) => (
                  <button
                    key={keyword}
                    className={`keyword-button ${articleData.keywordsSelected.includes(keyword) ? "selected" : ""}`}
                    disabled
                  >
                    {keyword}
                  </button>
                ))
              ) : (
                <p style={{ color: "#6B7280", fontFamily: "Inter, sans-serif", fontSize: "14px" }}>
                  No keywords were matched for this article.
                </p>
              )}
            </div>
            {articleData.keywordsPresented.length > 0 && (
              <p className="selected-keywords-title">
                {articleData.keywordsSelected.length === 4
                  ? "selected: 4 keywords (Maximum)"
                  : `selected: ${articleData.keywordsSelected.length} keywords`}
              </p>
            )}
          </div>

          {/* Article length — read-only display */}
          <div className="article-length-section">
            <p className="article-length-text">Article Length :</p>
            <div className="article-length-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-header-content">
                  {lengthDisplay ? (
                    <>
                      <span className="dropdown-header-left">{lengthDisplay.left}</span>
                      <span className="dropdown-header-right">{lengthDisplay.right}</span>
                    </>
                  ) : (
                    <span className="dropdown-header-left" style={{ color: "#1ABC9C", fontStyle: "italic" }}>
                      Included in prompt
                    </span>
                  )}
                </div>
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path d="M1 1L6 6L11 1" stroke="#000000" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Tone — read-only */}
          <div className="tone-selection-section">
            <p className="tone-text">Tone :</p>
            {articleData.toneSelected ? (
              <div className="tone-options">
                {["professional", "casual", "humorous"].map((toneOption) => (
                  <div key={toneOption} className="tone-option">
                    <input
                      type="radio"
                      id={`tone-${toneOption}`}
                      name="tone"
                      value={toneOption}
                      checked={articleData.toneSelected === toneOption}
                      disabled
                      className="radio-button"
                    />
                    <label htmlFor={`tone-${toneOption}`} className="tone-label">{toneOption}</label>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#1ABC9C", fontFamily: "Inter, sans-serif", fontSize: "14px", fontStyle: "italic", marginLeft: "8px" }}>
                Included in prompt
              </p>
            )}
          </div>

          {/* Generated article result */}
          <div className="result-container">
            <div className="result-left-side"></div>
            <div className="result-right-side">
              <div className="article-title-label" onClick={() => setShowPreview(true)}>
                <span className="article-title-text">{articleData.title}</span>
                <svg className="open-book-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E1E1E" strokeWidth="2">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
              </div>
              <div className="article-actions">
                <button className="action-icon" title="Copy" onClick={() => handleCopyToClipboard(`${articleData.title}\n\n${articleData.content}`)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </button>
                <button className="action-icon" title="Like">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                  </svg>
                </button>
                <button className="action-icon" title="Dislike">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-3"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      <InsightsSidebar topAIArticles={topAIArticles} trendingTopics={trendingTopics} />

      {/* Article preview overlay */}
      {showPreview && articleData && (
        <div className="preview-overlay" onClick={() => setShowPreview(false)}>
          <div className="preview-close-circle" onClick={(e) => { e.stopPropagation(); setShowPreview(false); }}>
            <button className="preview-close-button-circle" onClick={() => setShowPreview(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
                <path d="M18 6L6 18"></path>
                <path d="M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <div className="preview-box" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <div className="preview-header-actions">
                <button
                  className="preview-copy-icon"
                  title="Copy"
                  onClick={() => handleCopyToClipboard(`${articleData.title}\n\n${articleData.content}`)}
                >
                  {isCopied ? (
                    <span className="preview-copied-message">copied to clipboard</span>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1ABC9C" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  )}
                </button>
                <button
                  className="preview-save-icon"
                  title="Save to drafts"
                  onClick={handleSaveDraft}
                  disabled={isSavingDraft || isAlreadySaved || draftSaveStatus === "saved"}
                  style={{
                    opacity: (isAlreadySaved || draftSaveStatus === "saved") ? 0.6 : 1,
                    cursor:  (isSavingDraft || isAlreadySaved || draftSaveStatus === "saved") ? "default" : "pointer",
                  }}
                >
                  <img src="/icons/Save.png" alt="Save" width="16" height="16" />
                  <span className="preview-save-text">{saveDraftLabel()}</span>
                </button>
                <button
                  className="preview-edit-button"
                  title="Edit in editor"
                  onClick={handleEditInEditor}
                  disabled={isLoadingEditor}
                  style={{ opacity: isLoadingEditor ? 0.6 : 1, cursor: isLoadingEditor ? "default" : "pointer" }}
                >
                  <span className="preview-edit-text">{isLoadingEditor ? "opening..." : "edit"}</span>
                </button>
              </div>
            </div>

            <div className="preview-content">
              <div className="preview-article-info">
                <h3 className="preview-article-title">{articleData.title}</h3>
                <p className="preview-article-excerpt">{articleData.content}</p>
              </div>
            </div>

            <div className="preview-footer">
              <span className="preview-word-count">
                word count: {articleData.wordCount ?? articleData.content.split(" ").length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}