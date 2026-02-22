/**
 * AI Article Generator Page
 *
 * Route: /ai-generate
 *
 * Data sources:
 *   - Mock data (articles list, trending, sidebar) → /api/ai-generate  (Next.js route.js, stays in frontend)
 *   - AI generation (analyze, generate, regenerate) → http://localhost:5000/api/ai/...  (Express backend)
 *
 * When real DB is ready: replace /api/ai-generate calls with real backend endpoints
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSubscription } from "../../subscription/SubscriptionContext";
import "../../../styles/ai-article-generator/ai-article-generator.css";
import "../../../styles/ai-article-generator/ai-article-generator-view2.css";
import "../../../styles/ai-article-generator/articles-view.css";

// ─── Backend URL ─────────────────────────────────────────────────────────────
// Points to the Express backend (same repo as the main backend team's code)
// Change to production URL when deploying
const BACKEND_URL = "http://localhost:5000";

// ─── AI Timeout ───────────────────────────────────────────────────────────────
const AI_TIMEOUT_MS = 300000;

export default function AIArticleGeneratorPage() {
  const router = useRouter();
  const { isPremium, isLoading } = useSubscription();

  // ── View state ──────────────────────────────────────────────────────────────
  // "input"    → prompt textbox + trending slider
  // "keywords" → keyword selection + length + tone + generate section (result shown inline here too)
  // "articles" → previous generations list
  const [currentView, setCurrentView] = useState("input");

  // ── User input ──────────────────────────────────────────────────────────────
  const [userInput, setUserInput] = useState("");
  const [inputError, setInputError] = useState("");

  // ── AI analysis results (from /api/ai/analyze) ─────────────────────────────
  const [sessionId, setSessionId] = useState(null);        // cached prompt id on backend
  const [aiKeywords, setAiKeywords] = useState([]);         // matched keywords from master list
  const [hasLengthInPrompt, setHasLengthInPrompt] = useState(false);  // hide length selector if true
  const [hasToneInPrompt, setHasToneInPrompt] = useState(false);      // hide tone selector if true
  const [noKeywordsFound, setNoKeywordsFound] = useState(false);      // no keyword matches found

  // ── User selections ─────────────────────────────────────────────────────────
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [articleLength, setArticleLength] = useState("short");
  const [tone, setTone] = useState("professional");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // ── Loading overlay (for "Continue to Keywords" step only) ──────────────────
  const [isLoadingTransition, setIsLoadingTransition] = useState(false);
  const [transitionError, setTransitionError] = useState(null);

  // ── Generate/regenerate inline states ───────────────────────────────────────
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);

  // ── Generated article (shown inline in keywords view) ───────────────────────
  const [generatedArticle, setGeneratedArticle] = useState(null);

  // ── Preview overlay ─────────────────────────────────────────────────────────
  const [showPreview, setShowPreview] = useState(false);
  const [isCursorInsidePreview, setIsCursorInsidePreview] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // ── Data from API route ────────────────────────────────────────────────────────
  const [articles, setArticles] = useState([]);
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [topAIArticles, setTopAIArticles] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);

  // ── Slider ──────────────────────────────────────────────────────────────────
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0);

  // ── Refs ────────────────────────────────────────────────────────────────────
  const intervalRef = useRef(null);
  const analyzeTimeoutRef = useRef(null);
  const generateTimeoutRef = useRef(null);
  const errorResetRef = useRef(null);

  // Premium gate
  useEffect(() => {
    if (!isLoading && !isPremium) router.push("/subscription/upgrade");
  }, [isPremium, isLoading, router]);

  // ── Fetch all data from route.js API ────────────────────────────────────────
  // This calls the Next.js API route at /api/ai-generate (route.js in frontend)
  // When DB is ready: replace this URL with real backend endpoint
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/ai-generate');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data.articles) setArticles(data.articles);
        if (data.trendingArticles) setTrendingArticles(data.trendingArticles);
        if (data.topAIArticles) setTopAIArticles(data.topAIArticles);
        if (data.trendingTopics) setTrendingTopics(data.trendingTopics);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  // Slider auto-play
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentArticleIndex((prev) => (prev + 1) % trendingArticles.length);
    }, 15000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [trendingArticles.length]);

  // body.loading class — from original page.jsx (prevents interaction during loading)
  useEffect(() => {
    if (isLoading) { document.body.classList.add('loading'); }
    else { document.body.classList.remove('loading'); }
    return () => document.body.classList.remove('loading');
  }, [isLoading]);

  useEffect(() => {
    if (isGenerating) { document.body.classList.add('loading'); }
    else { document.body.classList.remove('loading'); }
    return () => document.body.classList.remove('loading');
  }, [isGenerating]);

  // Cleanup all timeouts on unmount
  useEffect(() => {
    return () => {
      if (analyzeTimeoutRef.current) clearTimeout(analyzeTimeoutRef.current);
      if (generateTimeoutRef.current) clearTimeout(generateTimeoutRef.current);
      if (errorResetRef.current) clearTimeout(errorResetRef.current);
    };
  }, []);

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  const validateUserInput = (text) => {
    if (!/[a-zA-Z]/.test(text)) { setInputError("Please enter a valid text!"); return false; }
    setInputError(""); return true;
  };

  // From original page.jsx — splits by " " (space) to match original word count behaviour
  const handleUserInputChange = (e) => {
    const text = e.target.value;
    const words = text.trim().split(" ");
    if (words.length <= 50) { setUserInput(text); setInputError(""); }
  };

  const handleManualSlide = (direction) => {
    if (direction === "next") {
      setCurrentArticleIndex((prev) => (prev + 1) % trendingArticles.length);
    } else {
      setCurrentArticleIndex((prev) => (prev - 1 + trendingArticles.length) % trendingArticles.length);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => setCurrentArticleIndex((prev) => (prev + 1) % trendingArticles.length), 15000);
    }
  };

  const handleKeywordToggle = (keyword) => {
    setSelectedKeywords((prev) =>
      prev.includes(keyword) ? prev.filter((k) => k !== keyword) : prev.length < 4 ? [...prev, keyword] : prev
    );
  };

  const getArticleLengthDisplay = () => {
    const options = { short: { left: 'Short', right: '300-1000' }, 'mid-length': { left: 'Mid-length', right: '1000-2000' }, long: { left: 'Long', right: '2000+' } };
    return options[articleLength] || { left: 'Short', right: '300-1000' };
  };

  // ── Copy to clipboard ────────────────────────────────────────────────────────
  const handleCopyToClipboard = async () => {
    if (!generatedArticle) return;
    try {
      const textToCopy = `${generatedArticle.title}\n\n${generatedArticle.content}`;
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 6000);
    } catch (err) { console.error('Failed to copy text: ', err); }
  };

  // ── Save draft to mock API (route.js POST handler) ───────────────────────────
  // When DB is ready: this already POSTs the right data, just change the URL
  const handleSaveDraft = async () => {
    if (!generatedArticle) return;
    try {
      await fetch('/api/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: generatedArticle.title,
          content: generatedArticle.content,
          wordCount: generatedArticle.wordCount,
          textPrompt: userInput,
          keywordsSelected: selectedKeywords,
          articleLengthSelected: articleLength,
          toneSelected: tone,
        }),
      });
    } catch (err) {
      console.error('Failed to save draft:', err);
    }
  };

  // ═════════════════════════════════════════════════════════════════════════════
  // CONTINUE TO KEYWORDS
  // Calls Express backend /api/ai/analyze — shows full-page overlay spinner
  // On success: stores session + AI keywords → switches to keywords view
  // On 30s timeout or error: shows error on overlay → 3s → closes overlay
  // ═════════════════════════════════════════════════════════════════════════════
  const handleContinueToKeywords = async () => {
    if (!userInput.trim() || !validateUserInput(userInput)) return;

    setIsLoadingTransition(true);
    setTransitionError(null);
    document.body.classList.add('loading-transition');

    let timedOut = false;
    analyzeTimeoutRef.current = setTimeout(() => {
      timedOut = true;
      setTransitionError("The request is taking too long. Please try again.");
      setTimeout(() => {
        setIsLoadingTransition(false);
        setTransitionError(null);
        document.body.classList.remove('loading-transition');
      }, 3000);
    }, AI_TIMEOUT_MS);

    try {
      const res = await fetch(`${BACKEND_URL}/api/ai/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput }),
      });

      if (timedOut) return;
      clearTimeout(analyzeTimeoutRef.current);

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Analysis failed");

      // Store AI response
      setSessionId(data.sessionId);
      setAiKeywords(data.keywords || []);
      setHasLengthInPrompt(data.hasArticleLengthInPrompt);
      setHasToneInPrompt(data.hasToneInPrompt);
      setNoKeywordsFound(!data.keywords || data.keywords.length === 0);
      setSelectedKeywords([]);
      setGeneratedArticle(null);
      setGenerateError(null);

      setIsLoadingTransition(false);
      document.body.classList.remove('loading-transition');
      setCurrentView("keywords");
    } catch (err) {
      if (timedOut) return;
      clearTimeout(analyzeTimeoutRef.current);
      setTransitionError("Something went wrong. Please try again.");
      setTimeout(() => {
        setIsLoadingTransition(false);
        setTransitionError(null);
        document.body.classList.remove('loading-transition');
      }, 3000);
    }
  };

  // ═════════════════════════════════════════════════════════════════════════════
  // GENERATE ARTICLE
  // Calls Express backend /api/ai/generate — shows inline spinner in generate section
  // STATE FLOW in generate section:
  //   Idle (button) → isGenerating (spinner) → success (article result inline)
  //                                           → timeout/error (error msg 3s → button)
  // ═════════════════════════════════════════════════════════════════════════════
  const handleGenerateArticle = async () => {
    setIsGenerating(true);
    setGenerateError(null);
    setGeneratedArticle(null);

    let timedOut = false;
    generateTimeoutRef.current = setTimeout(() => {
      timedOut = true;
      setIsGenerating(false);
      setGenerateError("The AI is taking too long. Please try again.");
      errorResetRef.current = setTimeout(() => setGenerateError(null), 3000);
    }, AI_TIMEOUT_MS);

    try {
      const res = await fetch(`${BACKEND_URL}/api/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, userInput, selectedKeywords, articleLength, tone }),
      });

      if (timedOut) return;
      clearTimeout(generateTimeoutRef.current);

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Generation failed");

      // SUCCESS — spinner replaced by article result inline
      setGeneratedArticle(data.article); // { title, content, wordCount }
    } catch (err) {
      if (timedOut) return;
      clearTimeout(generateTimeoutRef.current);
      setIsGenerating(false);
      setGenerateError("Failed to generate article. Please try again.");
      errorResetRef.current = setTimeout(() => setGenerateError(null), 3000);
    } finally {
      if (!timedOut) setIsGenerating(false);
    }
  };

  // ═════════════════════════════════════════════════════════════════════════════
  // REGENERATE ARTICLE
  // Same as generate but calls /api/ai/regenerate
  // Uses SAME original prompt (from sessionId cache on backend)
  // Uses CURRENT selections — user may have changed keywords/length/tone
  // ═════════════════════════════════════════════════════════════════════════════
  const handleRegenerateArticle = async () => {
    setIsGenerating(true);
    setGenerateError(null);
    setGeneratedArticle(null); // clears result → shows spinner

    let timedOut = false;
    generateTimeoutRef.current = setTimeout(() => {
      timedOut = true;
      setIsGenerating(false);
      setGenerateError("The AI is taking too long. Please try again.");
      errorResetRef.current = setTimeout(() => setGenerateError(null), 3000);
    }, AI_TIMEOUT_MS);

    try {
      const res = await fetch(`${BACKEND_URL}/api/ai/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, userInput, selectedKeywords, articleLength, tone }),
      });

      if (timedOut) return;
      clearTimeout(generateTimeoutRef.current);

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Regeneration failed");

      setGeneratedArticle(data.article);
    } catch (err) {
      if (timedOut) return;
      clearTimeout(generateTimeoutRef.current);
      setIsGenerating(false);
      setGenerateError("Failed to regenerate. Please try again.");
      errorResetRef.current = setTimeout(() => setGenerateError(null), 3000);
    } finally {
      if (!timedOut) setIsGenerating(false);
    }
  };

  // ─── Derived state ────────────────────────────────────────────────────────────
  const isContinueButtonDisabled = !userInput.trim() || inputError !== "";
  // If no keywords found → generate from prompt alone → button always enabled
  // If keywords found → need at least 1 selected
  const isGenerateButtonDisabled = !noKeywordsFound && selectedKeywords.length === 0;

  // ─── Loading / Premium screens ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1ABC9C]"></div>
      </div>
    );
  }
  if (!isPremium) return null;

  // ═════════════════════════════════════════════════════════════════════════════
  // ARTICLES VIEW — Previous Generations
  // Articles come from route.js mock data (/api/ai-generate GET)
  // Each article is clickable → routes to /ai-generate/article/[id]
  // ═════════════════════════════════════════════════════════════════════════════
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
              <button onClick={() => setCurrentView("input")} className="new-article-button">
                <span>+ New Article</span>
              </button>
            </div>

            <div className="px-6 py-8">
              <div className="articles-list">
                {articles.map((article) => (
                  // clickable article row — navigates to detail page using article id
                  // route.js GET /?id=articleId returns full article details for that page
                  <div
                    key={article.id}
                    className="article-label cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => router.push(`/ai-generate/article/${article.id}`)}
                  >
                    <div className="article-title"><span>{article.title}</span></div>
                    <div className="article-date"><span>{article.date}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="insights-sidebar">
          <div className="insights-header">
            <h2 className="insights-title">Insights</h2>
            <div className="insights-dots"><div className="insights-dot-1"></div><div className="insights-dot-2"></div></div>
          </div>
          <div className="mb-8">
            <h3 className="insights-section-title">Top AI Assisted Articles</h3>
            <div className="space-y-3">
              {topAIArticles.map((article, index) => (
                <div key={index} className="insights-article-section">
                  <div className="insights-article-header">
                    <span className="insights-article-number">{index + 1}</span>
                    <h4 className="insights-article-name">{article.title}</h4>
                  </div>
                  <div className="insights-author-section"><p className="insights-author-name">{article.authors}</p></div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="insights-section-title">Trending topics</h3>
            <div className="trending-topics-buttons">
              {trendingTopics.map((topic, index) => <button key={index} className="topic-button">{topic}</button>)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // MAIN VIEW — input + keywords + result (all same page, no separate view for result)
  // ═════════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex h-full">
      <div className="ai-generator-main flex-1 overflow-y-auto">
        <div className="ai-content-wrapper">

          {/* ── Title bar ── */}
          <div className="ai-generator-title justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setCurrentView("articles")} className="p-2 hover:bg-[#F8FAFC] rounded-lg transition-colors duration-150">
                <img src="/icons/menu icon.png" alt="Menu" className="ai-generator-menu-icon" />
              </button>
              <img src="/icons/Ai article generator icon teel color.png" alt="AI Article Generator" className="ai-generator-ai-icon" />
              <h1 className="ai-generator-title-text">AI Article Generator</h1>
            </div>
          </div>

          {/* ── Trending slider — only shown on input view and when data is loaded ── */}
          {currentView === "input" && trendingArticles.length > 0 && (
            <>
              <div className="trending-section">
                <div className="trending-header">
                  <img src="/icons/Trending icon.png" alt="Trending" className="trending-icon" />
                  <h2 className="trending-title">Trending Articles</h2>
                </div>

                <div className="trending-slider">
                  <button onClick={() => handleManualSlide("prev")} className="slider-chevron">
                    <img src="/icons/doble chevron icon  (2).png" alt="Previous" className="slider-chevron" />
                  </button>

                  <div className="slider-content">
                    <div className="slider-left-content">
                      <div className="author-info">
                        <img src={trendingArticles[currentArticleIndex].authorImage} alt={trendingArticles[currentArticleIndex].author} className="author-image" />
                        <div className="author-details">
                          <div className="author-name">{trendingArticles[currentArticleIndex].author}</div>
                          <div className="publish-date">{trendingArticles[currentArticleIndex].publishDate}</div>
                        </div>
                      </div>
                      <h3 className="article-title" onClick={() => console.log('Article clicked:', trendingArticles[currentArticleIndex].title)}>
                        {trendingArticles[currentArticleIndex].title}
                      </h3>
                      <p className="article-description">{trendingArticles[currentArticleIndex].excerpt}</p>
                      <div className="article-stats">
                        <div className="stat-item">
                          <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span className="stat-number">{trendingArticles[currentArticleIndex].comments}</span>
                        </div>
                        <div className="stat-item">
                          <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          <span className="stat-number">{trendingArticles[currentArticleIndex].likes}</span>
                        </div>
                      </div>
                    </div>

                    <div className="slider-right-content">
                      <img src={trendingArticles[currentArticleIndex].coverImage} alt="Article cover" className="cover-image" />
                      <div className="bookmark-wrapper">
                        <svg className="bookmark-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        <svg className="three-dots-icon" fill="none" stroke="#1ABC9C" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="1" fill="#1ABC9C"/>
                          <circle cx="19" cy="12" r="1" fill="#1ABC9C"/>
                          <circle cx="5" cy="12" r="1" fill="#1ABC9C"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <button onClick={() => handleManualSlide("next")} className="slider-chevron">
                    <img src="/icons/doble chevron icon  (1).png" alt="Next" className="slider-chevron" />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── Prompt / selections section ── */}
          <div className="user-input-section">
            <p className="user-prompt-text">Hello.. what do you hope to write today</p>

            {/* ════ INPUT VIEW ════ */}
            {currentView === "input" ? (
              <>
                <div className="user-textbox">
                  <textarea
                    value={userInput}
                    onChange={handleUserInputChange}
                    placeholder="Enter your article idea.."
                  />
                  <span className="word-count">
                    {userInput.trim().split(" ").filter((word) => word.length > 0).length}/50 words
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
            ) : (
              /* ════ KEYWORDS VIEW — selections + generate section + inline result ════ */
              <>
                {/* ── Keyword buttons — hidden silently if AI found no matches ── */}
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
                      {selectedKeywords.length === 4 ? "selected: 4 keywords(Maximum)" : "selected: " + selectedKeywords.length + " keywords"}
                    </p>
                  </div>
                )}

                {/* ── Article Length — hidden if AI detected length in prompt ── */}
                {!hasLengthInPrompt && (
                  <div className="article-length-section">
                    <p className="article-length-text">Article Length :</p>
                    <div className="article-length-dropdown">
                      <div className="dropdown-header" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                        <div className="dropdown-header-content">
                          <span className="dropdown-header-left">{getArticleLengthDisplay().left}</span>
                          <span className="dropdown-header-right">{getArticleLengthDisplay().right}</span>
                        </div>
                        <svg className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`} width="12" height="8" viewBox="0 0 12 8" fill="none">
                          <path d="M1 1L6 6L11 1" stroke="#000000" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </div>
                      {isDropdownOpen && (
                        <div className="dropdown-menu">
                          <div className="menu-item" onClick={() => { setArticleLength('short'); setIsDropdownOpen(false); }}>
                            <span className="menu-item-left">Short</span><span className="menu-item-right">300-1000</span>
                          </div>
                          <div className="menu-item" onClick={() => { setArticleLength('mid-length'); setIsDropdownOpen(false); }}>
                            <span className="menu-item-left">Mid-length</span><span className="menu-item-right">1000-2000</span>
                          </div>
                          <div className="menu-item" onClick={() => { setArticleLength('long'); setIsDropdownOpen(false); }}>
                            <span className="menu-item-left">Long</span><span className="menu-item-right">2000+</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Tone — hidden if AI detected tone in prompt ── */}
                {!hasToneInPrompt && (
                  <div className={`tone-selection-section ${isDropdownOpen ? 'dropdown-open' : ''}`}>
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

                {/* ── Prompt detection info ── */}
                {(hasLengthInPrompt || hasToneInPrompt) && (
                  <p style={{ marginLeft: "107px", color: "#1ABC9C", fontFamily: "Inter, sans-serif", fontSize: "14px", marginTop: "8px", marginBottom: "8px" }}>
                    ✓ {hasLengthInPrompt && hasToneInPrompt
                      ? "We detected your length and tone preference in your prompt — skipping those selections!"
                      : hasLengthInPrompt
                      ? "We detected your article length preference in your prompt!"
                      : "We detected your preferred tone in your prompt!"}
                  </p>
                )}

                {/* ══════════════════════════════════════════════════════════════
                    GENERATE SECTION — 4 states, all shown in the same spot:
                    STATE 1: isGenerating=true          → spinner
                    STATE 2: !isGenerating && error     → error msg (3s → button)
                    STATE 3: !isGenerating && article   → article result + actions
                    STATE 4: !isGenerating && idle      → generate button
                ══════════════════════════════════════════════════════════════ */}
                <div className="generate-button-section">

                  {/* STATE 1: Spinner */}
                  {isGenerating && (
                    <div className="generate-loading-container">
                      <div className="loading-spinner">
                        <svg className="spinner-svg" width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                          <circle className="spinner-circle" cx="25" cy="25" r="20" fill="none" strokeWidth="5" stroke="#B4EFDD" strokeDasharray="125.6" strokeDashoffset="31.4" />
                          <circle className="spinner-circle-active" cx="25" cy="25" r="20" fill="none" strokeWidth="5" stroke="#1ABC9C" strokeDasharray="125.6" strokeDashoffset="31.4" />
                        </svg>
                      </div>
                      <p className="loading-text">Generating the article..</p>
                    </div>
                  )}

                  {/* STATE 2: Error — auto-clears after 3s to show button */}
                  {!isGenerating && generateError && (
                    <div className="generate-loading-container">
                      <p style={{ color: "#e25457", fontFamily: "Inter, sans-serif", fontSize: "15px", textAlign: "center" }}>
                        {generateError}
                      </p>
                    </div>
                  )}

                  {/* STATE 3: Article result shown inline */}
                  {!isGenerating && !generateError && generatedArticle && (
                    <div className="article-result-section" style={{ width: "100%" }}>
                      
                        <div className="result-left-side"></div>
                       
                          <p className="heres-article-text">Here&apos;s your article..</p>
                          
                          {/* Clickable title label → opens preview overlay */}
                          <div className="article-title-label" onClick={() => setShowPreview(true)}>
                            <span className="article-title-text">{generatedArticle.title}</span>
                            <svg className="open-book-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E1E1E" strokeWidth="2">
                              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                            </svg>
                          </div>
                         
                          {/* Action icons row */}
                          <br></br>
                          <div className="article-actions">
                            {/* ← Back button (from original page.jsx) */}
                            <button className="back-button" title="Back" onClick={() => { setGeneratedArticle(null); setCurrentView("input"); }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1ABC9C" strokeWidth="2">
                                <path d="M19 12H5"></path>
                                <path d="M12 19l-7-7 7-7"></path>
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

                  {/* STATE 4: Generate button (idle) */}
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

      {/* ── Insights sidebar ── */}
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
              <div key={index} className="insights-article-section">
                <div className="insights-article-header">
                  <span className="insights-article-number">{index + 1}</span>
                  <h4 className="insights-article-name">{article.title}</h4>
                </div>
                <div className="insights-author-section">
                  <p className="insights-author-name">{article.authors}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="insights-section-title">Trending topics</h3>
          <div className="trending-topics-buttons">
            {trendingTopics.map((topic, index) => (
              <button key={index} className="topic-button">{topic}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Loading Transition Overlay (analyze step only) ── */}
      {isLoadingTransition && (
        <div className="loading-transition-overlay">
          <div className="loading-spinner-container">
            {transitionError ? (
              <div style={{ textAlign: "center", padding: "24px" }}>
                <p style={{ color: "#ffffff", fontFamily: "Inter, sans-serif", fontSize: "16px", marginBottom: "8px" }}>{transitionError}</p>
                <p style={{ color: "#1ABC9C", fontFamily: "Inter, sans-serif", fontSize: "14px" }}>Redirecting you back...</p>
              </div>
            ) : (
              <div className="loading-spinner-transition"></div>
            )}
          </div>
        </div>
      )}

      {/* ── Preview Overlay ── */}
      {showPreview && generatedArticle && (
        <div
          className="preview-overlay"
          onMouseEnter={() => setIsCursorInsidePreview(false)}
          onClick={() => setIsCursorInsidePreview(false)}
        >
          {!isCursorInsidePreview && (
            <div
              className="preview-close-circle"
              onMouseEnter={() => setIsCursorInsidePreview(false)}
              onMouseLeave={() => setIsCursorInsidePreview(false)}
            >
              <button className="preview-close-button-circle" onClick={() => setShowPreview(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
                  <path d="M18 6L6 18"></path>
                  <path d="M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          )}

          <div
            className="preview-box"
            onMouseEnter={() => setIsCursorInsidePreview(true)}
            onMouseLeave={(e) => {
              const relatedTarget = e.relatedTarget;
              const isEnteringCloseButton = relatedTarget && relatedTarget.classList && (
                relatedTarget.classList.contains('preview-close-circle') ||
                relatedTarget.classList.contains('preview-close-button-circle') ||
                relatedTarget.classList.contains('preview-copy-icon') ||
                relatedTarget.classList.contains('preview-save-icon') ||
                relatedTarget.classList.contains('preview-edit-button')
              );
              if (!isEnteringCloseButton) setIsCursorInsidePreview(false);
            }}
          >
            {/* Preview Header */}
            <div className="preview-header">
              <div className="preview-header-actions">
                <button className="preview-copy-icon" title="Copy" onClick={handleCopyToClipboard}>
                  {isCopied ? (
                    <span className="preview-copied-message">copied to clipboard</span>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1ABC9C" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  )}
                </button>

                {/* Save draft — POSTs to route.js mock API */}
                <button className="preview-save-icon" title="save to unpublished articles" onClick={handleSaveDraft}>
                  <img src="/icons/Save.png" alt="Save" width="16" height="16" />
                  <span className="preview-save-text">save draft</span>
                </button>

                <button className="preview-edit-button" title="Edit">
                  <span className="preview-edit-text">edit</span>
                </button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="preview-content">
              <div className="preview-article-info">
                <h3 className="preview-article-title">{generatedArticle.title}</h3>
                <p className="preview-article-excerpt">{generatedArticle.content}</p>
              </div>
              <div className="preview-actions">
                <button className="preview-action-button"></button>
              </div>
            </div>

            {/* Footer — word count from backend validation */}
            <div className="preview-footer">
              <span className="preview-word-count">
                word count: {generatedArticle.wordCount ?? generatedArticle.content.split(' ').length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}