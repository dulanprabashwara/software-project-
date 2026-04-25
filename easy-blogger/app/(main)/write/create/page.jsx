//easy-blogger\app\(main)\write\create\page.jsx

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "../../../../components/layout/Header";
import Sidebar from "../../../../components/layout/Sidebar";
import ArticleEditorShell from "../../../../components/article/ArticleEditorShell";
import ConfirmDialog from "../../../../components/article/ConfirmDialog";
import EditorInlineError from "../../../../components/article/EditorInlineError";

import { useAutosave } from "../../../../hooks/articles/useAutoSave";
import { useConfirmDialog } from "../../../../hooks/articles/useConfirmDialog";
import { useCoverImageUpload } from "../../../../hooks/articles/useCoverImageUpload";
import {buildArticlePayload,getArticleFromResponse,getArticleIdFromResponse,} from "../../../../lib/articles/editorHelpers";
import {clearPreviewContext,readPreviewContext,writePreviewContext,} from "../../../../lib/articles/previewContext";
import {createDraft,deleteDraft,getCurrentEditingDraft,getDraftById,updateDraft,} from "../../../../lib/articles/api";
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

export default function CreateArticlePage() {
  const router = useRouter();
  const editorRef = useRef(null);

  const [isClientReady, setIsClientReady] = useState(false);
  const [draftId, setDraftId] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [articleMode, setArticleMode] = useState("new");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [fontSize, setFontSize] = useState(16);
  const [inlineError, setInlineError] = useState("");
  const [editorTextLength, setEditorTextLength] = useState(0);
  const [isHydrating, setIsHydrating] = useState(true);

  const { modalState, openModal, closeModal } = useConfirmDialog();

  const isSavingRef = useRef(false);
  const hasHydratedRef = useRef(false);
  const lastSavedSnapshotRef = useRef("");
  const editingSectionRef = useRef(null);
  const isNavigationPromptActiveRef = useRef(false);
  const pendingExternalActionRef = useRef(null);
  const bypassExternalActionGuardRef = useRef(false);

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
      return normalizePlainText(editorRef.current.getContent({ format: "text" }));
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
    [title, getEditorHtmlContent, coverImage],
  );

  const hasAnyContent = Boolean(
    title.trim() || editorTextLength > 0 || coverImage,
  );

  const hasRequiredContent = Boolean(title.trim() && editorTextLength > 0);

  useEffect(() => {
    syncEditorDerivedState();
  }, [content, syncEditorDerivedState]);

  useEffect(() => {
    if (!isClientReady || hasHydratedRef.current) return;
    hasHydratedRef.current = true;

    const hydrateEditor = async () => {
      try {
        const previewContext = readPreviewContext();

        if (previewContext?.mode === "create" && previewContext?.id) {
          const response = await getDraftById(previewContext.id);
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
  }, [isClientReady]);

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

      const nextPlainText = stripHtmlToPlainText(nextContent);
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
    [coverImage, draftId, getEditorHtmlContent, getSnapshot, title],
  );

  useAutosave({
    enabled: isClientReady && !isHydrating && hasAnyContent,
    onSave: () =>
      saveArticle("editing", {
        content: getEditorHtmlContent(),
      }),
    watchValues: [title, content, coverImage],
  });

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
  }, [coverImageUpload.fileInputRef]);

  const saveDraftWithoutRedirect = useCallback(async () => {
    const plainTextContent = getEditorPlainTextContent();
    const htmlContent = getEditorHtmlContent();

    if (!title.trim()) {
      setInlineError("Title is required to save the article.");
      return false;
    }

    if (!plainTextContent) {
      setInlineError("Content is required to save the article.");
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
  }, [getEditorHtmlContent, getEditorPlainTextContent, saveArticle, title]);

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
  }, [draftId, resetEditorState]);

  const runPendingExternalAction = useCallback(() => {
    const action = pendingExternalActionRef.current;
    pendingExternalActionRef.current = null;

    if (!action) return;

    bypassExternalActionGuardRef.current = true;

    Promise.resolve().then(() => {
      action();

      setTimeout(() => {
        bypassExternalActionGuardRef.current = false;
      }, 0);
    });
  }, []);

  const handleSaveAsDraft = useCallback(async () => {
    const didSave = await saveDraftWithoutRedirect();
    if (!didSave) return;

    router.push("/write/unpublished");
  }, [router, saveDraftWithoutRedirect]);

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

  const handlePreview = useCallback(async () => {
    const plainTextContent = getEditorPlainTextContent();
    const htmlContent = getEditorHtmlContent();

    if (!title.trim()) {
      setInlineError("Title is required to preview the article.");
      return;
    }

    if (!plainTextContent) {
      setInlineError("Content is required to preview the article.");
      return;
    }

    openPreviewSaveConfirm({
      openModal,
      closeModal,
      onSaveAndPreview: async () => {
        try {
          setInlineError("");
          setArticleMode("draft");
          const currentDraftId = await saveArticle("draft", { content: htmlContent });

          router.push(`/write/preview?id=${currentDraftId}&mode=create`);
      
        } catch (error) {
          console.error("Failed to save article before preview:", error);
          setInlineError("Failed to open preview.");
        }
      },
    });
  }, [
    getEditorHtmlContent,
    getEditorPlainTextContent,
    router,
    saveArticle,
    title,
  ]);

  const handleZoomChange = useCallback((delta) => {
    setZoom((prev) => Math.max(50, Math.min(200, prev + delta)));
  }, []);

  const handleExternalActionAttempt = useCallback(() => {
    if (isNavigationPromptActiveRef.current) {
      return;
    }

    isNavigationPromptActiveRef.current = true;

    openModal({
      title: "Save article?",
      message: "Do you want to save the article before leaving this page?",
      confirmText: "Yes",
      cancelText: "No",
      onConfirm: async () => {
        try {
          const didSave = await saveDraftWithoutRedirect();

          if (!didSave) {
            pendingExternalActionRef.current = null;
            closeModal();
            return;
          }

          closeModal();
          runPendingExternalAction();
        } finally {
          isNavigationPromptActiveRef.current = false;
        }
      },
      onCancel: async () => {
        try {
          const didDiscard = await discardWithoutRedirect();

          if (!didDiscard) {
            pendingExternalActionRef.current = null;
            return;
          }

          runPendingExternalAction();
        } finally {
          isNavigationPromptActiveRef.current = false;
        }
      },
      onClose: async () => {
        pendingExternalActionRef.current = null;
        isNavigationPromptActiveRef.current = false;
      },
    });
  }, [
    closeModal,
    discardWithoutRedirect,
    openModal,
    runPendingExternalAction,
    saveDraftWithoutRedirect,
  ]);

  const isTinyMceUiElement = useCallback((element) => {
    if (!(element instanceof Element)) return false;

    return Boolean(
      element.closest(
        [
          ".tox",
          ".tox-tinymce-aux",
          ".tox-dialog",
          ".tox-dialog-wrap",
          ".tox-menu",
          ".tox-collection",
          ".tox-toolbar",
          ".tox-toolbar__group",
          ".mce-content-body",
        ].join(","),
      ),
    );
  }, []);

  useEffect(() => {
    if (!isClientReady) {
      return;
    }

    const handleDocumentClickCapture = (event) => {
      if (
        bypassExternalActionGuardRef.current ||
        isHydrating ||
        isSaving ||
        modalState.isOpen
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;
      if (isTinyMceUiElement(target)) return;

      const clickableElement = target.closest("button, a, [role='button']");
      if (!clickableElement) return;

      if (clickableElement.closest("[data-skip-save-prompt='true']")) return;
      if (editingSectionRef.current?.contains(clickableElement)) return;
      if (isTinyMceUiElement(clickableElement)) return;

      pendingExternalActionRef.current = () => {
        clickableElement.click();
      };

      event.preventDefault();
      event.stopPropagation();

      handleExternalActionAttempt();
    };

    document.addEventListener("click", handleDocumentClickCapture, true);

    return () => {
      document.removeEventListener("click", handleDocumentClickCapture, true);
    };
  }, [
    handleExternalActionAttempt,
    isClientReady,
    isHydrating,
    isSaving,
    isTinyMceUiElement,
    modalState.isOpen,
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
        <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <Sidebar isOpen={sidebarOpen} />

        <main
          className={`pt-16 transition-all duration-300 ease-in-out ${
            sidebarOpen ? "ml-60" : "ml-0"
          }`}
        >
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
              onTitleChange={(value) => {
                setInlineError("");
                setTitle(value);
              }}
              content={content}
              onContentChange={(value) => {
                setInlineError("");
                setContent(value);
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
              disableSaveAsDraft={!hasRequiredContent}
              disablePreview={!hasRequiredContent}
              disableDiscard={isSaving || isHydrating}
              editorTextLength={editorTextLength}
            />
          </div>
        </main>
      </div>
    </>
  );
}