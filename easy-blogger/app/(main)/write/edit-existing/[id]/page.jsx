// easy-blogger/app/(main)/write/edit-existing/[id]/page.jsx
"use client";

import { Editor } from "@tinymce/tinymce-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";

import Header from "../../../../../components/layout/Header";
import Sidebar from "../../../../../components/layout/Sidebar";
import { Image as ImageIcon, X } from "lucide-react";

import {
  updateDraft,
  deleteDraft,
  // You need ONE read API:
  getDraftById,
} from "../../../../../lib/articles/api";

const LS_KEY = (id) => `edit_existing_${id}`;

export default function EditExistingPage() {
  const router = useRouter();
  const params = useParams();
  const draftId = params?.id; // same id, update only

  const savingRef = useRef(false);
  const fileInputRef = useRef(null);
  const titleRef = useRef(null);
  const editorRef = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const [zoom, setZoom] = useState(100);
  const [fontSize, setFontSize] = useState(16);

  const [history, setHistory] = useState([{ title: "", content: "" }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // IMPORTANT: keep the original snapshot so Discard can restore it
  const [original, setOriginal] = useState(null);

  // Fix hydration
  useEffect(() => setMounted(true), []);

  // Load the selected article/draft on mount
  useEffect(() => {
    if (!draftId) return;

    const load = async () => {
      try {
        setIsLoading(true);

        // 1) If there are unsaved edit-session changes in localStorage, prefer them
        const cached = localStorage.getItem(LS_KEY(draftId));
        if (cached) {
          const parsed = JSON.parse(cached);

          setTitle(parsed.title || "");
          setContent(parsed.content || "");
          setCoverImage(parsed.coverImage || null);

          // original snapshot should come from server, not from cached edits
          const data = await getDraftById(draftId);
          const serverArticle = data?.article || data;

          const snapshot = {
            title: serverArticle?.title || "",
            content: serverArticle?.content || "",
            coverImage: serverArticle?.coverImage || null,
            status: serverArticle?.status || "draft",
          };
          setOriginal(snapshot);

          setHistory([{ title: parsed.title || "", content: parsed.content || "" }]);
          setHistoryIndex(0);
          return;
        }

        // 2) Otherwise load from server
        const data = await getDraftById(draftId);
        const article = data?.article || data;

        const nextTitle = article?.title || "";
        const nextContent = article?.content || "";
        const nextCover = article?.coverImage || null;
        status: article?.status || "draft",

        setTitle(nextTitle);
        setContent(nextContent);
        setCoverImage(nextCover);

        const snapshot = {
          title: nextTitle,
          content: nextContent,
          coverImage: nextCover,
        };
        setOriginal(snapshot);

        setHistory([{ title: nextTitle, content: nextContent }]);
        setHistoryIndex(0);
      } catch (e) {
        console.error("Failed to load draft:", e);
        alert("Failed to load the article to edit.");
        router.push("/write/unpublished");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [draftId, router]);

  // Auto-save: UPDATE ONLY (no create)
  useEffect(() => {
    if (!draftId) return;
    if (isLoading) return;
    if (!title && !content && !coverImage) return;

    const saveTimer = setTimeout(async () => {
      if (savingRef.current) return;

      try {
        savingRef.current = true;
        setIsSaving(true);

        const payload = {
          title,
          content,
          coverImage,
          writerName: "Emma Richardson",
          status: "draft",
        };

        await updateDraft(draftId, payload);

        setLastSaved(new Date());

        localStorage.setItem(
          LS_KEY(draftId),
          JSON.stringify({
            title,
            content,
            coverImage,
            lastSaved: new Date().toISOString(),
          }),
        );
      } catch (err) {
        console.error("Autosave failed:", err);
      } finally {
        setIsSaving(false);
        savingRef.current = false;
      }
    }, 2000);

    return () => clearTimeout(saveTimer);
  }, [title, content, coverImage, draftId, isLoading]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setCoverImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setCoverImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePreview = () => {
    if (!title || !content) {
      alert("Please enter both title and content before previewing");
      return;
    }
    sessionStorage.removeItem("preview_article");
    sessionStorage.removeItem("preview_context");

    sessionStorage.setItem(
        "preview_article",
        JSON.stringify({ title, content, coverImage })
    );
    
    sessionStorage.setItem(
        "preview_context",
        JSON.stringify({
            mode: "edit-existing",
            id: draftId, // important
        })
    );
    router.push("/write/preview");
  };

  // Optional: Save button here can just be "Done Editing" -> go back
  const handleDone = () => {
    localStorage.removeItem(LS_KEY(draftId)); // end the edit session cache
    router.push("/write/unpublished");
  };

  const handleDiscard = async () => {
    if (
      !confirm(
        "Discard changes? This will restore the article to how it was before you started editing.",
      )
    ) {
      return;
    }

    try {
      if (!draftId) return;

      // If we have an original snapshot, restore it on server
      if (original) {
        setIsSaving(true);
        await updateDraft(draftId, {
          ...original,
          writerName: "Emma Richardson",
        });
      }

      // Clear edit-session cache
      localStorage.removeItem(LS_KEY(draftId));

      // Reset UI to original
      setTitle(original?.title || "");
      setContent(original?.content || "");
      setCoverImage(original?.coverImage || null);

      setHistory([{ title: original?.title || "", content: original?.content || "" }]);
      setHistoryIndex(0);

      setLastSaved(new Date());
      alert("Changes discarded and original restored.");
      router.push("/write/unpublished");
    } catch (e) {
      console.error("Failed to discard changes:", e);
      alert("Failed to discard changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSidebar = () => setSidebarOpen((v) => !v);

  const plainText = useMemo(() => {
    return editorRef.current
      ? editorRef.current.getContent({ format: "text" })
      : "";
  }, [content]);

  const charCount = plainText.length;

  return (
    <div className="min-h-screen bg-white">
      <Header onToggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} />

      <main
        className={`pt-16 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "ml-60" : "ml-0"
        }`}
      >
        {/* Top Bar */}
        <div className="bg-white border-b border-[#E5E7EB] px-8 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-3 items-center">
              <div className="text-sm text-[#6B7280] justify-self-start">
                {isLoading
                  ? "Loading..."
                  : isSaving
                    ? "Saving..."
                    : lastSaved
                      ? `Saved at ${lastSaved.toLocaleTimeString()}`
                      : "Saved / Saving..."}
              </div>

              <div className="text-center">
                <h1 className="text-4xl font-serif font-bold text-[#111827]">
                  Edit your Article
                </h1>
                <p className="text-[#6B7280] mt-1">
                  Here you can edit your existing article. 
                </p>
              </div>

              <div className="justify-self-end flex items-center gap-3">
                <button
                  onClick={handleDone}
                  disabled={isLoading}
                  className="inline-flex items-center px-6 py-2.5 bg-[#111827] text-white rounded-full text-sm font-medium hover:bg-[#1f2937] disabled:opacity-50"
                >
                  Save as Draft
                </button>

                <span className="inline-flex items-center px-6 py-2.5 bg-[#1ABC9C] text-white rounded-full text-sm font-medium">
                  Draft Article
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Editor Content */}
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
            {/* Blog Title */}
            <div className="bg-[#F8FAFC] rounded-lg p-6">
              <label className="block text-sm font-semibold text-[#111827] mb-3">
                Blog Title
              </label>

              <div className="relative">
                <input
                  ref={titleRef}
                  type="text"
                  value={title}
                  onChange={(e) => {
                    const next = e.target.value;
                    setTitle(next);

                    const newHistory = history.slice(0, historyIndex + 1);
                    newHistory.push({ title: next, content });
                    setHistory(newHistory);
                    setHistoryIndex(newHistory.length - 1);
                  }}
                  placeholder="Enter your blog title..."
                  className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1ABC9C] focus:border-transparent"
                  maxLength={100}
                  disabled={isLoading}
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

            {/* Add Cover Image */}
            <div className="bg-[#F8FAFC] rounded-lg p-6">
              <label className="block text-sm font-semibold text-[#111827] mb-3">
                Add Cover Image
              </label>

              {!coverImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file && file.type.startsWith("image/")) {
                      handleImageUpload({ target: { files: [file] } });
                    }
                  }}
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
                    disabled={isLoading}
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
                disabled={isLoading}
              />

              {!coverImage && (
                <p className="text-xs text-[#DC2626] mt-2">*Required</p>
              )}
            </div>

            {/* Write Content */}
            <div className="bg-[#F8FAFC] rounded-lg p-6">
              <label className="block text-sm font-semibold text-[#111827] mb-3">
                Write
              </label>

              <div className="relative">
                <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
                  {!mounted ? (
                    <div className="h-[260px] bg-white" />
                  ) : (
                    <Editor
                      onInit={(evt, editor) => (editorRef.current = editor)}
                      value={content}
                      onEditorChange={(newContent) => {
                        setContent(newContent);

                        const newHistory = history.slice(0, historyIndex + 1);
                        newHistory.push({ title, content: newContent });
                        setHistory(newHistory);
                        setHistoryIndex(newHistory.length - 1);
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
                        content_style: `body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: ${fontSize}px; }`,
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

        {/* Bottom Action Buttons */}
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
              disabled={!title || !content || isLoading}
              className="px-8 py-3 bg-[#1ABC9C] hover:bg-[#17a589] text-white rounded-full text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Preview
            </button>

            <button
              onClick={handleDiscard}
              disabled={isLoading}
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