"use client";

import { Editor } from "@tinymce/tinymce-react";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../../components/layout/Header";
import Sidebar from "../../../../components/layout/Sidebar";
import {
  Undo,
  Redo,
  Copy,
  Clipboard,
  Bold,
  Italic,
  Underline,
  Type,
  Link2,
  Image as ImageIcon,
  List,
  ListOrdered,
  ListChecks,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  IndentIncrease,
  IndentDecrease,
  Minus,
  Plus,
  X,
} from "lucide-react";

export default function CreateArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [textStyle, setTextStyle] = useState("Paragraph Text");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState(16);
  const [history, setHistory] = useState([{ title: "", content: "" }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const fileInputRef = useRef(null);
  //const contentRef = useRef(null);
  const titleRef = useRef(null);

  // Auto-save functionality
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (title || content) {
        setIsSaving(true);
        setTimeout(() => {
          setIsSaving(false);
          setLastSaved(new Date());
          localStorage.setItem(
            "draft_article",
            JSON.stringify({
              title,
              content,
              coverImage,
              lastSaved: new Date().toISOString(),
            }),
          );
        }, 500);
      }
    }, 2000);

    return () => clearTimeout(saveTimer);
  }, [title, content, coverImage]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem("draft_article");
    if (draft) {
      const parsed = JSON.parse(draft);
      setTitle(parsed.title || "");
      setContent(parsed.content || "");
      setCoverImage(parsed.coverImage || null);
    }
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

  const applyFormatting = (format) => {
    if (!contentRef.current) return;

    const textarea = contentRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    if (!selectedText) {
      alert("Please select some text first");
      return;
    }

    let formattedText = selectedText;

    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`;
        break;
      case "italic":
        formattedText = `*${selectedText}*`;
        break;
      case "underline":
        formattedText = `<u>${selectedText}</u>`;
        break;
      case "link":
        const url = prompt("Enter URL:");
        if (!url) return;
        formattedText = `[${selectedText}](${url})`;
        break;
      case "color":
        const color = prompt("Enter color (e.g., red, #FF0000):");
        if (!color) return;
        formattedText = `<span style="color: ${color}">${selectedText}</span>`;
        break;
    }

    const newContent =
      content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);

    // Update history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ title, content: newContent });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + formattedText.length,
        start + formattedText.length,
      );
    }, 0);
  };

  const applyListFormatting = (listType) => {
    if (!contentRef.current) return;

    const textarea = contentRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    if (!selectedText) {
      alert("Please select some text first");
      return;
    }

    const lines = selectedText.split("\n");
    let formattedLines;

    switch (listType) {
      case "bullet":
        formattedLines = lines.map((line) =>
          line.trim() ? `- ${line.trim()}` : line,
        );
        break;
      case "numbered":
        formattedLines = lines.map((line, index) =>
          line.trim() ? `${index + 1}. ${line.trim()}` : line,
        );
        break;
      case "checklist":
        formattedLines = lines.map((line) =>
          line.trim() ? `- [ ] ${line.trim()}` : line,
        );
        break;
      default:
        return;
    }

    const formattedText = formattedLines.join("\n");
    const newContent =
      content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);

    // Update history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ title, content: newContent });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const applyAlignment = (alignment) => {
    if (!contentRef.current) return;

    const textarea = contentRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    if (!selectedText) {
      alert("Please select some text first");
      return;
    }

    let formattedText;
    switch (alignment) {
      case "left":
        formattedText = `<div style="text-align: left">${selectedText}</div>`;
        break;
      case "center":
        formattedText = `<div style="text-align: center">${selectedText}</div>`;
        break;
      case "right":
        formattedText = `<div style="text-align: right">${selectedText}</div>`;
        break;
      case "justify":
        formattedText = `<div style="text-align: justify">${selectedText}</div>`;
        break;
      default:
        return;
    }

    const newContent =
      content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);

    // Update history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ title, content: newContent });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const applyIndentation = (direction) => {
    if (!contentRef.current) return;

    const textarea = contentRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    if (!selectedText) {
      alert("Please select some text first");
      return;
    }

    const lines = selectedText.split("\n");
    let formattedLines;

    if (direction === "increase") {
      formattedLines = lines.map((line) => `  ${line}`);
    } else {
      formattedLines = lines.map((line) => line.replace(/^  /, ""));
    }

    const formattedText = formattedLines.join("\n");
    const newContent =
      content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);

    // Update history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ title, content: newContent });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleCopy = async () => {
    if (contentRef.current) {
      const start = contentRef.current.selectionStart;
      const end = contentRef.current.selectionEnd;
      const selectedText = content.substring(start, end);
      if (selectedText) {
        try {
          await navigator.clipboard.writeText(selectedText);
          alert("Text copied to clipboard!");
        } catch (err) {
          console.error("Failed to copy:", err);
          alert("Failed to copy text");
        }
      } else {
        alert("Please select some text first");
      }
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (contentRef.current) {
        const start = contentRef.current.selectionStart;
        const end = contentRef.current.selectionEnd;
        const newContent =
          content.substring(0, start) + text + content.substring(end);
        setContent(newContent);

        // Update history
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({ title, content: newContent });
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    } catch (err) {
      // Clipboard permission denied - this is expected behavior
      // Users should use Ctrl+V (Windows/Linux) or Cmd+V (Mac) for pasting
      if (err.name === "NotAllowedError") {
        alert(
          "Clipboard access denied. Please use Ctrl+V (or Cmd+V on Mac) to paste.",
        );
      } else {
        console.error("Failed to paste:", err);
        alert("Failed to paste. Please use Ctrl+V instead.");
      }
    }
  };

  const handleZoomChange = (delta) => {
    setZoom((prev) => Math.max(50, Math.min(200, prev + delta)));
  };

  const handleFontSizeChange = (delta) => {
    setFontSize((prev) => Math.max(8, Math.min(72, prev + delta)));
  };

  const handleDiscard = () => {
    if (
      confirm(
        "Are you sure you want to discard this article? All unsaved changes will be lost.",
      )
    ) {
      localStorage.removeItem("draft_article");
      setTitle("");
      setContent("");
      setCoverImage(null);
      setHistory([{ title: "", content: "" }]);
      setHistoryIndex(0);
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
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-serif font-bold text-[#111827] mb-2">
                Create your Article
              </h1>
              <p className="text-[#6B7280]">Create your own Article here</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#6B7280]">
                {isSaving
                  ? "Saving..."
                  : lastSaved
                    ? `Saved at ${lastSaved.toLocaleTimeString()}`
                    : "Saved / Saving..."}
              </span>
              <button
                onClick={() => router.push("/write/publish")}
                className="px-6 py-2.5 bg-[#1ABC9C] hover:bg-[#17a589] text-white rounded-full text-sm font-medium transition-colors"
              >
                Post Status
              </button>
            </div>
          </div>
        </div>
                  
        {/* Toolbar (TinyMCE toolbar will render here) */}
<div className="bg-white border-b border-[#E5E7EB] px-8 py-4 sticky top-16 z-30">
  <div className="max-w-5xl mx-auto">
    <div
      id="tinymce-toolbar"
      className="min-h-[72px] flex items-center"
    />
  </div>
</div>


        {/* Editor Content */}
        <div
          className="px-8 py-8 overflow-y-auto"
          style={{ height: "calc(100vh - 340px)" }}
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
                  maxLength={50}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <span className="text-xs text-[#6B7280]">
                    {title.length}/50
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
  <Editor
    apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
    value={content}
    onEditorChange={(newContent) => {
      setContent(newContent);

      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({ title, content: newContent });
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }}
    init={{
      height: 260, // similar to your textarea height (h-64)
      menubar: false,
      branding: false,
      placeholder: "Write your blog content here...",
      fixed_toolbar_container: "#tinymce-toolbar",

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
      content_style: `body { font-family: ${fontFamily}; font-size: ${fontSize}px; }`,
    }}
  />
</div>

                <div className="absolute right-4 bottom-4 flex items-center gap-2">
                  <span className="text-xs text-[#6B7280]">
                    {content.length}/20,000
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
          <div
            className={`max-w-5xl mx-auto flex items-center justify-center gap-4 transition-all duration-300 ${
              sidebarOpen ? "ml-60" : "ml-0"
            }`}
          >
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
