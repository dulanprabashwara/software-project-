"use client";

import { useEffect, useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";

import { getTinyMceConfig } from "../../lib/editor/tinymceConfig";
import CoverImageField from "./CoverImageField";
import { EditorHeader, EditorBottomActions } from "./EditorSharedLayout";

const TITLE_MAX_LENGTH = 100;
const CONTENT_MAX_LENGTH = 20000;

// Count only readable text, not HTML tags
function stripHtmlToPlainText(html) {
  return String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Reuse the same UI for required state and counters
function FieldMeta({ required, limitReached, limitMessage, items = [] }) {
  return (
    <div className="mt-2 flex items-start justify-between gap-4 text-xs">
      <div className="min-h-4 text-[#DC2626]">
        {required ? "*Required" : limitReached ? limitMessage : ""}
      </div>

      <div className="flex shrink-0 items-center gap-4 text-[#6B7280]">
        {items.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </div>
  );
}

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
  contentLimitError = "",
  onContentLimitErrorChange,
}) {
  const lastAppliedContentRef = useRef(content || ""); // Save last valid editor content for restore on limit exceed
  const hasInitializedEditorRef = useRef(false); // Avoid editor reset before TinyMCE is ready
  const isTitleRequired = !titleReadOnly && title.trim().length === 0; // Keep validation conditions clean and reusable
  const isContentRequired = editorTextLength === 0;
  const isTitleLimitReached = title.length === TITLE_MAX_LENGTH;
  const isContentLimitReached = editorTextLength === CONTENT_MAX_LENGTH;

  // Sync only external updates, not active typing
  useEffect(() => {
    const editor = editorRef.current;

    if (!editor || !hasInitializedEditorRef.current) return;

    const nextContent = content || "";

    if (nextContent !== lastAppliedContentRef.current && !editor.hasFocus()) {
      editor.setContent(nextContent);
      lastAppliedContentRef.current = nextContent;
      onEditorReady?.();
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

            <input
              type="text"
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
              readOnly={titleReadOnly}
              placeholder="Enter your blog title..."
              maxLength={TITLE_MAX_LENGTH} // Browser handles title limit directly here
              disabled={isHydrating}
              className={`w-full rounded-lg border px-4 py-2.5 text-[#111827] ${
                titleReadOnly
                  ? "cursor-not-allowed border-[#E5E7EB] bg-[#F3F4F6]"
                  : "border-[#E5E7EB] bg-white placeholder-[#9CA3AF] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]"
              }`}
            />

            <FieldMeta
              required={isTitleRequired}
              limitReached={isTitleLimitReached}
              limitMessage="Maximum title length reached."
              items={[`${title.length}/${TITLE_MAX_LENGTH} characters`]}
            />

            {titleHelperText ? (
              <p className="mt-2 text-xs text-[#6B7280]">
                {titleHelperText}
              </p>
            ) : null}
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

            <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
              <Editor
                onInit={(_, editor) => {
                  editorRef.current = editor;
                  hasInitializedEditorRef.current = true;

                  const initialContent = content || "";
                  editor.setContent(initialContent);
                  lastAppliedContentRef.current = initialContent;

                  onEditorReady?.();
                }}
                onEditorChange={(value, editor) => {
                  const plainText = stripHtmlToPlainText(value);

                  // TinyMCE needs manual content limit handling since it allows pasting large content that exceeds limits
                  if (plainText.length > CONTENT_MAX_LENGTH) {
                    onContentLimitErrorChange?.(
                      `Content cannot exceed ${CONTENT_MAX_LENGTH.toLocaleString()} characters.`,
                    );
                    editor.setContent(lastAppliedContentRef.current);
                    return;
                  }
                  onContentLimitErrorChange?.("");
                  lastAppliedContentRef.current = value;
                  onContentChange(value);
                }}
                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                init={getTinyMceConfig({ fontSize })}
              />
            </div>

            <FieldMeta
              required={isContentRequired}
              limitReached={Boolean(contentLimitError) || isContentLimitReached}
              limitMessage={contentLimitError || "Maximum content length reached."}
              items={[
                `${editorTextLength}/${CONTENT_MAX_LENGTH.toLocaleString()} characters`,
              ]}
            />
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