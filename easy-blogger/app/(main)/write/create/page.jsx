"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import ArticleEditorShell from "../../../../components/article/ArticleEditorShell";
import ConfirmDialog from "../../../../components/article/ConfirmDialog";
import EditorInlineError from "../../../../components/article/EditorInlineError";

import { useArticleEditorController } from "../../../../hooks/articles/useArticleEditorController";
import { useAutosave } from "../../../../hooks/articles/useAutoSave";
import { useConfirmDialog } from "../../../../hooks/articles/useConfirmDialog";
import { useEditorNavigationGuard } from "../../../../hooks/articles/useEditorNavigationGuard";

import {
  getEditorValidationError,
} from "../../../../lib/articles/articleEditorValidation";
import {
  createDraft,
  deleteDraft,
  getCurrentEditingDraft,
  getDraftById,
  updateDraft,
} from "../../../../lib/articles/api";
import {
  buildArticlePayload,
  getArticleFromResponse,
  getArticleIdFromResponse,
  getPlainTextFromHtml,
} from "../../../../lib/articles/editorHelpers";
import { openPreviewSaveConfirm } from "../../../../lib/articles/previewConfirm";
import {
  clearPreviewContext,
  readPreviewContext,
  writePreviewContext,
} from "../../../../lib/articles/previewContext";

