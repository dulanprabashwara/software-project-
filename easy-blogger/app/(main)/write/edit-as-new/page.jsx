"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ArticleEditorShell from "../../../../components/article/ArticleEditorShell";
import ConfirmDialog from "../../../../components/article/ConfirmDialog";
import EditorInlineError from "../../../../components/article/EditorInlineError";

import { useAutosave } from "../../../../hooks/articles/useAutoSave";
import { useConfirmDialog } from "../../../../hooks/articles/useConfirmDialog";
import { useCoverImageUpload } from "../../../../hooks/articles/useCoverImageUpload";
import { getArticleFromResponse } from "../../../../lib/articles/editorHelpers";
import {clearPreviewContext,readPreviewContext,} from "../../../../lib/articles/previewContext";

import {autosaveEditAsNew,discardEditAsNew,getDraftById,saveEditAsNewAsDraft,startEditAsNew,} from "../../../../lib/articles/api";
import { openPreviewSaveConfirm } from "../../../../lib/articles/previewConfirm";
import {getEditorValidationError,isContentAtLimit,} from "../../../../lib/articles/articleEditorValidation";
import { useEditorNavigationGuard } from "../../../../hooks/articles/useEditorNavigationGuard";
function normalizePlainText(value) {
  return String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripHtmlToPlainText(html) {
  return normalizePlainText(String(html || "").replace(/<[^>]*>/g, " "));
}

export default function EditAsNewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sourceArticleId = searchParams.get("id");

  const [isClientReady, setIsClientReady] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [editingArticleId, setEditingArticleId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [fontSize, setFontSize] = useState(16);
  const [inlineError, setInlineError] = useState("");
  const [contentLimitError, setContentLimitError] = useState("");
  const [editorTextLength, setEditorTextLength] = useState(0);
  const [isHydrating, setIsHydrating] = useState(true);

  const { modalState, openModal, closeModal } = useConfirmDialog();

  const editorRef = useRef(null);
  const isSavingRef = useRef(false);
  const hasStartedRef = useRef(false);
  const editingSectionRef = useRef(null);
  

  const coverImageUpload = useCoverImageUpload({
    onChange: setCoverImage,
  });

  useEffect(() => {
    setIsClientReady(true);
  }, []);

  const getEditorHtmlContent = useCallback(() => {
    if (editorRef.current) {
      return editorRef.current.getContent() || "";
    }

    return content || "";
  }, [content]);

  const getEditorPlainTextContent = useCallback(() => {
    if (editorRef.current) {
      return normalizePlainText(
        editorRef.current.getContent({ format: "text" }),
      );
    }

    return stripHtmlToPlainText(content);
  }, [content]);

  const syncEditorDerivedState = useCallback(() => {
    const plainText = getEditorPlainTextContent();
    setEditorTextLength(plainText.length);

    if (plainText) {
      setInlineError("");
    }
  }, [getEditorPlainTextContent]);

  const hasAnyContent = Boolean(
    title.trim() || editorTextLength > 0 || coverImage,
  );

  const isContentLimitReached = isContentAtLimit(editorTextLength);
  const hasRequiredContent = Boolean(title.trim() && editorTextLength > 0);
  const hasValidContent =
    hasRequiredContent && !contentLimitError && !isContentLimitReached;

  useEffect(() => {
    syncEditorDerivedState();
  }, [content, syncEditorDerivedState]);

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

    const hydrateEditor = async () => {
      try {
        const previewContext = readPreviewContext();

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

      const nextPlainText = stripHtmlToPlainText(nextContent);
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
    [editingArticleId, title, coverImage, getEditorHtmlContent],
  );

  useAutosave({
    enabled: isClientReady && !isHydrating && hasAnyContent,
    onSave: () =>
      saveArticle("editing", {
        content: getEditorHtmlContent(),
      }),
    watchValues: [title, content, coverImage],
  });

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
    title,
  ]);

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
  }, [editingArticleId]);

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

  const handleSaveAsDraft = useCallback(async () => {
    const didSave = await saveDraftWithoutRedirect();
    if (!didSave) return;

    router.push("/write/unpublished");
  }, [router, saveDraftWithoutRedirect]);

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
    sourceArticleId,
    title,
  ]);

  const handleZoomChange = useCallback((delta) => {
    setZoom((prev) => Math.max(50, Math.min(200, prev + delta)));
  }, []);

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
          <ArticleEditorShell
            editorRef={editorRef}
            title={title}
            onTitleChange={setTitle}
            titleReadOnly
            titleHelperText="This title is copied from the original article and cannot be changed."
            content={content}
            onContentChange={(value) => {
              setContent(value);
              setInlineError("");
              setContentLimitError("");
              setEditorTextLength(stripHtmlToPlainText(value).length);
            }}
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
            disableSaveAsDraft={!hasValidContent}
            disablePreview={!hasValidContent}
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