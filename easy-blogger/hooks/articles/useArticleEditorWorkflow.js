/* easy-blogger/hooks/articles/useArticleEditorWorkflow.js */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useArticleEditorController } from "./useArticleEditorController";
import { useAutosave } from "./useAutoSave";
import { useConfirmDialog } from "./useConfirmDialog";
import { useEditorNavigationGuard } from "./useEditorNavigationGuard";

import {
  getArticleFromResponse,
  getArticleIdFromResponse,
  getPlainTextFromHtml,
  buildArticlePayload,
} from "../../lib/articles/editorHelpers";
import {
  clearPreviewContext,
  readPreviewContext,
  writePreviewContext,
} from "../../lib/articles/previewContext";
import { getEditorValidationError } from "../../lib/articles/articleEditorValidation";
import { openPreviewSaveConfirm } from "../../lib/articles/previewConfirm";
import { getWorkflowConfig } from "../../lib/articles/workflowConfig";
import {
  createDraft,
  updateDraft,
  getDraftById,
  getCurrentEditingDraft,
} from "../../lib/articles/api";

/*
 useArticleEditorWorkflow
 
 This hook manages the lifecycle of an article editing session. It abstracts 
 away the differences between creating a new post and editing an existing one, 
 allowing the UI to remain "dumb" while the hook handles the complex state transitions.
 */
