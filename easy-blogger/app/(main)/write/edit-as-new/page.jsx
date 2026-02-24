"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, X } from "lucide-react";
import Header from "../../../../components/layout/Header";
import Sidebar from "../../../../components/layout/Sidebar";
import { Editor } from "@tinymce/tinymce-react";
import { createDraft, updateDraft, deleteDraft } from "../../../../lib/articles/api";

export default function Page() {
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [articleMode, setArticleMode] = useState("draft");
  const [zoom, setZoom] = useState(100);
  const [title, setTitle] = useState("");
  const [mounted, setMounted] = useState(false);
  const [history, setHistory] = useState([{ title: "", content: "" }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [sourceId, setSourceId] = useState(null);

  const [draftId, setDraftId] = useState(null);
  const savingRef = useRef(false);
  const initRef = useRef(false);
  const router = useRouter();
  const fileInputRef = useRef(null);
  const toggleSidebar = () => setSidebarOpen((p) => !p);
  const editorRef = useRef(null);
  const [fontSize, setFontSize] = useState(16);

  // Auto-save functionality
  useEffect(() => {
    const saveTimer = setTimeout(async () => {
      if (!draftId) return; // only autosave after the copy is created
      if (!coverImage && !content) return;
      if (savingRef.current) return;

      try {
        savingRef.current = true;
        setIsSaving(true);

        const payload = {
          title, // readOnly but stored
          content,
          coverImage,
          writerName: "Emma Richardson",
          status: "editing",
          sourceId,
        };

        await updateDraft(draftId, payload);

        const now = new Date();
        setLastSaved(now);

        localStorage.setItem(
          "draft_edit_as_new",
          JSON.stringify({
            draftId,
            sourceId,
            title,
            content,
            coverImage,
            lastSaved: now.toISOString(),
          })
        );
      } catch (err) {
        console.error("Autosave failed:", err);
      } finally {
        setIsSaving(false);
        savingRef.current = false;
      }
    }, 2000);

    return () => clearTimeout(saveTimer);
  }, [draftId, title, content, coverImage, sourceId]);

  useEffect(() => {
    // Prevent double run (React strict mode / refresh)
    if (initRef.current) return;
    initRef.current = true;

    const seedRaw = sessionStorage.getItem("edit_as_new_seed");
    if (!seedRaw) {
      router.replace("/write/unpublished");
      return;
    }

    let seed;
    try {
      seed = JSON.parse(seedRaw);
    } catch (e) {
      console.error("Invalid seed:", e);
      sessionStorage.removeItem("edit_as_new_seed");
      router.replace("/write/unpublished");
      return;
    }

    const seededSourceId = seed.sourceId ? String(seed.sourceId) : null;
    const seededTitle = seed.title || "";
    const seededContent = seed.content || "";
    const seededCover = seed.coverImage || null;
    const seededWriter = seed.writerName || "Unknown Writer";

    setTitle(seededTitle);
    setContent(seededContent);
    setCoverImage(seededCover);
    setSourceId(seededSourceId);
    setArticleMode("draft");

    // If a previous editing copy exists for the same source, reuse it (refresh safety)
    const local = localStorage.getItem("draft_edit_as_new");
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (String(parsed.sourceId || "") === String(seededSourceId || "") && parsed.draftId) {
          setDraftId(parsed.draftId);
          if (parsed.lastSaved) setLastSaved(new Date(parsed.lastSaved));
          return;
        }
      } catch (e) {
        // ignore
      }
    }

    // Create a brand new copy with status "editing" in articles.json
    (async () => {
      try {
        setIsSaving(true);

        const payload = {
          title: seededTitle,
          content: seededContent,
          coverImage: seededCover,
          writerName: seededWriter,
          status: "editing",
          sourceId: seededSourceId,
        };

        const data = await createDraft(payload);
        const newId = data?.article?.id;

        if (!newId) throw new Error("createDraft did not return article.id");

        setDraftId(newId);

        const now = new Date();
        setLastSaved(now);

        localStorage.setItem(
          "draft_edit_as_new",
          JSON.stringify({
            draftId: newId,
            sourceId: seededSourceId,
            title: seededTitle,
            content: seededContent,
            coverImage: seededCover,
            lastSaved: now.toISOString(),
          })
        );
      } catch (err) {
        console.error(err);
        alert("Failed to create editing copy");
        router.replace("/write/unpublished");
      } finally {
        setIsSaving(false);
      }
    })();
  }, [router]);

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

  const plainText = editorRef.current
  ? editorRef.current.getContent({ format: "text" })
  : "";

  const charCount = plainText.length;

  //Add handlePreview and handleDiscard functions
  const handleDiscard = async () => {
    if (
      !confirm(
        "Are you sure you want to discard this article? The editing copy will be deleted."
      )
    ) {
      return;
    }

    try {
      setIsSaving(true);

      if (draftId) {
        await deleteDraft(draftId);
      }
    } catch (e) {
      console.error("Failed to delete draft:", e);
    } finally {
      localStorage.removeItem("draft_edit_as_new");
      sessionStorage.removeItem("edit_as_new_seed");

      setContent("");
      setCoverImage(null);
      setHistory([{ title: "", content: "" }]);
      setHistoryIndex(0);
      setLastSaved(null);
      setDraftId(null);

      setIsSaving(false);
      router.push("/write/unpublished");
    }
  };

  const handlePreview = () => {
    // title comes from session seed and is readOnly, so we only validate content here
    const plainTextNow = editorRef.current
    ? editorRef.current.getContent({ format: "text" }).trim()
    : "";

    if (!plainTextNow) {
      alert("Please enter content before previewing");
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
        title,
        content,
        coverImage,
        mode: "edit-as-new",
      }),
    );

    router.push("/write/preview");
  };

  const handleSaveAsDraft = async () => {
    if (!draftId) {
      alert("Please wait, preparing your article...");
      return;
    }

    const plainTextNow = editorRef.current
      ? editorRef.current.getContent({ format: "text" }).trim()
      : "";

    if (!plainTextNow) {
      alert("Content is required");
      return;
    }

    try {
      setIsSaving(true);

      await updateDraft(draftId, {
        title,
        content,
        coverImage,
        writerName: "Emma Richardson",
        status: "draft",
        sourceId,
      });

      localStorage.removeItem("draft_edit_as_new");
      sessionStorage.removeItem("edit_as_new_seed");

      alert("Saved as Draft!");
      router.push("/write/unpublished");
    } catch (e) {
      console.error(e);
      alert("Failed to save as draft");
    } finally {
      setIsSaving(false);
    }
  };

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
                {isSaving
                  ? "Saving..."
                  : lastSaved
                    ? `Saved at ${lastSaved.toLocaleTimeString()}`
                    : "Saved / Saving..."
                }
              </div>
              
              <div className="text-center">
                <h1 className="text-4xl font-serif font-bold text-[#111827]">
                  Edit as a New Article
                </h1>
                <p className="text-[#6B7280] mt-1">
                  Here you can edit your existing article as a new article.
                </p>
              </div>

              <div className="justify-self-end flex items-center gap-3">
                <button
                  onClick={handleSaveAsDraft}
                  className="px-8 py-3 bg-[#111827] hover:bg-[#1f2937] text-white rounded-full text-sm font-medium transition-colors"
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
            <input
              type="text"
              value={title}
              readOnly
              className="w-full px-4 py-3 bg-gray-100 border border-[#E5E7EB] rounded-lg text-[#111827] cursor-not-allowed"
            />
          </div>

        {/* Add Cover image */}
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

        {!coverImage && <p className="text-xs text-[#DC2626] mt-2">*Required</p>}
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
              {plainText.trim().length === 0 && (
                <span className="text-xs text-[#DC2626]">*Required</span>
            )}

            </div>
          </div>
        </div>
        </div>
        </div>
        {/* Bottom Action Buttons */}
        <div
          className={`fixed bottom-0 right-0 bg-white border-t border-[#E5E7EB] px-8 py-6 z-30 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "left-60" : "left-0"
          }`}
        > 
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

