/* easy-blogger/app/(main)/write/edit-existing/[id]/page.jsx */

"use client";

import { Editor } from "@tinymce/tinymce-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Image as ImageIcon, X } from "lucide-react";

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

function getArticleFromResponse(response) {
  return response?.data ?? response?.article ?? response ?? null;
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

  useEffect(() => {
    setMounted(true);
  }, []);

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
              setLastSavedAt(article.updatedAt ? new Date(article.updatedAt) : null);
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
        window.alert("Failed to load the article.");
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
        setLastSavedAt(article?.updatedAt ? new Date(article.updatedAt) : new Date());

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
      await saveArticle("draft");
      sessionStorage.removeItem(PREVIEW_CONTEXT_STORAGE_KEY);
      router.push("/write/unpublished");
    } catch (error) {
      console.error("Failed to save edited article as draft:", error);
      window.alert("Failed to save draft.");
    }
  }, [content, router, saveArticle, title]);

  const handleDiscard = useCallback(async () => {
    const confirmed = window.confirm(
      "Discard changes? This will restore the article to how it was before you started editing.",
    );

    if (!confirmed) return;

    try {
      await discardEditExisting(articleId);
      sessionStorage.removeItem(PREVIEW_CONTEXT_STORAGE_KEY);
      router.push("/write/unpublished");
    } catch (error) {
      console.error("Failed to discard article changes:", error);
      window.alert("Failed to discard changes.");
    }
  }, [articleId, router]);

  const handlePreview = useCallback(async () => {
    if (!title.trim() || !content.trim()) {
      window.alert("Please enter both title and content before previewing.");
      return;
    }

    try {
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
      window.alert("Failed to open preview.");
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
                  onClick={handleSaveAsDraft}
                  disabled={!title.trim() || !content.trim() || isSaving || isHydrating}
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
              onClick={() => router.push("/write/unpublished")}
              className="px-8 py-3 bg-[#111827] hover:bg-[#1f2937] text-white rounded-full text-sm font-medium transition-colors"
            >
              Exit Editor
            </button>

            <button
              onClick={handlePreview}
              disabled={!title.trim() || !content.trim() || isHydrating}
              className="px-8 py-3 bg-[#1ABC9C] hover:bg-[#17a589] text-white rounded-full text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Preview
            </button>

            <button
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
  );
}