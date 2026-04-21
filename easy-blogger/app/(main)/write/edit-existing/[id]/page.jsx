/* easy-blogger/app/(main)/write/edit-existing/[id]/page.jsx */

"use client";

import { Editor } from "@tinymce/tinymce-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Image as ImageIcon, X, AlertTriangle } from "lucide-react";

import Header from "../../../../../components/layout/Header";
import Sidebar from "../../../../../components/layout/Sidebar";
import {
  getDraftById,
  startEditExisting,
  autosaveEditExisting,
  discardEditExisting,
  saveEditExistingAsDraft,
} from "../../../../../lib/articles/api";

const PREVIEW_CONTEXT_STORAGE_KEY = "preview_context";
const AUTOSAVE_DELAY_MS = 2000;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const IMAGE_ERROR_FADE_DELAY_MS = 2400;
const IMAGE_ERROR_HIDE_DELAY_MS = 3000;

function getArticleFromResponse(response) {
  return response?.data ?? response?.article ?? response ?? null;
}

function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Yes",
  cancelText = "No",
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div
      data-skip-save-prompt="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] px-4"
    >
      <div
        data-skip-save-prompt="true"
        className="w-full max-w-md rounded-2xl overflow-hidden border border-[#E5E7EB] bg-white shadow-2xl"
      >
        <div className="flex items-start gap-4 px-6 py-5">
          <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-full bg-[#FEF3C7]">
            <AlertTriangle className="h-5 w-5 text-[#D97706]" />
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-semibold text-[#111827]">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#6B7280]">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[#E5E7EB] bg-[#F9FAFB] px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-full border border-[#D1D5DB] bg-white px-5 py-2.5 text-sm font-medium text-[#374151] transition hover:bg-[#F3F4F6] disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-full bg-[#111827] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1F2937] disabled:opacity-50"
          >
            {isLoading ? "Please wait..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EditExistingPage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params?.id;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [fontSize, setFontSize] = useState(16);
  const [mounted, setMounted] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  const [inlineError, setInlineError] = useState("");
  const [coverImageError, setCoverImageError] = useState("");
  const [isCoverImageErrorVisible, setIsCoverImageErrorVisible] = useState(false);

  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Yes",
    cancelText: "No",
    onConfirm: null,
    onCancel: null,
    isLoading: false,
  });

  const fileInputRef = useRef(null);
  const editorRef = useRef(null);
  const isSavingRef = useRef(false);
  const editingSectionRef = useRef(null);
  const isNavigationPromptActiveRef = useRef(false);
  const coverImageErrorTimersRef = useRef({
    fade: null,
    clear: null,
  });

  const hasContent = useMemo(() => {
    return Boolean(title.trim() || content.trim() || coverImage);
  }, [title, content, coverImage]);

  const plainText = editorRef.current
    ? editorRef.current.getContent({ format: "text" })
    : "";

  const charCount = plainText.length;

  const hasRequiredContent = useMemo(() => {
    const plainTextContent = editorRef.current
      ? editorRef.current.getContent({ format: "text" }).trim()
      : String(content || "").replace(/<[^>]*>/g, "").trim();

    return Boolean(title.trim() && plainTextContent);
  }, [content, title]);

  const clearCoverImageErrorTimers = useCallback(() => {
    if (coverImageErrorTimersRef.current.fade) {
      clearTimeout(coverImageErrorTimersRef.current.fade);
      coverImageErrorTimersRef.current.fade = null;
    }

    if (coverImageErrorTimersRef.current.clear) {
      clearTimeout(coverImageErrorTimersRef.current.clear);
      coverImageErrorTimersRef.current.clear = null;
    }
  }, []);

  const hideCoverImageError = useCallback(() => {
    clearCoverImageErrorTimers();
    setCoverImageError("");
    setIsCoverImageErrorVisible(false);
  }, [clearCoverImageErrorTimers]);

  const showCoverImageError = useCallback(
    (message) => {
      clearCoverImageErrorTimers();
      setCoverImageError(message);
      setIsCoverImageErrorVisible(true);

      coverImageErrorTimersRef.current.fade = setTimeout(() => {
        setIsCoverImageErrorVisible(false);
      }, IMAGE_ERROR_FADE_DELAY_MS);

      coverImageErrorTimersRef.current.clear = setTimeout(() => {
        setCoverImageError("");
      }, IMAGE_ERROR_HIDE_DELAY_MS);
    },
    [clearCoverImageErrorTimers],
  );

  useEffect(() => {
    return () => {
      clearCoverImageErrorTimers();
    };
  }, [clearCoverImageErrorTimers]);

  const closeModal = useCallback(() => {
    setModalState((prev) => ({
      ...prev,
      isOpen: false,
      isLoading: false,
      onConfirm: null,
      onCancel: null,
    }));
  }, []);

  const openModal = useCallback(
    ({
      title,
      message,
      confirmText = "Yes",
      cancelText = "No",
      onConfirm,
      onCancel,
    }) => {
      setModalState({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        isLoading: false,
        onConfirm: async () => {
          try {
            setModalState((prev) => ({ ...prev, isLoading: true }));
            await onConfirm?.();
          } finally {
            setModalState((prev) => ({ ...prev, isLoading: false }));
          }
        },
        onCancel: async () => {
          try {
            setModalState((prev) => ({ ...prev, isLoading: true }));
            await onCancel?.();
          } finally {
            setModalState((prev) => ({ ...prev, isLoading: false }));
            closeModal();
          }
        },
      });
    },
    [closeModal],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (content.trim()) {
      setInlineError("");
    }
  }, [content]);

  useEffect(() => {
    if (!articleId) return;

    const hydrateEditor = async () => {
      try {
        const rawPreviewContext = sessionStorage.getItem(
          PREVIEW_CONTEXT_STORAGE_KEY,
        );

        if (rawPreviewContext) {
          const previewContext = JSON.parse(rawPreviewContext);

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
  }, [articleId, router]);

  const saveArticle = useCallback(
    async (mode) => {
      if (!articleId) return null;
      if (!hasContent) return null;
      if (isSavingRef.current) return null;

      const payload = {
        title,
        content,
        coverImage,
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

        return article;
      } finally {
        setIsSaving(false);
        isSavingRef.current = false;
      }
    },
    [articleId, title, content, coverImage, hasContent],
  );

  useEffect(() => {
    if (isHydrating) return;
    if (!hasContent) return;

    const timer = setTimeout(() => {
      void saveArticle("editing");
    }, AUTOSAVE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [hasContent, isHydrating, saveArticle]);

  const handleImageUpload = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        showCoverImageError("Please upload a valid image file.");
        return;
      }

      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        showCoverImageError("File size must be less than 5MB.");
        return;
      }

      const reader = new FileReader();

      reader.onloadend = () => {
        hideCoverImageError();
        setCoverImage(reader.result);
      };

      reader.onerror = () => {
        console.error("Failed to read uploaded image.");
        showCoverImageError("Failed to process the selected image.");
      };

      reader.readAsDataURL(file);
    },
    [hideCoverImageError, showCoverImageError],
  );

  const handleRemoveImage = useCallback(() => {
    setCoverImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleSaveAsDraft = useCallback(async () => {
    if (!title.trim() || !content.trim()) {
      setInlineError("Title and content are required.");
      return;
    }

    try {
      setInlineError("");
      await saveArticle("draft");
      sessionStorage.removeItem(PREVIEW_CONTEXT_STORAGE_KEY);
      router.push("/write/unpublished");
    } catch (error) {
      console.error("Failed to save edited article as draft:", error);
      setInlineError("Failed to save draft.");
    }
  }, [content, router, saveArticle, title]);

  const handleDiscard = useCallback(async () => {
    openModal({
      title: "Discard changes?",
      message:
        "This will restore the article to how it was before you started editing.",
      confirmText: "Yes",
      cancelText: "No",
      onConfirm: async () => {
        try {
          await discardEditExisting(articleId);
          sessionStorage.removeItem(PREVIEW_CONTEXT_STORAGE_KEY);
          closeModal();
          router.push("/write/unpublished");
        } catch (error) {
          console.error("Failed to discard article changes:", error);
          setInlineError("Failed to discard changes.");
        }
      },
      onCancel: async () => {},
    });
  }, [articleId, closeModal, openModal, router]);

  const handlePreview = useCallback(async () => {
    if (!title.trim() || !content.trim()) {
      setInlineError("Please enter both title and content before previewing.");
      return;
    }

    try {
      setInlineError("");
      await saveArticle("editing");

      sessionStorage.setItem(
        PREVIEW_CONTEXT_STORAGE_KEY,
        JSON.stringify({
          id: articleId,
          mode: "edit-existing",
        }),
      );

      router.push("/write/preview");
    } catch (error) {
      console.error("Failed to prepare article preview:", error);
      setInlineError("Failed to open preview.");
    }
  }, [articleId, content, router, saveArticle, title]);

  const handleDropImage = useCallback(
    (event) => {
      event.preventDefault();

      const file = event.dataTransfer.files?.[0];
      if (!file) return;

      handleImageUpload({ target: { files: [file] } });
    },
    [handleImageUpload],
  );

  const handleZoomChange = useCallback((delta) => {
    setZoom((prev) => Math.max(50, Math.min(200, prev + delta)));
  }, []);

  const handleExternalActionAttempt = useCallback(async () => {
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
          if (!hasRequiredContent) {
            closeModal();
            setInlineError("Title and Content are required to save the article.");
            return;
          }

          setInlineError("");
          await handleSaveAsDraft();
          closeModal();
        } finally {
          isNavigationPromptActiveRef.current = false;
        }
      },
      onCancel: async () => {
        try {
          await discardEditExisting(articleId);
          sessionStorage.removeItem(PREVIEW_CONTEXT_STORAGE_KEY);
          router.push("/write/unpublished");
        } catch (error) {
          console.error("Failed to discard article changes:", error);
          setInlineError("Failed to discard changes.");
        } finally {
          isNavigationPromptActiveRef.current = false;
        }
      },
    });
  }, [
    articleId,
    closeModal,
    handleSaveAsDraft,
    hasRequiredContent,
    openModal,
    router,
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
    const handleDocumentClickCapture = (event) => {
      if (isHydrating || isSaving || modalState.isOpen) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      if (isTinyMceUiElement(target)) {
        return;
      }

      const clickableElement = target.closest("button, a, [role='button']");
      if (!clickableElement) return;

      if (clickableElement.closest("[data-skip-save-prompt='true']")) {
        return;
      }

      if (editingSectionRef.current?.contains(clickableElement)) {
        return;
      }

      if (isTinyMceUiElement(clickableElement)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      void handleExternalActionAttempt();
    };

    document.addEventListener("click", handleDocumentClickCapture, true);

    return () => {
      document.removeEventListener("click", handleDocumentClickCapture, true);
    };
  }, [
    handleExternalActionAttempt,
    isHydrating,
    isSaving,
    isTinyMceUiElement,
    modalState.isOpen,
  ]);

  return (
    <>
      <ConfirmModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        isLoading={modalState.isLoading}
        onConfirm={modalState.onConfirm}
        onCancel={modalState.onCancel}
      />

      <div className="min-h-screen bg-white">
        <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <Sidebar isOpen={sidebarOpen} />

        <main
          className={`pt-16 transition-all duration-300 ease-in-out ${
            sidebarOpen ? "ml-60" : "ml-0"
          }`}
        >
          <div className="bg-white border-b border-[#E5E7EB] px-8 py-6">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-3 items-center">
                <div className="text-sm text-[#6B7280] justify-self-start">
                  {isHydrating
                    ? "Loading..."
                    : isSaving
                      ? "Saving..."
                      : lastSavedAt
                        ? `Saved at ${lastSavedAt.toLocaleTimeString()}`
                        : "Not saved yet"}
                </div>

                <div className="text-center">
                  <h1 className="text-4xl font-serif font-bold text-[#111827]">
                    Edit your Article
                  </h1>
                  <p className="text-[#6B7280] mt-1">
                    Update your existing article here
                  </p>
                </div>

                <div className="justify-self-end flex items-center gap-3">
                  <button
                    data-skip-save-prompt="true"
                    onClick={handleSaveAsDraft}
                    disabled={
                      !title.trim() || !content.trim() || isSaving || isHydrating
                    }
                    className="inline-flex items-center px-6 py-2.5 bg-[#111827] text-white rounded-full text-sm font-medium hover:bg-[#1f2937] disabled:opacity-50"
                  >
                    Save as Draft
                  </button>

                  <span className="inline-flex items-center px-6 py-2.5 bg-[#1ABC9C] text-white rounded-full text-sm font-medium">
                    Editing Article
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div
            className="px-8 py-8 overflow-y-auto"
            style={{ height: "calc(100vh - 260px)" }}
          >
            <div className="max-w-5xl mx-auto" data-skip-save-prompt="true">
              {inlineError ? (
                <div className="mb-6 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-5 py-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-[#FEE2E2]">
                      <AlertTriangle className="h-4 w-4 text-[#DC2626]" />
                    </div>
                    <div>
                      <p className="mt-1 text-sm leading-6 text-[#DC2626]">
                        {inlineError}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div
              ref={editingSectionRef}
              className="max-w-5xl mx-auto space-y-6"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top center",
              }}
            >
              <div className="bg-[#F8FAFC] rounded-lg p-6">
                <label className="block text-sm font-semibold text-[#111827] mb-3">
                  Blog Title
                </label>

                <div className="relative">
                  <input
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Enter your blog title..."
                    className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1ABC9C] focus:border-transparent"
                    maxLength={100}
                    disabled={isHydrating}
                  />

                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <span className="text-xs text-[#6B7280]">
                      {title.length}/100
                    </span>
                    {title.length === 0 && (
                      <span className="text-xs text-[#DC2626]">*Required</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-[#F8FAFC] rounded-lg p-6">
                <label className="block text-sm font-semibold text-[#111827] mb-3">
                  Add Cover Image
                </label>

                {coverImageError ? (
                  <div
                    className={`mb-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 shadow-sm transition-opacity duration-500 ${
                      isCoverImageErrorVisible ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <p className="text-sm font-medium text-[#DC2626]">
                      {coverImageError}
                    </p>
                  </div>
                ) : null}

                {!coverImage ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={handleDropImage}
                    className="border-2 border-dashed border-[#E5E7EB] rounded-lg p-12 text-center cursor-pointer hover:border-[#1ABC9C] transition-colors bg-white"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-[#F8FAFC] flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-[#6B7280]" />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-[#111827] mb-1">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-[#6B7280]">
                          PNG, JPG, GIF or WEBP (Max 5 MB)
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative border-2 border-[#E5E7EB] rounded-lg overflow-hidden bg-white">
                    <img
                      src={coverImage}
                      alt="Cover"
                      className="w-full h-64 object-cover"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-[#F8FAFC] transition-colors"
                      aria-label="Remove cover image"
                    >
                      <X className="w-5 h-5 text-[#DC2626]" />
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {!coverImage && (
                  <p className="text-xs text-[#DC2626] mt-2">*Required</p>
                )}
              </div>

              <div className="bg-[#F8FAFC] rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-[#111827]">
                    Write
                  </label>

                  <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                    <button
                      type="button"
                      onClick={() => handleZoomChange(-10)}
                      className="px-2 py-1 border rounded"
                    >
                      Zoom -
                    </button>
                    <span>{zoom}%</span>
                    <button
                      type="button"
                      onClick={() => handleZoomChange(10)}
                      className="px-2 py-1 border rounded"
                    >
                      Zoom +
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
                    {!mounted ? (
                      <div className="h-[260px] bg-white" />
                    ) : (
                      <Editor
                        onInit={(evt, editor) => {
                          editorRef.current = editor;
                        }}
                        value={content}
                        onEditorChange={(newContent) => {
                          setInlineError("");
                          setContent(newContent);
                        }}
                        apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                        init={{
                          readonly: false,
                          promotion: false,
                          height: 260,
                          menubar: false,
                          branding: false,
                          placeholder: "Write your blog content here...",
                          plugins: [
                            "lists",
                            "link",
                            "image",
                            "table",
                            "code",
                            "wordcount",
                            "autolink",
                          ],
                          toolbar:
                            "undo redo | blocks | bold italic underline | " +
                            "alignleft aligncenter alignright alignjustify | " +
                            "bullist numlist | link image table | code",
                          content_style: `body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                            font-size: ${fontSize}px;
                          }`,
                        }}
                      />
                    )}
                  </div>

                  <div className="absolute right-4 bottom-4 flex items-center gap-2">
                    <span className="text-xs text-[#6B7280]">
                      {charCount}/20,000
                    </span>

                    {content.length === 0 && (
                      <span className="text-xs text-[#DC2626]">*Required</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] px-8 py-6 z-30">
            <div className="max-w-5xl mx-auto flex items-center justify-center gap-20">
              <button
                onClick={() => router.push("/write/unpublished")}
                className="px-8 py-3 bg-[#111827] hover:bg-[#1f2937] text-white rounded-full text-sm font-medium transition-colors"
              >
                Exit Editor
              </button>

              <button
                data-skip-save-prompt="true"
                onClick={handlePreview}
                disabled={!title.trim() || !content.trim() || isHydrating}
                className="px-8 py-3 bg-[#1ABC9C] hover:bg-[#17a589] text-white rounded-full text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Preview
              </button>

              <button
                data-skip-save-prompt="true"
                onClick={handleDiscard}
                disabled={isSaving || isHydrating}
                className="px-8 py-3 bg-[#111827] hover:bg-[#1f2937] text-white rounded-full text-sm font-medium transition-colors disabled:opacity-50"
              >
                Discard
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}