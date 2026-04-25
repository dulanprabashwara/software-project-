"use client";

import { useEffect, useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";

import { getTinyMceConfig } from "../../lib/editor/tinymceConfig";
import CoverImageField from "./CoverImageField";
import {
  EditorHeader,
  EditorBottomActions,
} from "./EditorSharedLayout";

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
      <EditorHeader
        title={headerTitle}
        subtitle={headerSubtitle}
        statusText={
          isHydrating
            ? "Loading..."
            : isSaving
              ? "Saving..."
              : lastSavedAt
                ? `Saved at ${lastSavedAt.toLocaleTimeString()}`
                : "Not saved yet"
        }
        rightContent={
          <>
            <button
              type="button"
              onClick={onSaveAsDraft}
              disabled={disableSaveAsDraft || isSaving || isHydrating}
              className="h-10 min-w-[100px] rounded-full bg-[#111827] px-6 text-sm font-medium text-white hover:bg-[#1f2937] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save as Draft
            </button>

            <span className="flex h-10 min-w-[100px] items-center rounded-full bg-[#1ABC9C] px-6 text-sm font-medium text-white">
              {modeBadge}
            </span>
          </>
        }
      />

      <div className="px-6 py-4">
        <div
          className="mx-auto max-w-4xl space-y-4"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
          }}
        >
          <div className="rounded-lg bg-[#F8FAFC] p-4">
            <label className="mb-3 block text-sm font-semibold text-[#111827]">
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
                  className={`w-full rounded-lg border px-4 py-2.5 text-[#111827] ${
                    titleReadOnly
                      ? "cursor-not-allowed border-[#E5E7EB] bg-[#F3F4F6]"
                      : "border-[#E5E7EB] bg-white placeholder-[#9CA3AF] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]"
                  }`}
                  maxLength={100}
                  disabled={isHydrating}
                />

                <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-2">
                  <span className="text-xs text-[#6B7280]">
                    {title.length}/100
                  </span>

                  {!titleReadOnly && title.length === 0 ? (
                    <span className="text-xs text-[#DC2626]">
                      *Required
                    </span>
                  ) : null}
                </div>
              </div>

              {titleHelperText ? (
                <p className="text-xs text-[#6B7280]">
                  {titleHelperText}
                </p>
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

          <div className="rounded-lg bg-[#F8FAFC] p-6">
            <div className="mb-3 flex items-center justify-between">
              <label className="block text-sm font-semibold text-[#111827]">
                Write
              </label>

              <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                <button
                  type="button"
                  onClick={() => onZoomChange(-10)}
                  className="rounded border px-2 py-1"
                >
                  Zoom -
                </button>

                <span>{zoom}%</span>

                <button
                  type="button"
                  onClick={() => onZoomChange(10)}
                  className="rounded border px-2 py-1"
                >
                  Zoom +
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
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

              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <span className="text-xs text-[#6B7280]">
                  {editorTextLength}/20,000
                </span>

                {editorTextLength === 0 ? (
                  <span className="text-xs text-[#DC2626]">
                    *Required
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditorBottomActions
        actions={[
          {
            label: "Exit Editor",
            onClick: onExit,
          },
          {
            label: "Preview",
            onClick: onPreview,
            disabled: disablePreview || isHydrating,
            variant: "primary",
          },
          {
            label: "Discard",
            onClick: onDiscard,
            disabled: disableDiscard,
          },
        ]}
      />
    </>
  );
}