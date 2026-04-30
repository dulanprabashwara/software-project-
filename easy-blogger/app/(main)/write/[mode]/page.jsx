/* easy-blogger/app/(main)/write/[mode]/page.jsx */

"use client";

import { useParams } from "next/navigation";
import ArticleEditorShell from "../../../../components/article/ArticleEditorShell";
import ConfirmDialog from "../../../../components/article/ConfirmDialog";
import EditorInlineError from "../../../../components/article/EditorInlineError";
import { useArticleEditorWorkflow } from "../../../../hooks/articles/useArticleEditorWorkflow";

/*
 Unified Article Editor Page.
 
 This page serves as a single entry point for Create, Edit, and Clone flows.
 By using the dynamic [mode] parameter, we eliminate the need for three separate 
 page files and ensure a consistent UI across all editing experiences.
 */
export default function UnifiedArticleEditorPage() {
  const params = useParams();
  // The 'mode' determines which configuration and API calls from WORKFLOW_CONFIG to use.
  const mode = params.mode;

  const {
    editorRef,
    editingSectionRef,
    isClientReady,
    title,
    handleTitleChange,
    content,
    handleContentChange,
    syncEditorDerivedState,
    coverImage,
    coverImageUpload,
    zoom,
    handleZoomChange,
    fontSize,
    isHydrating,
    isSaving,
    lastSavedAt,
    inlineError,
    editorTextLength,
    contentLimitError,
    setContentLimitError,
    hasValidContent,
    articleMode,
    modalState,
    handleSaveAsDraft,
    handlePreview,
    handleDiscard,
    handleExit,
    config,
  } = useArticleEditorWorkflow(mode);

  if (!isClientReady) {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <>
      <ConfirmDialog
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        isLoading={modalState.isLoading}
        onConfirm={modalState.onConfirm}
        onCancel={modalState.onCancel}
        onClose={modalState.onClose}
      />

      <div className="min-h-screen bg-white">
        <div className="px-8 pt-8">
          <div className="mx-auto max-w-5xl" data-skip-save-prompt="true">
            <EditorInlineError
              title="Content required"
              message={inlineError}
            />
          </div>
        </div>

        <div ref={editingSectionRef}>
          <ArticleEditorShell
            editorRef={editorRef}
            title={title}
            onTitleChange={handleTitleChange}
            titleReadOnly={config.isTitleReadOnly}
            titleHelperText={config.titleHelperText}
            content={content}
            onContentChange={handleContentChange}
            onEditorReady={syncEditorDerivedState}
            coverImage={coverImage}
            coverImageProps={coverImageUpload}
            zoom={zoom}
            onZoomChange={handleZoomChange}
            fontSize={fontSize}
            isHydrating={isHydrating}
            isSaving={isSaving}
            lastSavedAt={lastSavedAt}
            headerTitle={config.headerTitle}
            headerSubtitle={config.headerSubtitle}
            modeBadge={config.getBadge(articleMode)}
            onSaveAsDraft={handleSaveAsDraft}
            onPreview={handlePreview}
            onDiscard={handleDiscard}
            onExit={handleExit}
            disableSaveAsDraft={!hasValidContent}
            disablePreview={!hasValidContent}
            disableDiscard={isSaving || isHydrating}
            editorTextLength={editorTextLength}
            contentLimitError={contentLimitError}
            onContentLimitErrorChange={setContentLimitError}
          />
        </div>
      </div>
    </>
  );
}