export default function CreateArticlePage() {
  const router = useRouter();

  // Reuses shared editor state so all writing flows stay consistent across pages.
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

  const [draftId, setDraftId] = useState(null);
  const [articleMode, setArticleMode] = useState("new");

  const { modalState, openModal, closeModal } = useConfirmDialog();

  const hasHydratedRef = useRef(false);
  
  const lastSavedSnapshotRef = useRef(""); // Tracks the last persisted editor state so autosave can avoid duplicate saves.

  // Normalizes editor values before comparison so change detection stays reliable.
  const getSnapshot = useCallback(
    (overrides = {}) => {
      const nextTitle =
        typeof overrides.title === "string" ? overrides.title : title;
      const nextContent =
        typeof overrides.content === "string"
          ? overrides.content
          : getEditorHtmlContent();
      const nextCoverImage =
        overrides.coverImage !== undefined ? overrides.coverImage : coverImage;

      return JSON.stringify({
        title: nextTitle.trim(),
        content: nextContent,
        coverImage: nextCoverImage,
      });
    },
    [coverImage, getEditorHtmlContent, title],
  );

  // Keeps derived editor values synced whenever content changes.
  useEffect(() => {
    syncEditorDerivedState();
  }, [content, syncEditorDerivedState]);

  // Restore the editor from preview context first, then fall back to the user's active editing draft.
  useEffect(() => {
    if (!isClientReady || hasHydratedRef.current) return;

    hasHydratedRef.current = true;

    const hydrateEditor = async () => {
      try {
        const previewContext = readPreviewContext(); // Keeps preview-return navigation attached to the same draft.

        if (previewContext?.mode === "create" && previewContext?.id) {
          const response = await getDraftById(previewContext.id);
          const article = getArticleFromResponse(response);

          if (article) {
            setDraftId(article.id);
            setTitle(article.title || "");
            setContent(article.content || "");
            setCoverImage(article.coverImage || null);
            setLastSavedAt(
              article.updatedAt ? new Date(article.updatedAt) : null,
            );
            setArticleMode(article.status === "DRAFT" ? "draft" : "new");

            lastSavedSnapshotRef.current = JSON.stringify({
              title: (article.title || "").trim(),
              content: article.content || "",
              coverImage: article.coverImage || null,
            });

            setIsHydrating(false);
            return;
          }
        }

        const response = await getCurrentEditingDraft();
        const article = getArticleFromResponse(response);

        if (article) {
          setDraftId(article.id);
          setTitle(article.title || "");
          setContent(article.content || "");
          setCoverImage(article.coverImage || null);
          setLastSavedAt(article.updatedAt ? new Date(article.updatedAt) : null);
          setArticleMode(article.status === "DRAFT" ? "draft" : "new");

          lastSavedSnapshotRef.current = JSON.stringify({
            title: (article.title || "").trim(),
            content: article.content || "",
            coverImage: article.coverImage || null,
          });
        } else {
          lastSavedSnapshotRef.current = JSON.stringify({
            title: "",
            content: "",
            coverImage: null,
          });
        }
      } catch (error) {
        console.error("Failed to hydrate create editor from database:", error);
        setInlineError("Failed to load the editor.");
      } finally {
        setIsHydrating(false);
      }
    };

    void hydrateEditor();
  }, [
    isClientReady,
    setContent,
    setCoverImage,
    setInlineError,
    setIsHydrating,
    setLastSavedAt,
    setTitle,
  ]);

  // Uses one save flow so create, autosave, draft save, and preview stay in sync.
  const saveArticle = useCallback(
    async (status, overrides = {}) => {
      if (isSavingRef.current) {
        return draftId;
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
      const hasContentToSave = Boolean(
        nextTitle.trim() || nextPlainText || nextCoverImage,
      );

      if (!hasContentToSave) {
        return draftId;
      }

      const currentSnapshot = getSnapshot({
        title: nextTitle,
        content: nextContent,
        coverImage: nextCoverImage,
      });

      // Autosave should be silent when the editor state has not changed.
      const isUnchangedEditingSave =
        status === "editing" &&
        currentSnapshot === lastSavedSnapshotRef.current;

      if (isUnchangedEditingSave) {
        return draftId;
      }

      const payload = buildArticlePayload({
        title: nextTitle,
        content: nextContent,
        coverImage: nextCoverImage,
        status,
      });

      try {
        isSavingRef.current = true;
        setIsSaving(true);

        let currentDraftId = draftId;

        if (!currentDraftId) {
          const response = await createDraft(payload);
          const createdId = getArticleIdFromResponse(response);

          if (!createdId) {
            throw new Error("Article id was not returned from createDraft.");
          }

          currentDraftId = createdId;
          setDraftId(createdId);
        } else {
          await updateDraft(currentDraftId, payload);
        }

        lastSavedSnapshotRef.current = currentSnapshot;
        setLastSavedAt(new Date());
        setContent(nextContent);
        setEditorTextLength(nextPlainText.length);

        return currentDraftId;
      } finally {
        setIsSaving(false);
        isSavingRef.current = false;
      }
    },
    [
      coverImage,
      draftId,
      getEditorHtmlContent,
      getSnapshot,
      isSavingRef,
      setContent,
      setEditorTextLength,
      setIsSaving,
      setLastSavedAt,
      title,
    ],
  );

  // Autosave only starts after hydration to prevent saving partially restored state.
  useAutosave({
    enabled: isClientReady && !isHydrating && hasAnyContent,
    onSave: () =>
      saveArticle("editing", {
        content: getEditorHtmlContent(),
      }),
    watchValues: [title, content, coverImage],
  });

  // Reset both route-specific draft state and shared editor state after discard.
  const resetEditorState = useCallback(() => {
    setDraftId(null);
    setTitle("");
    setContent("");
    setCoverImage(null);
    setLastSavedAt(null);
    setArticleMode("new");
    setInlineError("");
    setEditorTextLength(0);

    lastSavedSnapshotRef.current = JSON.stringify({
      title: "",
      content: "",
      coverImage: null,
    });

    if (coverImageUpload.fileInputRef.current) {
      coverImageUpload.fileInputRef.current.value = "";
    }

    clearPreviewContext();
  }, [
    coverImageUpload.fileInputRef,
    setContent,
    setCoverImage,
    setEditorTextLength,
    setInlineError,
    setLastSavedAt,
    setTitle,
  ]);

  // Shared save path used by manual save, preview, and navigation guard.
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
      setArticleMode("draft");
      await saveArticle("draft", { content: htmlContent });
      clearPreviewContext();
      return true;
    } catch (error) {
      console.error("Failed to save article as draft:", error);
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
  // Discard removes the draft record because create mode has no original article to restore.
  const discardWithoutRedirect = useCallback(async () => {
    try {
      if (draftId) {
        await deleteDraft(draftId);
      }

      resetEditorState();
      return true;
    } catch (error) {
      console.error("Failed to delete draft:", error);
      setInlineError("Failed to discard the article.");
      return false;
    }
  }, [draftId, resetEditorState, setInlineError]);

  const { handleExternalActionAttempt, pendingExternalActionRef } =
    // Intercepts external navigation so users can save or discard before leaving the editor.
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

  // Redirects only after a successful save so unpublished always shows fresh data.
  const handleSaveAsDraft = useCallback(async () => {
    const didSave = await saveDraftWithoutRedirect();
    if (!didSave) return;

    router.push("/write/unpublished");
  }, [router, saveDraftWithoutRedirect]);

  // Confirms destructive action because discard permanently removes the current draft.
  const handleDiscard = useCallback(async () => {
    openModal({
      title: "Discard changes?",
      message:
        "This will permanently delete the current article draft and all unsaved changes.",
      confirmText: "Yes",
      cancelText: "No",
      onConfirm: async () => {
        const didDiscard = await discardWithoutRedirect();
        if (!didDiscard) return;

        closeModal();
        router.push("/home");
      },
      onCancel: async () => {},
      onClose: async () => {},
    });
  }, [closeModal, discardWithoutRedirect, openModal, router]);

  // Saves first so preview always loads the latest editor content from the database.
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
          setArticleMode("draft");

          const currentDraftId = await saveArticle("draft", {
            content: htmlContent,
          });

          writePreviewContext({
            mode: "create",
            id: currentDraftId,
          });

          router.push(`/write/preview?id=${currentDraftId}&mode=create`);
        } catch (error) {
          console.error("Failed to save article before preview:", error);
          setInlineError("Failed to open preview.");
        }
      },
    });
  }, [
    closeModal,
    contentLimitError,
    getEditorHtmlContent,
    getEditorPlainTextContent,
    isContentLimitReached,
    openModal,
    router,
    saveArticle,
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
          <div className="mx-auto max-w-5xl" data-skip-save-prompt="true">
            <EditorInlineError
              title="Content required"
              message={inlineError}
            />
          </div>
        </div>

        <div ref={editingSectionRef}>
          {/* Keeps page logic here while the shared shell handles reusable editor UI. */} 
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
            headerTitle="Create your Article"
            headerSubtitle="Create your own Article here"
            modeBadge={articleMode === "draft" ? "Draft Article" : "New Article"}
            onSaveAsDraft={handleSaveAsDraft}
            onPreview={handlePreview}
            onDiscard={handleDiscard}
            onExit={() => {
              pendingExternalActionRef.current = () => {
                router.push("/home");
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
