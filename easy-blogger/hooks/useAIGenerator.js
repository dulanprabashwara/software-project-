/**
 * useAIGenerator.js
 *
 * Central logic hook for the AI Article Generator page.
 * Owns all state, side-effects, and handler functions.
 * The page components receive everything they need through this hook's return value.
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useSubscription } from "../app/context/SubscriptionContext";
import { useSavedArticles } from "./useSavedArticles";
import * as aiApi from "../lib/aiApi";

// ── Constants ────────────────────────────────────────────────────────────────

const AI_TIMEOUT_MS           = 150000;  // 2.5 minutes — AI generation can be slow
const WARNING_VISIBLE_MS      = 3000;   // 30 seconds — delete warning callout auto-hide
const AUTH_TIMEOUT_MS         = 5000;    // Firebase re-auth wait before giving up
const ERROR_DISPLAY_MS        = 3000;    // how long error messages stay visible
const DRAFT_STATUS_CLEAR_MS   = 4000;    // how long "saved" / "error" feedback stays
const COPY_FEEDBACK_MS        = 6000;    // how long "copied!" stays visible
const RESTORE_POLL_MS         = 10000;   // how often the restore countdown updates
const RESTORE_WINDOW_MS       = 3600000; // 1 hour — grace period before permanent delete
const HOURLY_REFRESH_MS       = 3600000; // 1 hour — trending data refresh interval
export const MAX_KEYWORDS_SELECTABLE = 4;
export const MAX_PROMPT_WORDS        = 50;

// ── Date formatter ───────────────────────────────────────────────────────────

export function formatDate(isoString) {
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

// ── Hook ─────────────────────────────────────────────────────────────────────

export default function useAIGenerator() {
  const router = useRouter();
  const { isPremium, isLoading } = useSubscription();
  const { savedArticles } = useSavedArticles();

  // ── View + prompt state ──────────────────────────────────────────────────
  const [currentView, setCurrentView] = useState("input");
  const [userInput,   setUserInput]   = useState("");
  const [inputError,  setInputError]  = useState("");

  // ── Prompt analysis results ──────────────────────────────────────────────
  const [sessionId,          setSessionId]          = useState(null);
  const [aiKeywords,         setAiKeywords]          = useState([]);
  const [hasLengthInPrompt,  setHasLengthInPrompt]  = useState(false);
  const [hasToneInPrompt,    setHasToneInPrompt]    = useState(false);
  const [noKeywordsFound,    setNoKeywordsFound]    = useState(false);

  // ── Article settings ─────────────────────────────────────────────────────
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [articleLength,    setArticleLength]    = useState("short");
  const [tone,             setTone]             = useState("professional");
  const [isDropdownOpen,   setIsDropdownOpen]   = useState(false);

  // ── Loading + error ──────────────────────────────────────────────────────
  const [isLoadingTransition, setIsLoadingTransition] = useState(false);
  const [transitionError,     setTransitionError]     = useState(null);
  const [isGenerating,        setIsGenerating]        = useState(false);
  const [generateError,       setGenerateError]       = useState(null);

  // ── Generated article ────────────────────────────────────────────────────
  const [generatedArticle, setGeneratedArticle] = useState(null);
  const [isSavingDraft,    setIsSavingDraft]    = useState(false);
  const [draftSaveStatus,  setDraftSaveStatus]  = useState(null);
  const [isLoadingEditor,  setIsLoadingEditor]  = useState(false);
  const [userResponse,     setUserResponse]     = useState(null);

  // ── Preview overlay ──────────────────────────────────────────────────────
  const [showPreview,             setShowPreview]             = useState(false);
  const [isCursorInsidePreview,   setIsCursorInsidePreview]   = useState(false);
  const [isCopied,                setIsCopied]                = useState(false);

  // ── Delete / restore state ───────────────────────────────────────────────
  const [deletedLog,          setDeletedLog]          = useState(null);
  const [restoreCountdown,    setRestoreCountdown]    = useState(null);
  const [showDeleteWarning,   setShowDeleteWarning]   = useState(false);
  const [pendingSecondDelete, setPendingSecondDelete] = useState(null);

  // ── Article logs list ────────────────────────────────────────────────────
  const [articles,        setArticles]        = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(false);

  // ── Sidebar data ─────────────────────────────────────────────────────────
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [topAIArticles,    setTopAIArticles]    = useState([]);
  const [trendingKeywords, setTrendingKeywords] = useState([]);

  // ── Refs ─────────────────────────────────────────────────────────────────
  const analyzeTimeoutRef  = useRef(null);
  const generateTimeoutRef = useRef(null);
  const errorResetRef      = useRef(null);
  const restoreTimerRef    = useRef(null);
  const deleteWarningRef   = useRef(null);
  const isMountedRef       = useRef(true);

  // ── Lifecycle ────────────────────────────────────────────────────────────

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearTimeout(analyzeTimeoutRef.current);
      clearTimeout(generateTimeoutRef.current);
      clearTimeout(errorResetRef.current);
      clearTimeout(deleteWarningRef.current);
      clearInterval(restoreTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isLoading && !isPremium) router.push("/subscription/upgrade");
  }, [isPremium, isLoading, router]);

  useEffect(() => {
    document.body.classList.toggle("loading", isLoading || isGenerating);
    return () => document.body.classList.remove("loading");
  }, [isLoading, isGenerating]);

  // ── Auth helper ──────────────────────────────────────────────────────────

  const getAuthHeaders = async () => {
    try {
      const auth = getAuth();
      const user = await new Promise((resolve, reject) => {
        if (auth.currentUser) { resolve(auth.currentUser); return; }
        const unsub = onAuthStateChanged(auth, (u) => {
          unsub();
          u ? resolve(u) : reject(new Error("No authenticated user"));
        });
        setTimeout(() => { unsub(); reject(new Error("Auth timeout")); }, AUTH_TIMEOUT_MS);
      });
      const token = await user.getIdToken();
      return { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };
    } catch {
      if (isMountedRef.current) router.push("/login");
      throw new Error("Not authenticated");
    }
  };

  // ── Data fetching ────────────────────────────────────────────────────────

  const fetchTrendingArticles = async () => {
    try {
      const result = await aiApi.getTrendingArticles();
      if (result.length) setTrendingArticles(result);
    } catch (err) {
      console.error("[Slider] Failed:", err);
    }
  };

  const fetchTopAIArticles = async () => {
    try {
      const articles = await aiApi.getTopAIArticles(getAuthHeaders);
      setTopAIArticles(articles);
    } catch (err) {
      console.error("[Insights] Failed to fetch top AI articles:", err);
    }
  };

  const fetchTrendingKeywords = async () => {
    try {
      const keywords = await aiApi.getTrendingKeywords(getAuthHeaders);
      setTrendingKeywords(keywords);
    } catch (err) {
      console.error("[Insights] Failed to fetch trending keywords:", err);
    }
  };

  const fetchArticleLogs = async () => {
    setArticlesLoading(true);
    try {
      const logs = await aiApi.getArticleLogs(getAuthHeaders);
      setArticles(logs.map((log) => ({
        id:    log.id,
        title: log.articleTitle,
        date:  formatDate(log.generatedAt),
      })));
    } catch (err) {
      console.error("[ArticleLogs] Failed:", err);
    } finally {
      setArticlesLoading(false);
    }
  };

  useEffect(() => {
    if (isLoading || !isPremium) return;
    fetchTrendingArticles();
    fetchTopAIArticles();
    fetchTrendingKeywords();
    fetchArticleLogs();
  }, [isLoading, isPremium]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isLoading || !isPremium) return;
    const hourlyRefresh = setInterval(() => {
      fetchTrendingArticles();
      fetchTopAIArticles();
    }, HOURLY_REFRESH_MS);
    return () => clearInterval(hourlyRefresh);
  }, [isLoading, isPremium]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Input handlers ───────────────────────────────────────────────────────

  const validateUserInput = (text) => {
    if (!/[a-zA-Z]/.test(text)) { setInputError("Please enter a valid text!"); return false; }
    setInputError(""); return true;
  };

  const handleUserInputChange = (e) => {
    const text  = e.target.value;
    const words = text.trim().split(" ");
    if (words.length <= MAX_PROMPT_WORDS) { setUserInput(text); setInputError(""); }
  };

  const handleKeywordToggle = (keyword) => {
    setSelectedKeywords((prev) =>
      prev.includes(keyword)
        ? prev.filter((k) => k !== keyword)
        : prev.length < MAX_KEYWORDS_SELECTABLE ? [...prev, keyword] : prev
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

  // ── User response (like / dislike) ───────────────────────────────────────

  const handleUserResponse = async (value) => {
    if (!generatedArticle?.logId) return;
    const next = userResponse === value ? null : value;
    setUserResponse(next); // optimistic
    try {
      const updated = await aiApi.setUserResponse(getAuthHeaders, generatedArticle.logId, next);
      setUserResponse(updated); // reconcile with server
    } catch (err) {
      console.error("[UserResponse] Failed:", err);
      setUserResponse(userResponse); // revert on failure
    }
  };

  // ── Delete / restore ─────────────────────────────────────────────────────

  const startRestoreWindow = (articleToDelete) => {
    const deletedAt = Date.now();
    setDeletedLog({ ...articleToDelete, deletedAt });
    setRestoreCountdown(59);
    setShowDeleteWarning(true);

    clearTimeout(deleteWarningRef.current);
    deleteWarningRef.current = setTimeout(() => {
      if (isMountedRef.current) setShowDeleteWarning(false);
    }, WARNING_VISIBLE_MS);

    if (restoreTimerRef.current) clearInterval(restoreTimerRef.current);
    restoreTimerRef.current = setInterval(() => {
      const minutesLeft = Math.max(0, Math.floor((deletedAt + RESTORE_WINDOW_MS - Date.now()) / 60000));
      if (!isMountedRef.current) { clearInterval(restoreTimerRef.current); return; }
      setRestoreCountdown(minutesLeft);
      if (minutesLeft === 0) {
        clearInterval(restoreTimerRef.current);
        setDeletedLog(null);
        setRestoreCountdown(null);
        setShowDeleteWarning(false);
      }
    }, RESTORE_POLL_MS);
  };

  const handleDeleteArticle = async (articleId, e) => {
    e.stopPropagation();
    const articleToDelete = articles.find((a) => a.id === articleId);
    if (!articleToDelete) return;

    if (deletedLog) {
      setPendingSecondDelete(articleToDelete);
      return;
    }

    setArticles((prev) => prev.filter((a) => a.id !== articleId));
    try {
      await aiApi.deleteLog(getAuthHeaders, articleId);
      startRestoreWindow(articleToDelete);
    } catch (err) {
      console.error("[DeleteLog] Failed:", err);
      setArticles((prev) => [articleToDelete, ...prev]);
    }
  };

  const handleConfirmSecondDelete = async () => {
    if (!pendingSecondDelete) return;
    const articleToDelete = pendingSecondDelete;
    setPendingSecondDelete(null);

    clearInterval(restoreTimerRef.current);
    clearTimeout(deleteWarningRef.current);
    setDeletedLog(null);
    setRestoreCountdown(null);
    setShowDeleteWarning(false);

    setArticles((prev) => prev.filter((a) => a.id !== articleToDelete.id));
    try {
      await aiApi.deleteLog(getAuthHeaders, articleToDelete.id);
      startRestoreWindow(articleToDelete);
    } catch (err) {
      console.error("[DeleteLog second] Failed:", err);
      setArticles((prev) => [articleToDelete, ...prev]);
    }
  };

  const handleCancelSecondDelete = () => setPendingSecondDelete(null);

  const handleRestoreArticle = async () => {
    if (!deletedLog) return;
    try {
      await aiApi.restoreLog(getAuthHeaders, deletedLog.id);
      setArticles((prev) => [{ id: deletedLog.id, title: deletedLog.title, date: deletedLog.date }, ...prev]);
      setDeletedLog(null);
      setRestoreCountdown(null);
      setShowDeleteWarning(false);
      clearInterval(restoreTimerRef.current);
      clearTimeout(deleteWarningRef.current);
    } catch (err) {
      console.error("[RestoreLog] Failed:", err);
    }
  };

  // ── Preview / clipboard ──────────────────────────────────────────────────

  const handleCopyToClipboard = async () => {
    if (!generatedArticle) return;
    try {
      await navigator.clipboard.writeText(`${generatedArticle.title}\n\n${generatedArticle.content}`);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), COPY_FEEDBACK_MS);
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

  // ── Save draft ───────────────────────────────────────────────────────────

  const handleSaveDraft = async () => {
    if (!generatedArticle?.logId) return;
    setIsSavingDraft(true);
    setDraftSaveStatus(null);
    try {
      const data = await aiApi.saveDraft(getAuthHeaders, generatedArticle.logId);
      setDraftSaveStatus(data.alreadySaved ? "already_saved" : "saved");
      setTimeout(() => setDraftSaveStatus(null), DRAFT_STATUS_CLEAR_MS);
    } catch (err) {
      console.error("[SaveDraft] Failed:", err);
      setDraftSaveStatus("error");
      setTimeout(() => setDraftSaveStatus(null), DRAFT_STATUS_CLEAR_MS);
    } finally {
      setIsSavingDraft(false);
    }
  };

  // ── Load to editor ───────────────────────────────────────────────────────

  const handleEditInEditor = async () => {
    if (!generatedArticle?.logId) return;
    setIsLoadingEditor(true);
    try {
      await aiApi.loadToEditor(getAuthHeaders, generatedArticle.logId);
      if (isMountedRef.current) router.push("/write/create");
    } catch (err) {
      console.error("[EditInEditor] Failed:", err);
      if (isMountedRef.current) alert("Could not open in editor. Please try again.");
    } finally {
      if (isMountedRef.current) setIsLoadingEditor(false);
    }
  };

  // ── AI flow ──────────────────────────────────────────────────────────────

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
      }, ERROR_DISPLAY_MS);
    }, AI_TIMEOUT_MS);

    try {
      const data = await aiApi.analyzePrompt(getAuthHeaders, userInput);
      if (timedOut) return;
      clearTimeout(analyzeTimeoutRef.current);
      if (!isMountedRef.current) return;

      setSessionId(data.sessionId);
      setAiKeywords(data.keywords || []);
      setHasLengthInPrompt(data.hasArticleLengthInPrompt);
      setHasToneInPrompt(data.hasToneInPrompt);
      setNoKeywordsFound(!data.keywords?.length);
      setSelectedKeywords([]);
      setGeneratedArticle(null);
      setUserResponse(null);
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
      }, ERROR_DISPLAY_MS);
    }
  };

  const runGenerate = async (apiFn, errorText) => {
    setIsGenerating(true);
    setGenerateError(null);
    setGeneratedArticle(null);
    setUserResponse(null);
    setDraftSaveStatus(null);

    const payload = { sessionId, userInput, selectedKeywords, articleLength, tone };
    let timedOut  = false;
    generateTimeoutRef.current = setTimeout(() => {
      timedOut = true;
      setIsGenerating(false);
      setGenerateError("The AI is taking too long. Please try again.");
      errorResetRef.current = setTimeout(() => setGenerateError(null), ERROR_DISPLAY_MS);
    }, AI_TIMEOUT_MS);

    try {
      const article = await apiFn(getAuthHeaders, payload);
      if (timedOut) return;
      clearTimeout(generateTimeoutRef.current);
      setGeneratedArticle(article);
      fetchArticleLogs();
    } catch (err) {
      if (timedOut) return;
      clearTimeout(generateTimeoutRef.current);
      setIsGenerating(false);
      setGenerateError(`Failed to ${errorText.toLowerCase()}. Please try again.`);
      errorResetRef.current = setTimeout(() => setGenerateError(null), ERROR_DISPLAY_MS);
    } finally {
      if (!timedOut) setIsGenerating(false);
    }
  };

  const handleGenerateArticle   = () => runGenerate(aiApi.generateArticle,   "Generate article");
  const handleRegenerateArticle = () => runGenerate(aiApi.regenerateArticle, "Regenerate");

  // ── Derived state ────────────────────────────────────────────────────────

  const isContinueButtonDisabled = !userInput.trim() || inputError !== "";
  const isGenerateButtonDisabled = !noKeywordsFound && selectedKeywords.length === 0;

  return {
    // subscription
    isLoading, isPremium,
    // view
    currentView, setCurrentView,
    // prompt
    userInput, inputError,
    handleUserInputChange,
    handleContinueToKeywords,
    isContinueButtonDisabled,
    // keywords view
    sessionId, aiKeywords, hasLengthInPrompt, hasToneInPrompt, noKeywordsFound,
    selectedKeywords, handleKeywordToggle,
    articleLength, setArticleLength,
    tone, setTone,
    isDropdownOpen, setIsDropdownOpen,
    getArticleLengthDisplay,
    // generate
    isGenerating, generateError, generatedArticle,
    handleGenerateArticle, handleRegenerateArticle,
    isGenerateButtonDisabled,
    // draft / editor
    isSavingDraft, draftSaveStatus,
    handleSaveDraft, saveDraftLabel,
    isLoadingEditor, handleEditInEditor,
    // response
    userResponse, handleUserResponse,
    // preview
    showPreview, setShowPreview,
    isCursorInsidePreview, setIsCursorInsidePreview,
    isCopied, handleCopyToClipboard,
    // delete / restore
    deletedLog, restoreCountdown, showDeleteWarning, pendingSecondDelete,
    handleDeleteArticle, handleRestoreArticle,
    handleConfirmSecondDelete, handleCancelSecondDelete,
    // articles list
    articles, articlesLoading, fetchArticleLogs,
    // sidebar
    trendingArticles, topAIArticles, trendingKeywords,
    savedArticles,
    // transition overlay
    isLoadingTransition, transitionError,
  };
}
