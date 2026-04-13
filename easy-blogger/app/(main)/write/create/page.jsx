/* easy-blogger/app/(main)/write/create/page.jsx */

"use client";

import { Editor } from "@tinymce/tinymce-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, X } from "lucide-react";

import Header from "../../../../components/layout/Header";
import Sidebar from "../../../../components/layout/Sidebar";
import {
  createDraft,
  updateDraft,
  deleteDraft,
} from "../../../../lib/articles/api";

const LOCAL_DRAFT_STORAGE_KEY = "draft_article";
const PREVIEW_ARTICLE_STORAGE_KEY = "preview_article";
const PREVIEW_CONTEXT_STORAGE_KEY = "preview_context";
const AUTOSAVE_DELAY_MS = 2000;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

function getArticleIdFromResponse(response) {
  return response?.data?.id ?? response?.article?.id ?? null;
}

function readLocalDraft() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(LOCAL_DRAFT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Failed to read local draft:", error);
    return null;
  }
}

function writeLocalDraft(draft) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      LOCAL_DRAFT_STORAGE_KEY,
      JSON.stringify(draft),
    );
  } catch (error) {
    console.error("Failed to persist local draft:", error);
  }
}

function clearLocalDraft() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LOCAL_DRAFT_STORAGE_KEY);
}

function buildArticlePayload({ title, content, coverImage, status }) {
  return {
    title: title.trim(),
    content,
    coverImage,
    status,
  };
}

export default function CreateArticlePage() {
  const router = useRouter();

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
  const [mounted, setMounted] = useState(false);

  const fileInputRef = useRef(null);
  const editorRef = useRef(null);
  const isSavingRef = useRef(false);

  const hasContent = useMemo(() => {
    return Boolean(title.trim() || content.trim() || coverImage);
  }, [title, content, coverImage]);

  const plainText = editorRef.current
    ? editorRef.current.getContent({ format: "text" })
    : "";

  const charCount = plainText.length;

  const persistEditorSnapshot = useCallback(
    (nextDraftId = draftId) => {
      writeLocalDraft({
        draftId: nextDraftId,
        title,
        content,
        coverImage,
        lastSavedAt: new Date().toISOString(),
      });
    },
    [draftId, title, content, coverImage],
  );

  const saveArticle = useCallback(
    async (status) => {
      if (!hasContent) return null;
      if (isSavingRef.current) return draftId;

      const payload = buildArticlePayload({
        title,
        content,
        coverImage,
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

        setLastSavedAt(new Date());
        persistEditorSnapshot(currentDraftId);

        return currentDraftId;
      } finally {
        setIsSaving(false);
        isSavingRef.current = false;
      }
    },
    [coverImage, content, draftId, hasContent, persistEditorSnapshot, title],
  );

  useEffect(() => {
    const savedDraft = readLocalDraft();

    if (!savedDraft) return;

    setDraftId(savedDraft.draftId || null);
    setTitle(savedDraft.title || "");
    setContent(savedDraft.content || "");
    setCoverImage(savedDraft.coverImage || null);

    if (savedDraft.lastSavedAt) {
      setLastSavedAt(new Date(savedDraft.lastSavedAt));
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!hasContent) return;

    const timer = setTimeout(() => {
      void saveArticle("editing");
    }, AUTOSAVE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [hasContent, saveArticle]);

  const resetEditorState = useCallback(() => {
    clearLocalDraft();
    setDraftId(null);
    setTitle("");
    setContent("");
    setCoverImage(null);
    setLastSavedAt(null);
    setArticleMode("new");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleImageUpload = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      window.alert("Please upload a valid image file.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      window.alert("File size must be less than 5MB.");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setCoverImage(reader.result);
    };

    reader.onerror = () => {
      console.error("Failed to read uploaded image.");
      window.alert("Failed to process the selected image.");
    };

    reader.readAsDataURL(file);
  }, []);

  const handleRemoveImage = useCallback(() => {
    setCoverImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleSaveAsDraft = useCallback(async () => {
    if (!title.trim() || !content.trim()) {
      window.alert("Title and content are required.");
      return;
    }

    try {
      setArticleMode("draft");
      await saveArticle("draft");
      clearLocalDraft();
      router.push("/write/unpublished");
    } catch (error) {
      console.error("Failed to save article as draft:", error);
      window.alert("Failed to save draft.");
    }
  }, [content, router, saveArticle, title]);

  const handleDiscard = useCallback(async () => {
    const confirmed = window.confirm(
      "Are you sure you want to discard this article? All unsaved changes will be lost.",
    );

    if (!confirmed) return;

    try {
      if (draftId) {
        await deleteDraft(draftId);
      }
    } catch (error) {
      console.error("Failed to delete draft:", error);
    } finally {
      resetEditorState();
      router.push("/home");
    }
  }, [draftId, resetEditorState, router]);

  const handlePreview = useCallback(() => {
    if (!title.trim() || !content.trim()) {
      window.alert("Please enter both title and content before previewing.");
      return;
    }

    sessionStorage.removeItem(PREVIEW_ARTICLE_STORAGE_KEY);
    sessionStorage.removeItem(PREVIEW_CONTEXT_STORAGE_KEY);

    sessionStorage.setItem(
      PREVIEW_ARTICLE_STORAGE_KEY,
      JSON.stringify({ title, content, coverImage }),
    );

    sessionStorage.setItem(
      PREVIEW_CONTEXT_STORAGE_KEY,
      JSON.stringify({
        title,
        content,
        coverImage,
        mode: "create",
      }),
    );

    router.push("/write/preview");
  }, [content, coverImage, router, title]);

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

  const handleFontSizeChange = useCallback((delta) => {
    setFontSize((prev) => Math.max(8, Math.min(72, prev + delta)));
  }, []);

  return (
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
                {isSaving
                  ? "Saving..."
                  : lastSavedAt
                    ? `Saved at ${lastSavedAt.toLocaleTimeString()}`
                    : "Not saved yet"}
              </div>

              <div className="text-center">
                <h1 className="text-4xl font-serif font-bold text-[#111827]">
                  Create your Article
                </h1>
                <p className="text-[#6B7280] mt-1">
                  Create your own Article here
                </p>
              </div>

              <div className="justify-self-end flex items-center gap-3">
                <button
                  onClick={handleSaveAsDraft}
                  disabled={!title.trim() || !content.trim() || isSaving}
                  className="inline-flex items-center px-6 py-2.5 bg-[#111827] text-white rounded-full text-sm font-medium hover:bg-[#1f2937] disabled:opacity-50"
                >
                  Save as Draft
                </button>

                <span className="inline-flex items-center px-6 py-2.5 bg-[#1ABC9C] text-white rounded-full text-sm font-medium">
                  {articleMode === "draft" ? "Draft Article" : "New Article"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          className="px-8 py-8 overflow-y-auto"
          style={{ height: "calc(100vh - 260px)" }}
        >
          <div
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
              onClick={() => router.push("/home")}
              className="px-8 py-3 bg-[#111827] hover:bg-[#1f2937] text-white rounded-full text-sm font-medium transition-colors"
            >
              Exit Editor
            </button>

            <button
              onClick={handlePreview}
              disabled={!title.trim() || !content.trim()}
              className="px-8 py-3 bg-[#1ABC9C] hover:bg-[#17a589] text-white rounded-full text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Preview
            </button>

            <button
              onClick={handleDiscard}
              className="px-8 py-3 bg-[#111827] hover:bg-[#1f2937] text-white rounded-full text-sm font-medium transition-colors"
            >
              Discard
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}