export function useArticleEditorWorkflow(mode) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const config = getWorkflowConfig(mode);

  const articleIdFromParams = searchParams.get("id");
  const sourceIdFromParams = searchParams.get("id"); // Used for edit-as-new source

  const controller = useArticleEditorController();
  const {
    title,
    setTitle,
    content,
    setContent,
    coverImage,
    setCoverImage,
    setIsSaving,
    setLastSavedAt,
    setInlineError,
    setEditorTextLength,
    setIsHydrating,
    getEditorHtmlContent,
    getEditorPlainTextContent,
    hasAnyContent,
    isContentLimitReached,
    contentLimitError,
    isSavingRef,
    isClientReady,
    isHydrating,
    isSaving,
    editingSectionRef,
    resetEditorCoreState,
  } = controller;

  const [draftId, setDraftId] = useState(null);
  const [articleMode, setArticleMode] = useState("new");
  const { modalState, openModal, closeModal } = useConfirmDialog();

  const hasHydratedRef = useRef(false);
  const lastSavedSnapshotRef = useRef("");
  const hasDiscardedCopyRef = useRef(false); // For edit-as-new

  const getSnapshot = useCallback(
    (overrides = {}) => {
      const nextTitle = typeof overrides.title === "string" ? overrides.title : title;
      const nextContent = typeof overrides.content === "string" ? overrides.content : getEditorHtmlContent();
      const nextCoverImage = overrides.coverImage !== undefined ? overrides.coverImage : coverImage;

      return JSON.stringify({
        title: nextTitle.trim(),
        content: nextContent,
        coverImage: nextCoverImage,
      });
    },
    [coverImage, getEditorHtmlContent, title]
  );

  // Hydration logic (Initial Load)
  useEffect(() => {
    if (!mode || !isClientReady || hasHydratedRef.current)
      return;

    // For non-create modes, we must wait for the article ID from searchParams to be available.
    // Next.js may take a brief moment to populate searchParams on initial mount.
    if (mode !== "create" && !articleIdFromParams)
      return;

    hasHydratedRef.current = true;

    const hydrateEditor = async () => {
      try {
        const previewContext = readPreviewContext();

        // 1. Handle returning from Preview
        if (previewContext?.mode === mode && previewContext?.id) {
          /* 
           We must verify the ID matches the URL. If a user publishes article A 
          and then immediately edits article B, the 'edit-existing' mode in sessionStorage 
           might still point to article A. This check prevents loading the wrong data.
           */
          const isCorrectArticle = mode !== "edit-existing" || previewContext.id === articleIdFromParams;
          // Additional check for edit-as-new sourceId
          const isCorrectSource = mode !== "edit-as-new" || previewContext.sourceId === sourceIdFromParams;

          if (isCorrectArticle && isCorrectSource) {
            const response = await getDraftById(previewContext.id);
            const article = getArticleFromResponse(response);
            const isWorkInProgress = article?.status === "DRAFT" || article?.status === "EDITING";

            if (article && (mode !== "create" || isWorkInProgress)) {
              setDraftId(article.id);
              setTitle(article.title || "");
              setContent(article.content || "");
              setCoverImage(article.coverImage || null);
              setLastSavedAt(article.updatedAt ? new Date(article.updatedAt) : null);
              setArticleMode(article.status === "DRAFT" ? "draft" : "new");
              lastSavedSnapshotRef.current = getSnapshot({
                title: article.title,
                content: article.content,
                coverImage: article.coverImage,
              });
              setIsHydrating(false);
              return;
            }
          }
        }

        // 2. Handle Fresh Load based on Mode
        if (mode === "create") {
          const response = await getCurrentEditingDraft();
          const article = getArticleFromResponse(response);
          const isWorkInProgress = article?.status === "DRAFT" || article?.status === "EDITING";

          if (article && isWorkInProgress) {
            setDraftId(article.id);
            setTitle(article.title || "");
            setContent(article.content || "");
            setCoverImage(article.coverImage || null);
            setLastSavedAt(article.updatedAt ? new Date(article.updatedAt) : null);
            setArticleMode(article.status === "DRAFT" ? "draft" : "new");
            lastSavedSnapshotRef.current = getSnapshot({
              title: article.title,
              content: article.content,
              coverImage: article.coverImage,
            });
          } else {
            lastSavedSnapshotRef.current = getSnapshot({ title: "", content: "", coverImage: null });
          }
        } else {
          // Edit-existing or Edit-as-new
          if (!articleIdFromParams) {
            router.push("/write/unpublished");
            return;
          }
          const response = await config.startFn(articleIdFromParams);
          const article = getArticleFromResponse(response);
          if (!article)
            throw new Error("Article not found.");

          setDraftId(article.id);
          setTitle(article.title || "");
          setContent(article.content || "");
          setCoverImage(article.coverImage || null);
          setLastSavedAt(article.updatedAt ? new Date(article.updatedAt) : null);
          setArticleMode(mode === "edit-existing" ? "editing" : "new");
          lastSavedSnapshotRef.current = getSnapshot({
            title: article.title,
            content: article.content,
            coverImage: article.coverImage,
          });
        }
      } catch (error) {
        console.error(`Failed to hydrate ${mode} editor:`, error);
        setInlineError("Failed to load the article.");
        if (mode !== "create")
          router.push("/write/unpublished");
      } finally {
        setIsHydrating(false);
      }
    };

    void hydrateEditor();
  }, [isClientReady, mode, articleIdFromParams, sourceIdFromParams, config, router, setTitle, setContent, setCoverImage, setLastSavedAt, setInlineError, setIsHydrating, getSnapshot]);

  // Unified Save Logic
  const saveArticle = useCallback(
    async (status, overrides = {}, options = {}) => {
      if (isSavingRef.current || hasDiscardedCopyRef.current)
        return draftId;

      const nextTitle = typeof overrides.title === "string" ? overrides.title : title;
      const nextContent = typeof overrides.content === "string" ? overrides.content : getEditorHtmlContent();
      const nextCoverImage = overrides.coverImage !== undefined ? overrides.coverImage : coverImage;
      const nextPlainText = getPlainTextFromHtml(nextContent);

      const hasContentToSave = Boolean(nextTitle.trim() || nextPlainText || nextCoverImage);
      if (!hasContentToSave)
        return draftId;

      const currentSnapshot = getSnapshot({ title: nextTitle, content: nextContent, coverImage: nextCoverImage });
      if (status === "editing" && currentSnapshot === lastSavedSnapshotRef.current)
        return draftId;

      try {
        isSavingRef.current = true;
        setIsSaving(true);

        let currentDraftId = draftId;
        const payload = mode === "create"
          ? buildArticlePayload({ title: nextTitle, content: nextContent, coverImage: nextCoverImage, status })
          : { title: nextTitle, content: nextContent, coverImage: nextCoverImage };

        if (mode === "create") {
          if (!currentDraftId) {
            const response = await createDraft(payload);
            currentDraftId = getArticleIdFromResponse(response);
            setDraftId(currentDraftId);
          } else {
            await updateDraft(currentDraftId, payload);
          }
        } else {
          // edit-existing or edit-as-new
          const saveFn = options.isPreview && config.previewSaveFn
            ? config.previewSaveFn
            : (status === "draft" ? config.saveDraftFn : config.autosaveFn);
          const response = await saveFn(currentDraftId || articleIdFromParams, payload);
          const article = getArticleFromResponse(response);
          currentDraftId = article?.id || currentDraftId;
          setDraftId(currentDraftId);
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
    [draftId, title, coverImage, getEditorHtmlContent, getSnapshot, isSavingRef, mode, config, articleIdFromParams, setIsSaving, setLastSavedAt, setContent, setEditorTextLength]
  );

  // Autosave
  useAutosave({
    enabled: isClientReady && !isHydrating && hasAnyContent && !hasDiscardedCopyRef.current,
    onSave: () => saveArticle("editing", { content: getEditorHtmlContent() }),
    watchValues: [title, content, coverImage],
  });

  // Save as Draft Action
  const saveDraftWithoutRedirect = useCallback(async () => {
    const plainTextContent = getEditorPlainTextContent();
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
      if (mode === "create") setArticleMode("draft");
      await saveArticle("draft", { content: getEditorHtmlContent() });
      clearPreviewContext();
      return true;
    } catch (error) {
      console.error("Failed to save draft:", error);
      setInlineError("Failed to save draft.");
      return false;
    }
  }, [title, contentLimitError, isContentLimitReached, getEditorPlainTextContent, getEditorHtmlContent, saveArticle, mode, setInlineError]);

  const handleSaveAsDraft = useCallback(async () => {
    const didSave = await saveDraftWithoutRedirect();
    if (didSave)
      router.push(config.exitPath);
  }, [saveDraftWithoutRedirect, router, config.exitPath]);

  // Discard Action
  const discardWithoutRedirect = useCallback(async () => {
    try {
      if (mode === "edit-as-new")
        hasDiscardedCopyRef.current = true;

      const targetId = draftId || articleIdFromParams;
      if (targetId && config.discardFn) {
        await config.discardFn(targetId);
      }

      if (mode === "create") {
        resetEditorCoreState();
        setDraftId(null);
        setArticleMode("new");
        lastSavedSnapshotRef.current = JSON.stringify({ title: "", content: "", coverImage: null });
      } else {
        resetEditorCoreState();
        setDraftId(null);
      }

      clearPreviewContext();
      return true;
    } catch (error) {
      console.error("Failed to discard changes:", error);
      setInlineError("Failed to discard the article.");
      return false;
    }
  }, [draftId, articleIdFromParams, config.discardFn, mode, resetEditorCoreState, setInlineError]);

  const handleDiscard = useCallback(() => {
    openModal({
      title: config.discardTitle,
      message: config.discardMessage,
      confirmText: "Yes",
      cancelText: "No",
      onConfirm: async () => {
        const didDiscard = await discardWithoutRedirect();
        if (didDiscard) {
          closeModal();
          router.push(config.exitPath);
        }
      },
    });
  }, [openModal, config, discardWithoutRedirect, closeModal, router]);

  // Preview Action
  const handlePreview = useCallback(async () => {
    const plainTextContent = getEditorPlainTextContent();
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
          if (mode === "create") setArticleMode("draft");

          const currentDraftId = await saveArticle("draft", { content: getEditorHtmlContent() }, { isPreview: true });

          writePreviewContext({
            mode,
            id: currentDraftId,
            sourceId: mode === "edit-as-new" ? sourceIdFromParams : undefined,
          });

          const previewUrl = `/write/preview?id=${currentDraftId}&mode=${mode}${mode === "edit-as-new" ? `&sourceId=${sourceIdFromParams}` : ""}`;
          router.push(previewUrl);
        } catch (error) {
          console.error("Failed to prepare preview:", error);
          setInlineError("Failed to open preview.");
        }
      },
    });
  }, [getEditorPlainTextContent, title, contentLimitError, isContentLimitReached, openModal, closeModal, saveArticle, mode, getEditorHtmlContent, sourceIdFromParams, router, setInlineError]);

  // Navigation Guard
  const { handleExternalActionAttempt, pendingExternalActionRef } = useEditorNavigationGuard({
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

  const handleExit = useCallback(() => {
    pendingExternalActionRef.current = () => router.push(config.exitPath);
    handleExternalActionAttempt();
  }, [router, config.exitPath, handleExternalActionAttempt, pendingExternalActionRef]);

  return {
    ...controller,
    articleMode,
    draftId,
    modalState,
    handleSaveAsDraft,
    handleDiscard,
    handlePreview,
    handleExit,
    config,
  };
}
