"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, X } from "lucide-react";
import Header from "../../../../components/layout/Header";
import Sidebar from "../../../../components/layout/Sidebar";

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


  const router = useRouter();
  const fileInputRef = useRef(null);
  const toggleSidebar = () => setSidebarOpen((p) => !p);

  // Auto-save functionality
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (coverImage || content) {
        setIsSaving(true);
        setTimeout(() => {
          setIsSaving(false);
          setLastSaved(new Date());

          localStorage.setItem(
            "draft_edit_as_new",
            JSON.stringify({
              content,
              coverImage,
              lastSaved: new Date().toISOString(),
            }),
          );
        }, 500);
      }
    }, 2000);

    return () => clearTimeout(saveTimer);
  }, [content, coverImage]);

  useEffect(() => {
    const seedRaw = sessionStorage.getItem("edit_as_new_seed");
    if (!seedRaw) {
      router.replace("/write/unpublished"); // change if your route differs
      return;
    }
    const seed = JSON.parse(seedRaw);
    setTitle(seed.title || "");
  }, [router]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem("draft_edit_as_new");
    if (draft) {
      const parsed = JSON.parse(draft);
      setContent(parsed.content || "");
      setCoverImage(parsed.coverImage || null);
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

              <div className="justify-self-end">
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

        {/* Add Cover Image NOW VISIBLE */}
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
        </div>
        </div>
      </main>
    </div>
  );
}

