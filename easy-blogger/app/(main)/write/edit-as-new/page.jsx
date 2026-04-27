"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
} from "../../../../lib/articles/previewContext";
import {
  autosaveEditAsNew,
  discardEditAsNew,
  getDraftById,
  saveEditAsNewAsDraft,
  startEditAsNew,
} from "../../../../lib/articles/api";
import { openPreviewSaveConfirm } from "../../../../lib/articles/previewConfirm";
import { getEditorValidationError } from "../../../../lib/articles/articleEditorValidation";

export default function EditAsNewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sourceArticleId = searchParams.get("id");

  // Reuses shared editor state so all editor flows behave consistently.
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

  const [editingArticleId, setEditingArticleId] = useState(null);

  const { modalState, openModal, closeModal } = useConfirmDialog();
  const hasStartedRef = useRef(false); // Prevents duplicate edit-as-new draft creation during re-renders or React strict-mode effects.

  // Keeps derived editor values synced when content changes.
  useEffect(() => {
    syncEditorDerivedState();
  }, [content, syncEditorDerivedState]);

  // Restores preview-return state first to avoid creating duplicate copied drafts.
  useEffect(() => {
    if (!isClientReady) {
      return;
    }

    if (!sourceArticleId) {
      router.push("/write/unpublished");
      return;
    }

    if (hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;
    // Resume an existing preview draft when possible; otherwise create a new copy from the source article.
    const hydrateEditor = async () => {
      try {
        const previewContext = readPreviewContext();
        // Returning from preview should reuse the same copied draft instead of starting another copy.
        if (
          previewContext?.mode === "edit-as-new" &&
          previewContext?.sourceId === sourceArticleId &&
          previewContext?.id
        ) {
          const response = await getDraftById(previewContext.id);
          const article = getArticleFromResponse(response);

          if (article) {
            setEditingArticleId(article.id);
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

        const response = await startEditAsNew(sourceArticleId);
        const article = getArticleFromResponse(response);

        if (!article) {
          throw new Error("Article not found.");
        }

        setEditingArticleId(article.id);
        setTitle(article.title || "");
        setContent(article.content || "");
        setCoverImage(article.coverImage || null);
        setLastSavedAt(article.updatedAt ? new Date(article.updatedAt) : null);
      } catch (error) {
        console.error("Failed to hydrate edit-as-new editor:", error);
        router.push("/write/unpublished");
      } finally {
        setIsHydrating(false);
      }
    };

    void hydrateEditor();
  }, [isClientReady, router, sourceArticleId]);

  // Saves only to the copied draft so the original article always remains untouched.
  const saveArticle = useCallback(
    async (mode, overrides = {}) => {
      if (!editingArticleId || isSavingRef.current) {
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

      // Avoid empty writes if the copied article somehow has no editable content.
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
            ? await saveEditAsNewAsDraft(editingArticleId, payload)
            : await autosaveEditAsNew(editingArticleId, payload);

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
      coverImage,
      editingArticleId,
      getEditorHtmlContent,
      isSavingRef,
      setContent,
      setEditorTextLength,
      setIsSaving,
      setLastSavedAt,
      title,
    ],
  );

  // Autosave persists changes to the copied draft after the initial copy has loaded.
  useAutosave({
    enabled: isClientReady && !isHydrating && hasAnyContent,
    onSave: () =>
      saveArticle("editing", {
        content: getEditorHtmlContent(),
      }),
    watchValues: [title, content, coverImage],
  });

  // Validates editor content before converting the copied article into a visible draft.
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
      console.error("Failed to save edit-as-new article as draft:", error);
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

  // Discard deletes only the copied draft and leaves the original article untouched.
  const discardWithoutRedirect = useCallback(async () => {
    if (!editingArticleId) {
      clearPreviewContext();
      return true;
    }

    try {
      await discardEditAsNew(editingArticleId);
      clearPreviewContext();
      return true;
    } catch (error) {
      const message = error?.message || error?.response?.data?.message || "";

      const isAlreadyGone =
        typeof message === "string" &&
        message.toLowerCase().includes("article not found");

      if (isAlreadyGone) {
        clearPreviewContext();
        return true;
      }

      console.error("Failed to discard edit-as-new article:", error);
      setInlineError("Failed to discard changes.");
      return false;
    }
  }, [editingArticleId, setInlineError]);

  // Leaving the editor should ask whether to keep or delete the copied draft.
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
  // Redirects only after save succeeds so unpublished always shows the latest draft.
  const handleSaveAsDraft = useCallback(async () => {
    const didSave = await saveDraftWithoutRedirect();
    if (!didSave) return;

    router.push("/write/unpublished");
  }, [router, saveDraftWithoutRedirect]);

  // Confirm discard because edit-as-new creates a separate draft copy that will be removed.
  const handleDiscard = useCallback(async () => {
    if (!editingArticleId) return;

    openModal({
      title: "Discard changes?",
      message:
        "This will permanently delete the new article copy created for edit-as-new.",
      confirmText: "Yes",
      cancelText: "No",
      onConfirm: async () => {
        const didDiscard = await discardWithoutRedirect();
        if (!didDiscard) return;

        closeModal();
        router.push("/write/unpublished");
      },
      onCancel: async () => {},
    });
  }, [closeModal, discardWithoutRedirect, editingArticleId, openModal, router]);

  // Save the copied draft before preview so preview reads the latest copy by id.
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
          await saveArticle("draft", { content: htmlContent });

          router.push(
            `/write/preview?id=${editingArticleId}&mode=edit-as-new&sourceId=${sourceArticleId}`,
          );
        } catch (error) {
          console.error("Failed to prepare article preview:", error);
          setInlineError("Failed to open preview.");
        }
      },
    });
  }, [
    closeModal,
    contentLimitError,
    editingArticleId,
    getEditorHtmlContent,
    getEditorPlainTextContent,
    isContentLimitReached,
    openModal,
    router,
    saveArticle,
    setInlineError,
    sourceArticleId,
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
            <EditorInlineError
              title="Content required"
              message={inlineError}
            />
          </div>
        </div>

        <div ref={editingSectionRef}>
          {/* Keeps page logic separate while the shared shell handles reusable editor UI. */} 
          <ArticleEditorShell
            editorRef={editorRef}
            title={title}
            onTitleChange={handleTitleChange}
            titleReadOnly // The title stays locked because edit-as-new reuses the original article's title by design.
            titleHelperText="This title is copied from the original article and cannot be changed."
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
            headerTitle="Edit as a New Article"
            headerSubtitle="Create a brand new article using the same title"
            modeBadge="New Article Copy"
            onSaveAsDraft={handleSaveAsDraft}
            onPreview={handlePreview}
            onDiscard={handleDiscard}
            onExit={() => {
              pendingExternalActionRef.current = () => {
                router.push("/write/unpublished");
              };
              handleExternalActionAttempt();
            }}
            disableSaveAsDraft={!hasValidContent || !editingArticleId}
            disablePreview={!hasValidContent || !editingArticleId}
            disableDiscard={isSaving || isHydrating || !editingArticleId}
            editorTextLength={editorTextLength}
            contentLimitError={contentLimitError}
            onContentLimitErrorChange={setContentLimitError}
          />
        </div>
      </div>
    </>
  );
}
