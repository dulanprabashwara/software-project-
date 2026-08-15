/**
 * AI Article Generator — Main Page
 * Route: /ai-generate
 *
*/

"use client";

import useAIGenerator  from "../../../hooks/useAIGenerator";
import ArticlesView    from "./ArticlesView";
import InputView       from "./InputView";
import KeywordsView    from "./KeywordsView";
import PreviewOverlay  from "./PreviewOverlay";
import InsightsSidebar from "../../../components/ai/InsightsSidebar";

import "../../../styles/ai-article-generator/ai-article-generator.css";
import "../../../styles/ai-article-generator/ai-article-generator-view2.css";
import "../../../styles/ai-article-generator/articles-view.css";

export default function AIArticleGeneratorPage() {
  const ai = useAIGenerator();

  // ── Loading / gate screens ──────────────────────────────────────────────

  if (ai.isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1ABC9C]"></div>
      </div>
    );
  }
  if (!ai.isPremium) return null;

  // ── Articles view ───────────────────────────────────────────────────────

  if (ai.currentView === "articles") {
    return (
      <ArticlesView
        articles={ai.articles}
        articlesLoading={ai.articlesLoading}
        deletedLog={ai.deletedLog}
        restoreCountdown={ai.restoreCountdown}
        showDeleteWarning={ai.showDeleteWarning}
        pendingSecondDelete={ai.pendingSecondDelete}
        topAIArticles={ai.topAIArticles}
        trendingKeywords={ai.trendingKeywords}
        setCurrentView={ai.setCurrentView}
        handleDeleteArticle={ai.handleDeleteArticle}
        handleRestoreArticle={ai.handleRestoreArticle}
        handleConfirmSecondDelete={ai.handleConfirmSecondDelete}
        handleCancelSecondDelete={ai.handleCancelSecondDelete}
        fetchArticleLogs={ai.fetchArticleLogs}
      />
    );
  }

  // ── Main input + keywords view ──────────────────────────────────────────

  return (
    <div className="flex min-h-full overflow-y-auto">
      <div className="ai-generator-main flex-1">
        <div className="ai-content-wrapper">

          {/* ── Page header ── */}
          <div className="ai-generator-title justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => { ai.setCurrentView("articles"); ai.fetchArticleLogs(); }}
                className="p-2 hover:bg-[#F8FAFC] rounded-lg transition-colors duration-150"
                title="view articles"
              >
                <img src="/icons/menu icon.png" alt="Menu" className="ai-generator-menu-icon" />
              </button>
              <img src="/icons/Ai article generator icon teel color.png" alt="AI" className="ai-generator-ai-icon" />
              <h1 className="ai-generator-title-text">AI Article Generator</h1>
            </div>
          </div>

          {/* ── View 1: prompt input ── */}
          {ai.currentView === "input" && (
            <InputView
              userInput={ai.userInput}
              inputError={ai.inputError}
              handleUserInputChange={ai.handleUserInputChange}
              handleContinueToKeywords={ai.handleContinueToKeywords}
              isContinueButtonDisabled={ai.isContinueButtonDisabled}
              trendingArticles={ai.trendingArticles}
              savedArticles={ai.savedArticles}
            />
          )}

          {/* ── View 2 / 3: keywords, settings, generate ── */}
          {ai.currentView === "keywords" && (
            <KeywordsView
              aiKeywords={ai.aiKeywords}
              selectedKeywords={ai.selectedKeywords}
              handleKeywordToggle={ai.handleKeywordToggle}
              noKeywordsFound={ai.noKeywordsFound}
              hasLengthInPrompt={ai.hasLengthInPrompt}
              articleLength={ai.articleLength}
              setArticleLength={ai.setArticleLength}
              isDropdownOpen={ai.isDropdownOpen}
              setIsDropdownOpen={ai.setIsDropdownOpen}
              getArticleLengthDisplay={ai.getArticleLengthDisplay}
              hasToneInPrompt={ai.hasToneInPrompt}
              tone={ai.tone}
              setTone={ai.setTone}
              isGenerating={ai.isGenerating}
              generateError={ai.generateError}
              generatedArticle={ai.generatedArticle}
              handleGenerateArticle={ai.handleGenerateArticle}
              handleRegenerateArticle={ai.handleRegenerateArticle}
              isGenerateButtonDisabled={ai.isGenerateButtonDisabled}
              userResponse={ai.userResponse}
              handleUserResponse={ai.handleUserResponse}
              setShowPreview={ai.setShowPreview}
              setCurrentView={ai.setCurrentView}
              setGeneratedArticle={ai.setGeneratedArticle}
              setUserResponse={ai.setUserResponse}
              isSavingDraft={ai.isSavingDraft}
              draftSaveStatus={ai.draftSaveStatus}
              handleSaveDraft={ai.handleSaveDraft}
              saveDraftLabel={ai.saveDraftLabel}
              isLoadingEditor={ai.isLoadingEditor}
              handleEditInEditor={ai.handleEditInEditor}
            />
          )}

        </div>
      </div>

      <InsightsSidebar topAIArticles={ai.topAIArticles} trendingKeywords={ai.trendingKeywords} />

      {/* ── Loading transition overlay ── */}
      {ai.isLoadingTransition && (
        <div className="loading-transition-overlay">
          <div className="loading-spinner-container">
            {ai.transitionError ? (
              <div className="transition-error-container">
                <p className="transition-error-message">{ai.transitionError}</p>
                <p className="transition-error-redirect">Redirecting you back...</p>
              </div>
            ) : (
              <div className="loading-spinner-transition"></div>
            )}
          </div>
        </div>
      )}

      {/* ── Article preview overlay ── */}
      {ai.showPreview && ai.generatedArticle && (
        <PreviewOverlay
          generatedArticle={ai.generatedArticle}
          isCursorInsidePreview={ai.isCursorInsidePreview}
          setIsCursorInsidePreview={ai.setIsCursorInsidePreview}
          setShowPreview={ai.setShowPreview}
          isCopied={ai.isCopied}
          handleCopyToClipboard={ai.handleCopyToClipboard}
          isSavingDraft={ai.isSavingDraft}
          draftSaveStatus={ai.draftSaveStatus}
          handleSaveDraft={ai.handleSaveDraft}
          saveDraftLabel={ai.saveDraftLabel}
          isLoadingEditor={ai.isLoadingEditor}
          handleEditInEditor={ai.handleEditInEditor}
        />
      )}
    </div>
  );
}
