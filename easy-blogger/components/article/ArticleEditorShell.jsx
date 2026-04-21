"use client";

import { useEffect, useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { getTinyMceConfig } from "../../lib/editor/tinymceConfig";
import CoverImageField from "./CoverImageField";

export default function ArticleEditorShell({
  editorRef,
  title,
  onTitleChange,
  titleReadOnly = false,
  titleHelperText = "",
  content,
  onContentChange,
  onEditorReady,
  coverImage,
  coverImageProps,
  zoom,
  onZoomChange,
  fontSize,
  isHydrating,
  isSaving,
  lastSavedAt,
  headerTitle,
  headerSubtitle,
  modeBadge,
  onSaveAsDraft,
  onPreview,
  onDiscard,
  onExit,
  disableSaveAsDraft,
  disablePreview,
  disableDiscard,
  editorTextLength = 0,
}) {
  const lastAppliedContentRef = useRef(content || "");
  const hasInitializedEditorRef = useRef(false);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !hasInitializedEditorRef.current) {
      return;
    }

    const nextContent = content || "";

    // Only update editor content when the incoming content is truly external,
    // such as hydration/reset/preview return, not during normal typing.
    if (
      nextContent !== lastAppliedContentRef.current &&
      !editor.hasFocus()
    ) {
      editor.setContent(nextContent);
      lastAppliedContentRef.current = nextContent;

      if (typeof onEditorReady === "function") {
        onEditorReady();
      }
    }
  }, [content, editorRef, onEditorReady]);

  return (
    <>
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
                {headerTitle}
              </h1>
              <p className="text-[#6B7280] mt-1">{headerSubtitle}</p>
            </div>

            <div className="justify-self-end flex items-center gap-3">
              <button
                type="button"
                onClick={onSaveAsDraft}
                disabled={disableSaveAsDraft || isSaving || isHydrating}
                className="inline-flex items-center px-6 py-2.5 bg-[#111827] text-white rounded-full text-sm font-medium hover:bg-[#1f2937] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save as Draft
              </button>

              <span className="inline-flex items-center px-6 py-2.5 bg-[#1ABC9C] text-white rounded-full text-sm font-medium">
                {modeBadge}
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

            <div className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  value={title}
                  onChange={(event) => onTitleChange(event.target.value)}
                  readOnly={titleReadOnly}
                  placeholder="Enter your blog title..."
                  className={`w-full px-4 py-3 rounded-lg text-[#111827] border ${
                    titleReadOnly
                      ? "bg-[#F3F4F6] border-[#E5E7EB] cursor-not-allowed"
                      : "bg-white border-[#E5E7EB] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1ABC9C] focus:border-transparent"
                  }`}
                  maxLength={100}
                  disabled={isHydrating}
                />

                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <span className="text-xs text-[#6B7280]">
                    {title.length}/100
                  </span>
                  {!titleReadOnly && title.length === 0 ? (
                    <span className="text-xs text-[#DC2626]">*Required</span>
                  ) : null}
                </div>
              </div>

              {titleHelperText ? (
                <p className="text-xs text-[#6B7280]">{titleHelperText}</p>
              ) : null}
            </div>
          </div>

          <CoverImageField
            coverImage={coverImage}
            coverImageError={coverImageProps.coverImageError}
            isCoverImageErrorVisible={coverImageProps.isCoverImageErrorVisible}
            fileInputRef={coverImageProps.fileInputRef}
            onImageUpload={coverImageProps.handleImageUpload}
            onRemoveImage={coverImageProps.handleRemoveImage}
            onDropImage={coverImageProps.handleDropImage}
          />

          <div className="bg-[#F8FAFC] rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-[#111827]">
                Write
              </label>

              <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                <button
                  type="button"
                  onClick={() => onZoomChange(-10)}
                  className="px-2 py-1 border rounded"
                >
                  Zoom -
                </button>
                <span>{zoom}%</span>
                <button
                  type="button"
                  onClick={() => onZoomChange(10)}
                  className="px-2 py-1 border rounded"
                >
                  Zoom +
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
                <Editor
                  onInit={(_, editor) => {
                    editorRef.current = editor;
                    hasInitializedEditorRef.current = true;

                    const initialContent = content || "";
                    editor.setContent(initialContent);
                    lastAppliedContentRef.current = initialContent;

                    if (typeof onEditorReady === "function") {
                      onEditorReady();
                    }
                  }}
                  onEditorChange={(value) => {
                    lastAppliedContentRef.current = value;
                    onContentChange(value);
                  }}
                  apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                  init={getTinyMceConfig({ fontSize })}
                />
              </div>

              <div className="absolute right-4 bottom-4 flex items-center gap-2">
                <span className="text-xs text-[#6B7280]">
                  {editorTextLength}/20,000
                </span>

                {editorTextLength === 0 ? (
                  <span className="text-xs text-[#DC2626]">*Required</span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] px-8 py-6 z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-20">
          <button
            type="button"
            onClick={onExit}
            className="px-8 py-3 bg-[#111827] hover:bg-[#1f2937] text-white rounded-full text-sm font-medium transition-colors"
          >
            Exit Editor
          </button>

          <button
            type="button"
            onClick={onPreview}
            disabled={disablePreview || isHydrating}
            className="px-8 py-3 bg-[#1ABC9C] hover:bg-[#17a589] text-white rounded-full text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Preview
          </button>

          <button
            type="button"
            onClick={onDiscard}
            disabled={disableDiscard}
            className="px-8 py-3 bg-[#111827] hover:bg-[#1f2937] text-white rounded-full text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Discard
          </button>
        </div>
      </div>
    </>
  );
}