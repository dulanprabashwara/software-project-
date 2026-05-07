"use client";

import { MAX_KEYWORDS_SELECTABLE } from "../../../hooks/useAIGenerator";

// ── Article length options ────────────────────────────────────────────────────
const LENGTH_OPTIONS = [
  { value: "short",      label: "Short",      range: "300-1000"  },
  { value: "mid-length", label: "Mid-length", range: "1000-2000" },
  { value: "long",       label: "Long",       range: "2000+"     },
];

const TONE_OPTIONS = ["professional", "casual", "humorous"];

/**
 * KeywordsView — View 2 / 3
 * Keyword selection, article length dropdown, tone radio buttons,
 * generate button, and the generated article result area.
 */
export default function KeywordsView({
  // keyword state
  aiKeywords, selectedKeywords, handleKeywordToggle, noKeywordsFound,
  // length state
  hasLengthInPrompt, articleLength, setArticleLength,
  isDropdownOpen, setIsDropdownOpen, getArticleLengthDisplay,
  // tone state
  hasToneInPrompt, tone, setTone,
  // generate state
  isGenerating, generateError, generatedArticle,
  handleGenerateArticle, handleRegenerateArticle,
  isGenerateButtonDisabled,
  // result actions
  userResponse, handleUserResponse,
  setShowPreview, setCurrentView, setGeneratedArticle, setUserResponse,
  // draft
  isSavingDraft, draftSaveStatus, handleSaveDraft, saveDraftLabel,
  isLoadingEditor, handleEditInEditor,
}) {
  return (
    <div className="user-input-section">
      <p className="user-prompt-text">Hello.. what do you hope to write today</p>

      {/* ── Keywords ── */}
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
                className={`keyword-button ${selectedKeywords.includes(keyword) ? "selected" : ""} ${
                  selectedKeywords.length >= MAX_KEYWORDS_SELECTABLE && !selectedKeywords.includes(keyword)
                    ? "disabled"
                    : ""
                }`}
                disabled={
                  selectedKeywords.length >= MAX_KEYWORDS_SELECTABLE &&
                  !selectedKeywords.includes(keyword)
                }
              >
                {keyword}
              </button>
            ))}
          </div>
          <p className="selected-keywords-title">
            {selectedKeywords.length === MAX_KEYWORDS_SELECTABLE
              ? `selected: ${MAX_KEYWORDS_SELECTABLE} keywords (Maximum)`
              : `selected: ${selectedKeywords.length} keywords`}
          </p>
        </div>
      )}

      {/* ── Article length dropdown ── */}
      {!hasLengthInPrompt && (
        <div className="article-length-section">
          <p className="article-length-text">Article Length :</p>
          <div className="article-length-dropdown">
            <div className="dropdown-header" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <div className="dropdown-header-content">
                <span className="dropdown-header-left">{getArticleLengthDisplay().left}</span>
                <span className="dropdown-header-right">{getArticleLengthDisplay().right}</span>
              </div>
              <svg
                className={`dropdown-arrow ${isDropdownOpen ? "open" : ""}`}
                width="12" height="8" viewBox="0 0 12 8" fill="none"
              >
                <path d="M1 1L6 6L11 1" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                {LENGTH_OPTIONS.map(({ value, label, range }) => (
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

      {/* ── Tone radio buttons ── */}
      {!hasToneInPrompt && (
        <div className={`tone-selection-section ${isDropdownOpen ? "dropdown-open" : ""}`}>
          <p className="tone-text">Tone :</p>
          <div className="tone-options">
            {TONE_OPTIONS.map((toneOption) => (
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

      {/* ── Prompt detection notice ── */}
      {(hasLengthInPrompt || hasToneInPrompt) && (
        <p className="prompt-detection-message">
          ✓{" "}
          {hasLengthInPrompt && hasToneInPrompt
            ? "We detected your length and tone preference in your prompt — skipping those selections!"
            : hasLengthInPrompt
            ? "We detected your article length preference in your prompt!"
            : "We detected your preferred tone in your prompt!"}
        </p>
      )}

      {/* ── Generate / result area ── */}
      <div className="generate-button-section">

        {isGenerating && (
          <div className="generate-loading-container">
            <div className="loading-spinner">
              <svg className="spinner-svg" width="50" height="50" viewBox="0 0 50 50">
                <circle className="spinner-circle"        cx="25" cy="25" r="20" fill="none" strokeWidth="5" stroke="#B4EFDD" strokeDasharray="125.6" strokeDashoffset="31.4" />
                <circle className="spinner-circle-active" cx="25" cy="25" r="20" fill="none" strokeWidth="5" stroke="#1ABC9C" strokeDasharray="125.6" strokeDashoffset="31.4" />
              </svg>
            </div>
            <p className="loading-text">Generating the article..</p>
          </div>
        )}

        {!isGenerating && generateError && (
          <div className="generate-loading-container">
            <p className="generate-error-message">{generateError}</p>
          </div>
        )}

        {!isGenerating && !generateError && generatedArticle && (
          <div className="article-result-section article-result-section--full-width">
            <p className="heres-article-text">Here&apos;s your article..</p>
            <div className="article-title-label" onClick={() => setShowPreview(true)}>
              <span className="article-title-text">{generatedArticle.title}</span>
              <svg className="open-book-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E1E1E" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
            </div>
            <div className="article-actions">
              <button
                className="back-button"
                onClick={() => { setGeneratedArticle(null); setUserResponse(null); setCurrentView("input"); }}
              >
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
              <button
                className="action-icon"
                title="Like"
                onClick={() => handleUserResponse("satisfied")}
              >
                <svg
                  width="16" height="16" viewBox="0 0 24 24" strokeWidth="2"
                  fill={userResponse === "satisfied" ? "#1ABC9C" : "none"}
                  stroke={userResponse === "satisfied" ? "#1ABC9C" : "currentColor"}
                >
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                </svg>
              </button>
              <button
                className="action-icon"
                title="Dislike"
                onClick={() => handleUserResponse("dissatisfied")}
              >
                <svg
                  width="16" height="16" viewBox="0 0 24 24" strokeWidth="2"
                  fill={userResponse === "dissatisfied" ? "#1ABC9C" : "none"}
                  stroke={userResponse === "dissatisfied" ? "#1ABC9C" : "currentColor"}
                >
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
    </div>
  );
}
