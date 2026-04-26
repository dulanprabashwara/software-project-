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
import {getEditorValidationError,isContentAtLimit,} from "../../../../lib/articles/articleEditorValidation";
import { useEditorNavigationGuard } from "../../../../hooks/articles/useEditorNavigationGuard";
import {autosaveEditExisting,discardEditExisting,getDraftById,saveEditExistingAsDraft,saveEditExistingForPreview,startEditExisting,}from "../../../../lib/articles/api";
import { openPreviewSaveConfirm } from "../../../../lib/articles/previewConfirm";

function normalizePlainText(value) {
  return String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripHtmlToPlainText(html) {
  return normalizePlainText(String(html || "").replace(/<[^>]*>/g, " "));
}

export default function EditExistingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const articleId = searchParams.get("id");

  const [isClientReady, setIsClientReady] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState(null);
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
    [articleId, title, coverImage, getEditorHtmlContent],
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
    title,
  ]);

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
  }, [articleId]);

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
    if (!didSave) return false;

    router.push("/write/unpublished");
    return true;
  }, [router, saveDraftWithoutRedirect]);

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
            <EditorInlineError message={inlineError} />
          </div>
        </div>

        <div ref={editingSectionRef}>
          <ArticleEditorShell
            editorRef={editorRef}
            title={title}
            onTitleChange={setTitle}
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