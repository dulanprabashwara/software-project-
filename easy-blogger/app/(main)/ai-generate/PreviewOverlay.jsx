"use client";

/**
 * PreviewOverlay — Article preview modal
 * Shown when the user clicks the generated article title to read it in full.
 */
export default function PreviewOverlay({
  generatedArticle,
  isCursorInsidePreview,
  setIsCursorInsidePreview,
  setShowPreview,
  isCopied,
  handleCopyToClipboard,
  isSavingDraft,
  draftSaveStatus,
  handleSaveDraft,
  saveDraftLabel,
  isLoadingEditor,
  handleEditInEditor,
}) {
  return (
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
          const isClose =
            rel?.classList &&
            (rel.classList.contains("preview-close-circle") ||
              rel.classList.contains("preview-close-button-circle") ||
              rel.classList.contains("preview-copy-icon") ||
              rel.classList.contains("preview-save-icon") ||
              rel.classList.contains("preview-edit-button"));
          if (!isClose) setIsCursorInsidePreview(false);
        }}
      >
        <div className="preview-header">
          <div className="preview-header-actions">

            {/* Copy button */}
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

            {/* Save to drafts button */}
            <button
              className="preview-save-icon"
              title="Save to drafts"
              onClick={handleSaveDraft}
              disabled={isSavingDraft || draftSaveStatus === "saved" || draftSaveStatus === "already_saved"}
              data-saved={draftSaveStatus === "saved" || draftSaveStatus === "already_saved" ? "true" : undefined}
            >
              <img src="/icons/Save.png" alt="Save" width="16" height="16" />
              <span className="preview-save-text">{saveDraftLabel()}</span>
            </button>

            {/* Edit in editor button */}
            <button
              className="preview-edit-button"
              title="Edit in editor"
              onClick={handleEditInEditor}
              disabled={isLoadingEditor}
              data-loading={isLoadingEditor ? "true" : undefined}
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
          <div className="preview-footer">
            <span className="preview-word-count">
              word count: {generatedArticle.wordCount ?? generatedArticle.content.split(" ").length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
