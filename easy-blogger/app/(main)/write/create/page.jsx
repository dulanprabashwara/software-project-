// easy-blogger\app\(main)\write\create\page.jsx

"use client";

import { Editor } from "@tinymce/tinymce-react";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../../components/layout/Header";
import Sidebar from "../../../../components/layout/Sidebar";
import { Image as ImageIcon, X } from "lucide-react";
import { createDraft, updateDraft, deleteDraft } from "../../../../lib/articles/api";


export default function CreateArticlePage() {

  const [draftId, setDraftId] = useState(null);
  const savingRef = useRef(false);

  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [articleMode, setArticleMode] = useState("new");
  const [lastSaved, setLastSaved] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [fontSize, setFontSize] = useState(16);
  const [history, setHistory] = useState([{ title: "", content: "" }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  const fileInputRef = useRef(null);
  const titleRef = useRef(null);
  const editorRef = useRef(null);

  // Auto-save functionality
  useEffect(() => {
    const saveTimer = setTimeout(async () => {
      if (!title && !content && !coverImage) return;
      if (savingRef.current) return;

      try {
        savingRef.current = true;
        setIsSaving(true);

        const payload = {
          title,
          content,
          coverImage,
          writerName: "Emma Richardson",
          status: "editing",
        };

        let nextDraftId = draftId;

        if (!nextDraftId) {
          // First time -> create
          const data = await createDraft(payload);
          nextDraftId = data.article.id;
          setDraftId(nextDraftId);
          } else {
            // Update existing -> if not found, recreate
            try {
              await updateDraft(nextDraftId, payload);
            } catch (err) {
              console.warn("Update failed, recreating draft...", err);

              const data = await createDraft(payload);
              nextDraftId = data.article.id;
              setDraftId(nextDraftId);
            }
          }

        setLastSaved(new Date());

        localStorage.setItem(
          "draft_article",
          JSON.stringify({
            title,
            content,
            coverImage,
            draftId: nextDraftId,
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
  }, [title, content, coverImage, draftId]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem("draft_article");
    if (draft) {
      const parsed = JSON.parse(draft);
      setTitle(parsed.title || "");
      setContent(parsed.content || "");
      setCoverImage(parsed.coverImage || null);
      setDraftId(parsed.draftId || null);
    }
  }, []);

  //Add “mounted” state (fix refresh hydration)
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setCoverImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setTitle(history[newIndex].title);
      setContent(history[newIndex].content);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setTitle(history[newIndex].title);
      setContent(history[newIndex].content);
    }
  };

  // Note: TinyMCE provides built-in formatting through its toolbar.
  // Custom formatting functions have been removed as they were incompatible with TinyMCE.

  const handleZoomChange = (delta) => {
    setZoom((prev) => Math.max(50, Math.min(200, prev + delta)));
  };

  const handleFontSizeChange = (delta) => {
    setFontSize((prev) => Math.max(8, Math.min(72, prev + delta)));
  };

  const handleSaveAsDraft = async () => {
    if (!title || !content) {
      alert("Title and content required");
      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        title,
        content,
        coverImage,
        writerName: "Emma Richardson",
        status: "draft",
      };

      let id = draftId;

      if (!id) {
        const data = await createDraft(payload);
        id = data.article.id;
        setDraftId(id);
      } else {
        await updateDraft(id, payload);
      }
      
      // CLEAR LOCAL STORAGE
      localStorage.removeItem("draft_article");

      // RESET STATE
      setTitle("");
      setContent("");
      setCoverImage(null);
      setDraftId(null);

      alert("Saved as Draft!");
      router.push("/write/unpublished"); // adjust path if needed
    } catch (e) {
      console.error(e);
      alert("Failed to save draft");
    } finally {
      setIsSaving(false);
    } 
  };

  const handleDiscard = async () => {
    if (
      confirm(
        "Are you sure you want to discard this article? All unsaved changes will be lost.",
      )
    ) {
      try {
        if (draftId) {
          await deleteDraft(draftId);
        }
      } catch (e) {
        console.error("Failed to delete draft:", e);
      }

      localStorage.removeItem("draft_article");
      setTitle("");
      setContent("");
      setCoverImage(null);
      setHistory([{ title: "", content: "" }]);
      setHistoryIndex(0);
      setDraftId(null);

      router.push("/home");
    }
  };

  const handlePreview = () => {
    if (!title || !content) {
      alert("Please enter both title and content before previewing");
      return;
    }
    sessionStorage.setItem(
      "preview_article",
      JSON.stringify({
        title,
        content,
        coverImage,
      }),
    );
    router.push("/write/preview");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const plainText = editorRef.current
    ? editorRef.current.getContent({ format: "text" })
    : "";

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
        {/* Top Bar */}
        <div className="bg-white border-b border-[#E5E7EB] px-8 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-3 items-center">
              {/* Left: Saved status */}
              <div className="text-sm text-[#6B7280] justify-self-start">
                {isSaving
                  ? "Saving..."
                  : lastSaved
                    ? `Saved at ${lastSaved.toLocaleTimeString()}`
                    : "Saved / Saving..."}
              </div>

              {/* Center: Title + subtitle */}
              <div className="text-center">
                <h1 className="text-4xl font-serif font-bold text-[#111827]">
                  Create your Article
                </h1>
                <p className="text-[#6B7280] mt-1">
                  Create your own Article here
                </p>
              </div>

              {/* Right: Button */}
              <div className="justify-self-end flex items-center gap-3">
                <button
                  onClick={handleSaveAsDraft}
                  disabled={!title || !content}
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
                    setTitle(e.target.value);
                    const newHistory = history.slice(0, historyIndex + 1);
                    newHistory.push({ title: e.target.value, content });
                    setHistory(newHistory);
                    setHistoryIndex(newHistory.length - 1);
                  }}
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
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith("image/")) {
                      const fakeEvent = { target: { files: [file] } };
                      handleImageUpload(fakeEvent);
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
                        //fixed_toolbar_container: "#tinymce-toolbar",
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
              onClick={() => router.push("/home")}
              className="px-8 py-3 bg-[#111827] hover:bg-[#1f2937] text-white rounded-full text-sm font-medium transition-colors"
            >
              Exit Editor
            </button>
            <button
              onClick={handlePreview}
              disabled={!title || !content}
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
