"use client";

import { useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import ArticleEditorShell from "../../../../components/article/ArticleEditorShell";
import ConfirmDialog from "../../../../components/article/ConfirmDialog";
import EditorInlineError from "../../../../components/article/EditorInlineError";

import { useAutosave } from "../../../../hooks/articles/useAutoSave";
import { useConfirmDialog } from "../../../../hooks/articles/useConfirmDialog";
import { useEditorNavigationGuard } from "../../../../hooks/articles/useEditorNavigationGuard";
import { useArticleEditorController } from "../../../../hooks/articles/useArticleEditorController";

import {
  getArticleFromResponse,
  getPlainTextFromHtml,
} from "../../../../lib/articles/editorHelpers";
import {
  clearPreviewContext,
  readPreviewContext,
  writePreviewContext,
} from "../../../../lib/articles/previewContext";
import { getEditorValidationError } from "../../../../lib/articles/articleEditorValidation";
import {
  autosaveEditExisting,
  discardEditExisting,
  getDraftById,
  saveEditExistingAsDraft,
  saveEditExistingForPreview,
  startEditExisting,
} from "../../../../lib/articles/api";
import { openPreviewSaveConfirm } from "../../../../lib/articles/previewConfirm";

export default function EditExistingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const articleId = searchParams.get("id");

  // Centralizes shared editor state so create/edit pages stay consistent.
  const {
    editorRef,
    isSavingRef,
    editingSectionRef,

    isClientReady,

    title,
    setTitle,
    handleTitleChange,

    content,
    setContent,
    handleContentChange,

    coverImage,
    setCoverImage,
    coverImageUpload,

    isSaving,
    setIsSaving,
    lastSavedAt,
    setLastSavedAt,

    zoom,
    handleZoomChange,
    fontSize,

    inlineError,
    setInlineError,

    contentLimitError,
    setContentLimitError,

    editorTextLength,
    setEditorTextLength,

    isHydrating,
    setIsHydrating,

    getEditorHtmlContent,
    getEditorPlainTextContent,
    syncEditorDerivedState,

    hasAnyContent,
    hasValidContent,
    isContentLimitReached,
  } = useArticleEditorController();

  const { modalState, openModal, closeModal } = useConfirmDialog();

  // Keeps derived editor values in sync with content changes.
  useEffect(() => {
    syncEditorDerivedState();
  }, [content, syncEditorDerivedState]);

  // Restores preview-return state before starting a fresh edit session.
  useEffect(() => {
    if (!isClientReady) {
      return;
    }

    if (!articleId) {
      router.push("/write/unpublished");
      return;
    }

    const hydrateEditor = async () => {
      try {
        const previewContext = readPreviewContext();

        if (
          previewContext?.mode === "edit-existing" &&
          previewContext?.id === articleId
        ) {
          const response = await getDraftById(articleId);
          const article = getArticleFromResponse(response);

          if (article) {
            setTitle(article.title || "");
            setContent(article.content || "");
            setCoverImage(article.coverImage || null);
            setLastSavedAt(
              article.updatedAt ? new Date(article.updatedAt) : null,
            );
            setIsHydrating(false);
            return;
          }
        }

        const response = await startEditExisting(articleId);
        const article = getArticleFromResponse(response);

        if (!article) {
          throw new Error("Article not found.");
        }

        setTitle(article.title || "");
        setContent(article.content || "");
        setCoverImage(article.coverImage || null);
        setLastSavedAt(article.updatedAt ? new Date(article.updatedAt) : null);
      } catch (error) {
        console.error("Failed to hydrate edit-existing editor:", error);
        setInlineError("Failed to load the article.");
        router.push("/write/unpublished");
      } finally {
        setIsHydrating(false);
      }
    };

    void hydrateEditor();
  }, [articleId, isClientReady, router]);

  // Uses one save path for autosave and draft save to avoid duplicate persistence logic.
  const saveArticle = useCallback(
    async (mode, overrides = {}) => {
      if (!articleId || isSavingRef.current) {
        return null;
      }

      const nextTitle =
        typeof overrides.title === "string" ? overrides.title : title;
      const nextContent =
        typeof overrides.content === "string"
          ? overrides.content
          : getEditorHtmlContent();
      const nextCoverImage =
        overrides.coverImage !== undefined ? overrides.coverImage : coverImage;

      const nextPlainText = getPlainTextFromHtml(nextContent);
      const canSave = Boolean(
        nextTitle.trim() || nextPlainText || nextCoverImage,
      );

      if (!canSave) {
        return null;
      }

      const payload = {
        title: nextTitle,
        content: nextContent,
        coverImage: nextCoverImage,
      };

      try {
        isSavingRef.current = true;
        setIsSaving(true);

        const response =
          mode === "draft"
            ? await saveEditExistingAsDraft(articleId, payload)
            : await autosaveEditExisting(articleId, payload);

        const article = getArticleFromResponse(response);

        setLastSavedAt(
          article?.updatedAt ? new Date(article.updatedAt) : new Date(),
        );
        setContent(nextContent);
        setEditorTextLength(nextPlainText.length);

        return article;
      } finally {
        setIsSaving(false);
        isSavingRef.current = false;
      }
    },
    [
      articleId,
      coverImage,
      getEditorHtmlContent,
      isSavingRef,
      setContent,
      setEditorTextLength,
      setIsSaving,
      setLastSavedAt,
      title,
    ],
  );

  // Saves in-progress edits automatically so users do not lose work.
  useAutosave({
    enabled: isClientReady && !isHydrating && hasAnyContent,
    onSave: () =>
      saveArticle("editing", {
        content: getEditorHtmlContent(),
      }),
    watchValues: [title, content, coverImage],
  });

  // Validates before saving because drafts should be complete enough to continue later.
  const saveDraftWithoutRedirect = useCallback(async () => {
    const plainTextContent = getEditorPlainTextContent();
    const htmlContent = getEditorHtmlContent();

    const validationError = getEditorValidationError({
      title,
      plainTextContent,
      contentLimitError,
      isContentLimitReached,
    });

    if (validationError) {
      setInlineError(validationError);
      return false;
    }

    try {
      setInlineError("");
      await saveArticle("draft", { content: htmlContent });
      clearPreviewContext();
      return true;
    } catch (error) {
      console.error("Failed to save edited article as draft:", error);
      setInlineError("Failed to save draft.");
      return false;
    }
  }, [
    contentLimitError,
    getEditorHtmlContent,
    getEditorPlainTextContent,
    isContentLimitReached,
    saveArticle,
    setInlineError,
    title,
  ]);

  // Delegates discard to the backend so the original article can be restored safely.
  const discardWithoutRedirect = useCallback(async () => {
    try {
      await discardEditExisting(articleId);
      clearPreviewContext();
      return true;
    } catch (error) {
      console.error("Failed to discard article changes:", error);
      setInlineError("Failed to discard changes.");
      return false;
    }
  }, [articleId, setInlineError]);

  // Protects users from losing edits when they navigate outside the editor.
  const { handleExternalActionAttempt, pendingExternalActionRef } =
    useEditorNavigationGuard({
      enabled: isClientReady,
      isHydrating,
      isSaving,
      isModalOpen: modalState.isOpen,
      editingSectionRef,
      openModal,
      closeModal,
      onSaveBeforeLeave: saveDraftWithoutRedirect,
      onDiscardBeforeLeave: discardWithoutRedirect,
    });
  
  // Redirects only after a successful draft save to avoid showing stale unpublished data.
  const handleSaveAsDraft = useCallback(async () => {
    const didSave = await saveDraftWithoutRedirect();
    if (!didSave) return false;

    router.push("/write/unpublished");
    return true;
  }, [router, saveDraftWithoutRedirect]);

  // Confirms destructive action because edit-existing can overwrite saved article changes.
  const handleDiscard = useCallback(async () => {
    openModal({
      title: "Discard changes?",
      message:
        "This will restore the article to how it was before you started editing.",
      confirmText: "Yes",
      cancelText: "No",
      onConfirm: async () => {
        const didDiscard = await discardWithoutRedirect();
        if (!didDiscard) return;

        closeModal();
        router.push("/write/unpublished");
      },
      onCancel: async () => {},
      onClose: async () => {},
    });
  }, [closeModal, discardWithoutRedirect, openModal, router]);

  // Saves a preview-safe version so preview always shows the latest editor content.
  const handlePreview = useCallback(async () => {
    const plainTextContent = getEditorPlainTextContent();
    const htmlContent = getEditorHtmlContent();

    const validationError = getEditorValidationError({
      title,
      plainTextContent,
      contentLimitError,
      isContentLimitReached,
    });

    if (validationError) {
      setInlineError(validationError);
      return;
    }

    openPreviewSaveConfirm({
      openModal,
      closeModal,
      onSaveAndPreview: async () => {
        try {
          setInlineError("");
          await saveEditExistingForPreview(articleId, {
            title,
            content: htmlContent,
            coverImage,
          });

          writePreviewContext({
            mode: "edit-existing",
            id: articleId,
          });

          router.push(`/write/preview?id=${articleId}&mode=edit-existing`);
        } catch (error) {
          console.error("Failed to prepare article preview:", error);
          setInlineError("Failed to open preview.");
        }
      },
    });
  }, [
    articleId,
    closeModal,
    contentLimitError,
    coverImage,
    getEditorHtmlContent,
    getEditorPlainTextContent,
    isContentLimitReached,
    openModal,
    router,
    setInlineError,
    title,
  ]);

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
          <div className="max-w-5xl mx-auto" data-skip-save-prompt="true">
            <EditorInlineError message={inlineError} />
          </div>
        </div>

        <div ref={editingSectionRef}>
          {/* Keeps page logic here while the reusable shell handles editor UI. */} 
          <ArticleEditorShell
            editorRef={editorRef}
            title={title}
            onTitleChange={handleTitleChange}
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
            headerTitle="Edit your Article"
            headerSubtitle="Update your existing article here"
            modeBadge="Editing Article"
            onSaveAsDraft={handleSaveAsDraft}
            onPreview={handlePreview}
            onDiscard={handleDiscard}
            onExit={() => {
              pendingExternalActionRef.current = () => {
                router.push("/write/unpublished");
              };
              handleExternalActionAttempt();
            }}
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
