"use client";

import TrendingArticleSlider from "../../../components/ai/TrendingArticleSlider";
import { MAX_PROMPT_WORDS } from "../../../hooks/useAIGenerator";

/**
 * InputView — View 1
 * Shows the trending article slider and the user's prompt textarea.
 */
export default function InputView({
  userInput,
  inputError,
  handleUserInputChange,
  handleContinueToKeywords,
  isContinueButtonDisabled,
  trendingArticles,
  savedArticles,
}) {
  return (
    <>
      {trendingArticles.length > 0 && (
        <div className="trending-section">
          <div className="trending-header">
            <img src="/icons/Trending icon.png" alt="Trending" className="trending-icon" />
            <h2 className="trending-title">Trending Articles</h2>
          </div>
          <TrendingArticleSlider articles={trendingArticles} savedArticles={savedArticles} />
        </div>
      )}

      <div className="user-input-section">
        <p className="user-prompt-text">Hello.. what do you hope to write today</p>

        <div className="user-textbox">
          <textarea
            value={userInput}
            onChange={handleUserInputChange}
            placeholder="Enter your article idea.."
          />
          <span className="word-count">
            {userInput.trim().split(" ").filter((w) => w.length > 0).length}/{MAX_PROMPT_WORDS} words
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
      </div>
    </>
  );
}
