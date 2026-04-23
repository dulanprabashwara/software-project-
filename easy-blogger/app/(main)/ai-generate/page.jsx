/**
 * AI Article Generator — Main Page
 * Route: /ai-generate
 *
 * Views (controlled by `currentView` state):
 *   "input"    — trending slider + prompt textarea (View 1)
 *   "keywords" — keyword selection, length & tone, generate button (View 2/3)
 *   "articles" — list of previous AI-generated article logs
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useSubscription } from "../../subscription/SubscriptionContext";
import { fetchAPI } from "../../../lib/api";
import InsightsSidebar from "../../../components/ai/InsightsSidebar";
import TrendingArticleSlider from "../../../components/ai/TrendingArticleSlider";
import "../../../styles/ai-article-generator/ai-article-generator.css";
import "../../../styles/ai-article-generator/ai-article-generator-view2.css";
import "../../../styles/ai-article-generator/articles-view.css";

const AI_TIMEOUT_MS = 300000; // 5 minutes — AI generation can be slow

// Formats an ISO date string to "YYYY-MM-DD h:mm AM/PM".
function formatDate(isoString) {
  if (!isoString) return "";
  const d    = new Date(isoString);
  const year = d.getFullYear();
  const mon  = String(d.getMonth() + 1).padStart(2, "0");
  const day  = String(d.getDate()).padStart(2, "0");
  let   h    = d.getHours();
  const min  = String(d.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${year}-${mon}-${day} ${h}:${min} ${ampm}`;
}

export default function AIArticleGeneratorPage() {
  const router = useRouter();
  const { isPremium, isLoading } = useSubscription();

  // ── View + prompt state ────────────────────────────────────────────────────
  const [currentView, setCurrentView] = useState("input");
  const [userInput, setUserInput]     = useState("");
  const [inputError, setInputError]   = useState("");

  // ── Prompt analysis results (from /api/ai/analyze) ────────────────────────
  const [sessionId, setSessionId]                 = useState(null);
  const [aiKeywords, setAiKeywords]               = useState([]);
  const [hasLengthInPrompt, setHasLengthInPrompt] = useState(false);
  const [hasToneInPrompt, setHasToneInPrompt]     = useState(false);
  const [noKeywordsFound, setNoKeywordsFound]     = useState(false);

  // ── Article settings state ─────────────────────────────────────────────────
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [articleLength, setArticleLength]       = useState("short");
  const [tone, setTone]                         = useState("professional");
  const [isDropdownOpen, setIsDropdownOpen]     = useState(false);

  // ── Loading + error state ──────────────────────────────────────────────────
  const [isLoadingTransition, setIsLoadingTransition] = useState(false);
  const [transitionError, setTransitionError]         = useState(null);
  const [isGenerating, setIsGenerating]               = useState(false);
  const [generateError, setGenerateError]             = useState(null);

  // ── Generated article state ────────────────────────────────────────────────
  const [generatedArticle, setGeneratedArticle] = useState(null);
  const [isSavingDraft, setIsSavingDraft]       = useState(false);
  const [draftSaveStatus, setDraftSaveStatus]   = useState(null);
  const [isLoadingEditor, setIsLoadingEditor]   = useState(false);

  // ── Preview overlay state ──────────────────────────────────────────────────
  const [showPreview, setShowPreview]                     = useState(false);
  const [isCursorInsidePreview, setIsCursorInsidePreview] = useState(false);
  const [isCopied, setIsCopied]                           = useState(false);

  // ── Delete / restore state ─────────────────────────────────────────────────
  const [deletedLog, setDeletedLog]             = useState(null);
  const [restoreCountdown, setRestoreCountdown] = useState(null);
  const restoreTimerRef                         = useRef(null);

  // ── Article logs list (previous generations) ──────────────────────────────
  const [articles, setArticles]               = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(false);

  // ── Sidebar data ───────────────────────────────────────────────────────────
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [topAIArticles, setTopAIArticles]       = useState([]);
  const [trendingTopics, setTrendingTopics]     = useState([]);

  // ── Refs for cleanup ───────────────────────────────────────────────────────
  const analyzeTimeoutRef  = useRef(null);
  const generateTimeoutRef = useRef(null);
  const errorResetRef      = useRef(null);
  // Prevents state updates after the component unmounts (e.g. refresh mid-generation).
  const isMountedRef       = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearTimeout(analyzeTimeoutRef.current);
      clearTimeout(generateTimeoutRef.current);
      clearTimeout(errorResetRef.current);
      clearInterval(restoreTimerRef.current);
    };
  }, []);

  // Redirect non-premium users to the upgrade page.
  useEffect(() => {
    if (!isLoading && !isPremium) router.push("/subscription/upgrade");
  }, [isPremium, isLoading, router]);

  // Show/hide body loading class while the page or AI is loading.
  useEffect(() => {
    document.body.classList.toggle("loading", isLoading || isGenerating);
    return () => document.body.classList.remove("loading");
  }, [isLoading, isGenerating]);

  // ── Auth helper ────────────────────────────────────────────────────────────
  // Waits for Firebase to re-initialize after a browser refresh before reading the token.
  const getAuthHeaders = async () => {
    try {
      const auth = getAuth();
      const user = await new Promise((resolve, reject) => {
        if (auth.currentUser) { resolve(auth.currentUser); return; }
        const unsub = onAuthStateChanged(auth, (u) => {
          unsub();
          u ? resolve(u) : reject(new Error("No authenticated user"));
        });
        setTimeout(() => { unsub(); reject(new Error("Auth timeout")); }, 5000);
      });
      const token = await user.getIdToken();
      return { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };
    } catch {
      if (isMountedRef.current) router.push("/login");
      throw new Error("Not authenticated");
    }
  };

  // ── Data fetching ──────────────────────────────────────────────────────────

  // Fetches trending articles (all articles, for the slider) from the trending endpoint.
  const fetchTrendingArticles = async () => {
    try {
      const data = await fetchAPI("/api/articles/trending");
      if (data.success && data.articles) setTrendingArticles(data.articles);
    } catch (err) {
      console.error("[Slider] Failed to fetch trending articles:", err);
    }
  };

  // Fetches top AI-assisted articles for the Insights sidebar.
  const fetchTopAIArticles = async () => {
    try {
      const headers = await getAuthHeaders();
      const res     = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/ai/top-ai-articles`, { headers });
      const data    = await res.json();
      if (data.success && data.articles) setTopAIArticles(data.articles);
    } catch (err) {
      console.error("[Insights] Failed to fetch top AI articles:", err);
    }
  };

  // Fetches trending keyword topics for the Insights sidebar.
  const fetchTrendingTopics = async () => {
    try {
      const headers = await getAuthHeaders();
      const res     = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/ai/trending-topics`, { headers });
      const data    = await res.json();
      if (data.success) setTrendingTopics(data.topics || []);
    } catch (err) {
      console.error("[Insights] Failed to fetch trending topics:", err);
    }
  };

  // Fetches the user's previous AI article logs (unsaved drafts list).
  const fetchArticleLogs = async () => {
    setArticlesLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res     = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/ai/logs`, { headers });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.logs)) {
        setArticles(data.logs.map((log) => ({
          id:    log.id,
          title: log.articleTitle,
          date:  formatDate(log.generatedAt),
        })));
      }
    } catch (err) {
      console.error("[ArticleLogs] Failed:", err);
    } finally {
      setArticlesLoading(false);
    }
  };

  // Load all data once authentication is confirmed.
  useEffect(() => {
    if (isLoading || !isPremium) return;
    fetchTrendingArticles();
    fetchTopAIArticles();
    fetchTrendingTopics();
    fetchArticleLogs();
  }, [isLoading, isPremium]); // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh trending slider and sidebar every hour (trending scores update hourly).
  useEffect(() => {
    if (isLoading || !isPremium) return;
    const hourlyRefresh = setInterval(() => {
      fetchTrendingArticles();
      fetchTopAIArticles();
    }, 60 * 60 * 1000);
    return () => clearInterval(hourlyRefresh);
  }, [isLoading, isPremium]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Input handlers ─────────────────────────────────────────────────────────

  const validateUserInput = (text) => {
    if (!/[a-zA-Z]/.test(text)) { setInputError("Please enter a valid text!"); return false; }
    setInputError(""); return true;
  };

  const handleUserInputChange = (e) => {
    const text  = e.target.value;
    const words = text.trim().split(" ");
    if (words.length <= 50) { setUserInput(text); setInputError(""); }
  };

  const handleKeywordToggle = (keyword) => {
    setSelectedKeywords((prev) =>
      prev.includes(keyword)
        ? prev.filter((k) => k !== keyword)
        : prev.length < 4 ? [...prev, keyword] : prev
    );
  };

  const getArticleLengthDisplay = () => {
    const opts = {
      short:        { left: "Short",      right: "300-1000"  },
      "mid-length": { left: "Mid-length", right: "1000-2000" },
      long:         { left: "Long",       right: "2000+"     },
    };
    return opts[articleLength] || opts.short;
  };

  // ── Article log delete / restore ───────────────────────────────────────────

  // Soft-deletes an article log. The article disappears immediately (optimistic UI)
  // and a 1-hour countdown begins during which it can be restored.
  const handleDeleteArticle = async (articleId, e) => {
    e.stopPropagation();
    const articleToDelete = articles.find((a) => a.id === articleId);
    if (!articleToDelete) return;

    setArticles(articles.filter((a) => a.id !== articleId));

    try {
      const headers = await getAuthHeaders();
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/ai/logs/${articleId}`, {
        method: "DELETE", headers,
      });

      const deletedAt = Date.now();
      setDeletedLog({ ...articleToDelete, deletedAt });
      setRestoreCountdown(59);

      if (restoreTimerRef.current) clearInterval(restoreTimerRef.current);
      restoreTimerRef.current = setInterval(() => {
        const minutesLeft = Math.max(0, Math.floor((deletedAt + 3600000 - Date.now()) / 60000));
        if (!isMountedRef.current) { clearInterval(restoreTimerRef.current); return; }
        setRestoreCountdown(minutesLeft);
        if (minutesLeft === 0) {
          clearInterval(restoreTimerRef.current);
          setDeletedLog(null);
          setRestoreCountdown(null);
        }
      }, 10000);
    } catch (err) {
      console.error("[DeleteLog] Failed:", err);
      setArticles((prev) => [articleToDelete, ...prev]);
    }
  };

  // Restores a previously deleted article log within the 1-hour window.
  const handleRestoreArticle = async () => {
    if (!deletedLog) return;
    try {
      const headers = await getAuthHeaders();
      const res     = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/ai/logs/${deletedLog.id}/restore`, {
        method: "POST", headers,
      });
      if (!res.ok) throw new Error("Restore failed");
      setArticles((prev) => [{ id: deletedLog.id, title: deletedLog.title, date: deletedLog.date }, ...prev]);
      setDeletedLog(null);
      setRestoreCountdown(null);
      clearInterval(restoreTimerRef.current);
    } catch (err) {
      console.error("[RestoreLog] Failed:", err);
    }
  };

  // ── Preview / clipboard ────────────────────────────────────────────────────

  const handleCopyToClipboard = async () => {
    if (!generatedArticle) return;
    try {
      await navigator.clipboard.writeText(`${generatedArticle.title}\n\n${generatedArticle.content}`);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 6000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const saveDraftLabel = () => {
    if (isSavingDraft)                       return "saving...";
    if (draftSaveStatus === "saved")         return "saved ✓";
    if (draftSaveStatus === "already_saved") return "already saved";
    if (draftSaveStatus === "error")         return "save failed";
    return "save draft";
  };

  // ── Save draft ─────────────────────────────────────────────────────────────

  // Saves the current generated article to the user's draft library.
  const handleSaveDraft = async () => {
    if (!generatedArticle?.logId) return;
    setIsSavingDraft(true);
    setDraftSaveStatus(null);
    try {
      const headers = await getAuthHeaders();
      const res     = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/ai/save-draft`, {
        method: "POST", headers,
        body: JSON.stringify({ logId: generatedArticle.logId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Save failed");
      setDraftSaveStatus(data.alreadySaved ? "already_saved" : "saved");
      setTimeout(() => setDraftSaveStatus(null), 4000);
    } catch (err) {
      console.error("[SaveDraft] Failed:", err);
      setDraftSaveStatus("error");
      setTimeout(() => setDraftSaveStatus(null), 4000);
    } finally {
      setIsSavingDraft(false);
    }
  };

  // ── Load to editor ─────────────────────────────────────────────────────────

  // Opens the generated article in the TinyMCE editor at /write/create.
  const handleEditInEditor = async () => {
    if (!generatedArticle?.logId) return;
    setIsLoadingEditor(true);
    try {
      const headers = await getAuthHeaders();
      const res     = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/ai/load-to-editor`, {
        method: "POST", headers,
        body: JSON.stringify({ logId: generatedArticle.logId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to open in editor");
      if (isMountedRef.current) router.push("/write/create");
    } catch (err) {
      console.error("[EditInEditor] Failed:", err);
      if (isMountedRef.current) alert("Could not open in editor. Please try again.");
    } finally {
      if (isMountedRef.current) setIsLoadingEditor(false);
    }
  };

  // ── AI flow ────────────────────────────────────────────────────────────────

  // Sends the user's prompt to the backend to extract keywords and detect length/tone.
  // Transitions to the keywords view on success.
  const handleContinueToKeywords = async () => {
    if (!userInput.trim() || !validateUserInput(userInput)) return;
    setIsLoadingTransition(true);
    setTransitionError(null);
    document.body.classList.add("loading-transition");

    let timedOut = false;
    analyzeTimeoutRef.current = setTimeout(() => {
      timedOut = true;
      setTransitionError("The request is taking too long. Please try again.");
      setTimeout(() => {
        setIsLoadingTransition(false);
        setTransitionError(null);
        document.body.classList.remove("loading-transition");
      }, 3000);
    }, AI_TIMEOUT_MS);

    try {
      const headers = await getAuthHeaders();
      const res     = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/ai/analyze`, {
        method: "POST", headers,
        body: JSON.stringify({ userInput }),
      });
      if (timedOut) return;
      clearTimeout(analyzeTimeoutRef.current);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Analysis failed");

      if (!isMountedRef.current) return;
      setSessionId(data.sessionId);
      setAiKeywords(data.keywords || []);
      setHasLengthInPrompt(data.hasArticleLengthInPrompt);
      setHasToneInPrompt(data.hasToneInPrompt);
      setNoKeywordsFound(!data.keywords?.length);
      setSelectedKeywords([]);
      setGeneratedArticle(null);
      setGenerateError(null);
      setDraftSaveStatus(null);
      setIsLoadingTransition(false);
      document.body.classList.remove("loading-transition");
      setCurrentView("keywords");
    } catch (err) {
      if (timedOut || !isMountedRef.current) return;
      clearTimeout(analyzeTimeoutRef.current);
      setTransitionError("Something went wrong. Please try again.");
      setTimeout(() => {
        setIsLoadingTransition(false);
        setTransitionError(null);
        document.body.classList.remove("loading-transition");
      }, 3000);
    }
  };

  // Shared logic for both generate and regenerate — differs only in the endpoint and error text.
  const runGenerate = async (endpoint, errorText) => {
    setIsGenerating(true);
    setGenerateError(null);
    setGeneratedArticle(null);
    setDraftSaveStatus(null);

    let timedOut = false;
    generateTimeoutRef.current = setTimeout(() => {
      timedOut = true;
      setIsGenerating(false);
      setGenerateError("The AI is taking too long. Please try again.");
      errorResetRef.current = setTimeout(() => setGenerateError(null), 3000);
    }, AI_TIMEOUT_MS);

    try {
      const headers = await getAuthHeaders();
      const res     = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${endpoint}`, {
        method: "POST", headers,
        body: JSON.stringify({ sessionId, userInput, selectedKeywords, articleLength, tone }),
      });
      if (timedOut) return;
      clearTimeout(generateTimeoutRef.current);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || `${errorText} failed`);
      setGeneratedArticle(data.article);
      fetchArticleLogs();
    } catch (err) {
      if (timedOut) return;
      clearTimeout(generateTimeoutRef.current);
      setIsGenerating(false);
      setGenerateError(`Failed to ${errorText.toLowerCase()}. Please try again.`);
      errorResetRef.current = setTimeout(() => setGenerateError(null), 3000);
    } finally {
      if (!timedOut) setIsGenerating(false);
    }
  };

  const handleGenerateArticle   = () => runGenerate("/api/ai/generate",    "Generate article");
  const handleRegenerateArticle = () => runGenerate("/api/ai/regenerate",  "Regenerate");

  // ── Derived state ──────────────────────────────────────────────────────────
  const isContinueButtonDisabled = !userInput.trim() || inputError !== "";
  const isGenerateButtonDisabled = !noKeywordsFound && selectedKeywords.length === 0;

  // ── Loading / gate screens ─────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1ABC9C]"></div>
      </div>
    );
  }
  if (!isPremium) return null;

  // ── Articles view ──────────────────────────────────────────────────────────

  if (currentView === "articles") {
    return (
      <div className="flex h-full">
        <div className="ai-generator-main flex-1 overflow-y-auto">
          <div className="ai-content-wrapper">
            <div className="ai-generator-title justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => setCurrentView("input")} className="p-2 hover:bg-[#F8FAFC] rounded-lg transition-colors duration-150">
                  <img src="/icons/menu icon.png" alt="Menu" className="ai-generator-menu-icon" />
                </button>
                <img src="/icons/Ai article generator icon teel color.png" alt="AI Article Generator" className="ai-generator-ai-icon" />
                <h1 className="ai-generator-title-text">AI Article Generator</h1>
              </div>
            </div>

            <div className="flex items-center justify-between mt-5">
              <div className="previous-generations">
                <div className="previous-generations-icon">
                  <img src="/icons/chat.png" alt="Chat" className="w-4 h-4" style={{ filter: "invert(1)" }} />
                </div>
                <span className="previous-generations-text">Previous Generations</span>
              </div>
              <div className="flex items-center gap-3">
                {deletedLog && (
                  <button
                    onClick={handleRestoreArticle}
                    className="restore-article-btn"
                    title={`Restore "${deletedLog.title}" (${restoreCountdown ?? 59}min left)`}
                  >
                    <img src="/icons/refresh-ccw-01.png" alt="Restore" className="w-4 h-4" />
                    {restoreCountdown !== null && (
                      <span style={{ fontSize: "11px", color: "#1ABC9C" }}>{restoreCountdown}m</span>
                    )}
                  </button>
                )}
                <button onClick={() => setCurrentView("input")} className="new-article-button">
                  <span>+ New Article</span>
                </button>
              </div>
            </div>

            <div className="px-6 py-8">
              {articlesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1ABC9C]"></div>
                </div>
              ) : articles.length === 0 ? (
                <div className="text-center py-12">
                  <p style={{ color: "#6B7280", fontFamily: "Inter, sans-serif", fontSize: "15px" }}>
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
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="miter"/>
                          <path d="M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="miter"/>
                          <path d="M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="miter"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <InsightsSidebar topAIArticles={topAIArticles} trendingTopics={trendingTopics} />
      </div>
    );
  }

  // ── Main input + keywords view ─────────────────────────────────────────────

  return (
    <div className="flex h-full">
      <div className="ai-generator-main flex-1 overflow-y-auto">
        <div className="ai-content-wrapper">

          <div className="ai-generator-title justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setCurrentView("articles"); fetchArticleLogs(); }}
                className="p-2 hover:bg-[#F8FAFC] rounded-lg transition-colors duration-150"
                title="view articles"
              >
                <img src="/icons/menu icon.png" alt="Menu" className="ai-generator-menu-icon" />
              </button>
              <img src="/icons/Ai article generator icon teel color.png" alt="AI Article Generator" className="ai-generator-ai-icon" />
              <h1 className="ai-generator-title-text">AI Article Generator</h1>
            </div>
          </div>

          {/* Trending articles slider — only shown on the input view */}
          {currentView === "input" && trendingArticles.length > 0 && (
            <div className="trending-section">
              <div className="trending-header">
                <img src="/icons/Trending icon.png" alt="Trending" className="trending-icon" />
                <h2 className="trending-title">Trending Articles</h2>
              </div>
              <TrendingArticleSlider articles={trendingArticles} />
            </div>
          )}

          <div className="user-input-section">
            <p className="user-prompt-text">Hello.. what do you hope to write today</p>

            {/* ── View 1: Prompt input ── */}
            {currentView === "input" && (
              <>
                <div className="user-textbox">
                  <textarea
                    value={userInput}
                    onChange={handleUserInputChange}
                    placeholder="Enter your article idea.."
                  />
                  <span className="word-count">
                    {userInput.trim().split(" ").filter((w) => w.length > 0).length}/50 words
                  </span>
                </div>
                {inputError && <div className="input-error-message">{inputError}</div>}
                <button
                  onClick={handleContinueToKeywords}
                  disabled={isContinueButtonDisabled}
                  className="continue-button"
                >
                  <span className="continue-button-text">Continue to Keywords</span>
                  <svg className="continue-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* ── View 2: Keywords, length, tone, generate ── */}
            {currentView === "keywords" && (
              <>
                {!noKeywordsFound && (
                  <div className="selected-keywords-section">
                    <h2 className="selected-keywords-title">
                      Choose the keywords that define the content of your article
                    </h2>
                    <div className="keyword-buttons-container">
                      {aiKeywords.map((keyword) => (
                        <button
                          key={keyword}
                          onClick={() => handleKeywordToggle(keyword)}
                          className={`keyword-button ${selectedKeywords.includes(keyword) ? "selected" : ""} ${selectedKeywords.length >= 4 && !selectedKeywords.includes(keyword) ? "disabled" : ""}`}
                          disabled={selectedKeywords.length >= 4 && !selectedKeywords.includes(keyword)}
                        >
                          {keyword}
                        </button>
                      ))}
                    </div>
                    <p className="selected-keywords-title">
                      {selectedKeywords.length === 4
                        ? "selected: 4 keywords (Maximum)"
                        : `selected: ${selectedKeywords.length} keywords`}
                    </p>
                  </div>
                )}

                {!hasLengthInPrompt && (
                  <div className="article-length-section">
                    <p className="article-length-text">Article Length :</p>
                    <div className="article-length-dropdown">
                      <div className="dropdown-header" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                        <div className="dropdown-header-content">
                          <span className="dropdown-header-left">{getArticleLengthDisplay().left}</span>
                          <span className="dropdown-header-right">{getArticleLengthDisplay().right}</span>
                        </div>
                        <svg className={`dropdown-arrow ${isDropdownOpen ? "open" : ""}`} width="12" height="8" viewBox="0 0 12 8" fill="none">
                          <path d="M1 1L6 6L11 1" stroke="#000000" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </div>
                      {isDropdownOpen && (
                        <div className="dropdown-menu">
                          {[
                            { value: "short",        label: "Short",      range: "300-1000"  },
                            { value: "mid-length",   label: "Mid-length", range: "1000-2000" },
                            { value: "long",         label: "Long",       range: "2000+"     },
                          ].map(({ value, label, range }) => (
                            <div
                              key={value}
                              className="menu-item"
                              onClick={() => { setArticleLength(value); setIsDropdownOpen(false); }}
                            >
                              <span className="menu-item-left">{label}</span>
                              <span className="menu-item-right">{range}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {!hasToneInPrompt && (
                  <div className={`tone-selection-section ${isDropdownOpen ? "dropdown-open" : ""}`}>
                    <p className="tone-text">Tone :</p>
                    <div className="tone-options">
                      {["professional", "casual", "humorous"].map((toneOption) => (
                        <div key={toneOption} className="tone-option">
                          <input
                            type="radio"
                            id={`tone-${toneOption}`}
                            name="tone"
                            value={toneOption}
                            checked={tone === toneOption}
                            onChange={(e) => setTone(e.target.value)}
                            className="radio-button"
                          />
                          <label htmlFor={`tone-${toneOption}`} className="tone-label">{toneOption}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(hasLengthInPrompt || hasToneInPrompt) && (
                  <p className="prompt-detection-message">
                    ✓ {hasLengthInPrompt && hasToneInPrompt
                      ? "We detected your length and tone preference in your prompt — skipping those selections!"
                      : hasLengthInPrompt
                      ? "We detected your article length preference in your prompt!"
                      : "We detected your preferred tone in your prompt!"}
                  </p>
                )}

                <div className="generate-button-section">
                  {isGenerating && (
                    <div className="generate-loading-container">
                      <div className="loading-spinner">
                        <svg className="spinner-svg" width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                          <circle className="spinner-circle"        cx="25" cy="25" r="20" fill="none" strokeWidth="5" stroke="#B4EFDD" strokeDasharray="125.6" strokeDashoffset="31.4" />
                          <circle className="spinner-circle-active" cx="25" cy="25" r="20" fill="none" strokeWidth="5" stroke="#1ABC9C" strokeDasharray="125.6" strokeDashoffset="31.4" />
                        </svg>
                      </div>
                      <p className="loading-text">Generating the article..</p>
                    </div>
                  )}

                  {!isGenerating && generateError && (
                    <div className="generate-loading-container">
                      <p style={{ color: "#e25457", fontFamily: "Inter, sans-serif", fontSize: "15px", textAlign: "center" }}>
                        {generateError}
                      </p>
                    </div>
                  )}

                  {!isGenerating && !generateError && generatedArticle && (
                    <div className="article-result-section" style={{ width: "100%" }}>
                      <div className="result-left-side"></div>
                      <p className="heres-article-text">Here&apos;s your article..</p>
                      <div className="article-title-label" onClick={() => setShowPreview(true)}>
                        <span className="article-title-text">{generatedArticle.title}</span>
                        <svg className="open-book-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E1E1E" strokeWidth="2">
                          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                        </svg>
                      </div>
                      <br /><br />
                      <div className="article-actions">
                        <button className="back-button" onClick={() => { setGeneratedArticle(null); setCurrentView("input"); }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1ABC9C" strokeWidth="2">
                            <path d="M19 12H5"></path><path d="M12 19l-7-7 7-7"></path>
                          </svg>
                          <span className="back-text">back</span>
                        </button>
                        <button className="action-icon" title="Regenerate" onClick={handleRegenerateArticle}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path>
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                          </svg>
                        </button>
                        <button className="action-icon" title="Copy" onClick={handleCopyToClipboard}>
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
                  )}

                  {!isGenerating && !generateError && !generatedArticle && (
                    <button onClick={handleGenerateArticle} disabled={isGenerateButtonDisabled} className="generate-button">
                      <div className="generate-button-icon">
                        <img src="/icons/Ai article generator icon white.png" alt="Generate AI Article" />
                      </div>
                      <span className="generate-button-text">Generate AI Article</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <InsightsSidebar topAIArticles={topAIArticles} trendingTopics={trendingTopics} />

      {/* Loading transition overlay — shown while /analyze is in progress */}
      {isLoadingTransition && (
        <div className="loading-transition-overlay">
          <div className="loading-spinner-container">
            {transitionError ? (
              <div style={{ textAlign: "center", padding: "24px" }}>
                <p style={{ color: "#ffffff", fontFamily: "Inter, sans-serif", fontSize: "16px", marginBottom: "8px" }}>
                  {transitionError}
                </p>
                <p style={{ color: "#1ABC9C", fontFamily: "Inter, sans-serif", fontSize: "14px" }}>
                  Redirecting you back...
                </p>
              </div>
            ) : (
              <div className="loading-spinner-transition"></div>
            )}
          </div>
        </div>
      )}

      {/* Article preview overlay */}
      {showPreview && generatedArticle && (
        <div
          className="preview-overlay"
          onMouseEnter={() => setIsCursorInsidePreview(false)}
          onClick={() => setIsCursorInsidePreview(false)}
        >
          {!isCursorInsidePreview && (
            <div className="preview-close-circle">
              <button className="preview-close-button-circle" onClick={() => setShowPreview(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
                  <path d="M18 6L6 18"></path><path d="M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          )}
          <div
            className="preview-box"
            onMouseEnter={() => setIsCursorInsidePreview(true)}
            onMouseLeave={(e) => {
              const rel = e.relatedTarget;
              const isClose = rel?.classList && (
                rel.classList.contains("preview-close-circle") ||
                rel.classList.contains("preview-close-button-circle") ||
                rel.classList.contains("preview-copy-icon") ||
                rel.classList.contains("preview-save-icon") ||
                rel.classList.contains("preview-edit-button")
              );
              if (!isClose) setIsCursorInsidePreview(false);
            }}
          >
            <div className="preview-header">
              <div className="preview-header-actions">
                <button className="preview-copy-icon" title="Copy" onClick={handleCopyToClipboard}>
                  {isCopied ? (
                    <span className="preview-copied-message">copied !</span>
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
                  disabled={isSavingDraft || draftSaveStatus === "saved" || draftSaveStatus === "already_saved"}
                  style={{
                    opacity: (draftSaveStatus === "saved" || draftSaveStatus === "already_saved") ? 0.6 : 1,
                    cursor:  (isSavingDraft || draftSaveStatus === "saved" || draftSaveStatus === "already_saved") ? "default" : "pointer",
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
                <h3 className="preview-article-title">{generatedArticle.title}</h3>
                <p className="preview-article-excerpt">{generatedArticle.content}</p>
              </div>
              <div className="preview-actions">
                <button className="preview-action-button"></button>
              </div>
            </div>
            <div className="preview-footer">
              <span className="preview-word-count">
                word count: {generatedArticle.wordCount ?? generatedArticle.content.split(" ").length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}