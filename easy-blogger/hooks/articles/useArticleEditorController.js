"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useCoverImageUpload } from "./useCoverImageUpload";
import {
  getPlainTextFromHtml,
  normalizeEditorPlainText,
} from "../../lib/articles/editorHelpers";
import { isContentAtLimit } from "../../lib/articles/articleEditorValidation";

export function useArticleEditorController({ initialFontSize = 16 } = {}) {
  const editorRef = useRef(null);
  const isSavingRef = useRef(false);
  const editingSectionRef = useRef(null);

  const [isClientReady, setIsClientReady] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [inlineError, setInlineError] = useState("");
  const [contentLimitError, setContentLimitError] = useState("");
  const [editorTextLength, setEditorTextLength] = useState(0);
  const [isHydrating, setIsHydrating] = useState(true);

  const fontSize = initialFontSize;

  const coverImageUpload = useCoverImageUpload({
    onChange: setCoverImage,
  });

  useEffect(() => {
    setIsClientReady(true);
  }, []);

  const getEditorHtmlContent = useCallback(() => {
    if (editorRef.current) {
      return editorRef.current.getContent() || "";
    }

    return content || "";
  }, [content]);

  const getEditorPlainTextContent = useCallback(() => {
    if (editorRef.current) {
      return normalizeEditorPlainText(
        editorRef.current.getContent({ format: "text" }),
      );
    }

    return getPlainTextFromHtml(content);
  }, [content]);

  const syncEditorDerivedState = useCallback(() => {
    const plainText = getEditorPlainTextContent();

    setEditorTextLength(plainText.length);

    if (plainText) {
      setInlineError("");
    }
  }, [getEditorPlainTextContent]);

  const handleTitleChange = useCallback((value) => {
    setInlineError("");
    setTitle(value);
  }, []);

  const handleContentChange = useCallback((value, meta = {}) => {
    const textLength =
      typeof meta.textLength === "number"
        ? meta.textLength
        : getPlainTextFromHtml(value).length;

    setInlineError("");
    setContentLimitError("");
    setContent(value);
    setEditorTextLength(textLength);
  }, []);

  const handleZoomChange = useCallback((delta) => {
    setZoom((prev) => Math.max(50, Math.min(200, prev + delta)));
  }, []);

  const resetEditorCoreState = useCallback(() => {
    setTitle("");
    setContent("");
    setCoverImage(null);
    setIsSaving(false);
    setLastSavedAt(null);
    setZoom(100);
    setInlineError("");
    setContentLimitError("");
    setEditorTextLength(0);
    setIsHydrating(false);

    if (coverImageUpload.fileInputRef.current) {
      coverImageUpload.fileInputRef.current.value = "";
    }
  }, [coverImageUpload.fileInputRef]);

  const hasAnyContent = Boolean(
    title.trim() || editorTextLength > 0 || coverImage,
  );

  const isContentLimitReached = isContentAtLimit(editorTextLength);
  const hasRequiredContent = Boolean(title.trim() && editorTextLength > 0);
  const hasValidContent =
    hasRequiredContent && !contentLimitError && !isContentLimitReached;

  return {
    editorRef,
    isSavingRef,
    editingSectionRef,

    isClientReady,

    title,
    setTitle,
    handleTitleChange,

    content,
    setContent,
    handleContentChange,

    coverImage,
    setCoverImage,
    coverImageUpload,

    isSaving,
    setIsSaving,
    lastSavedAt,
    setLastSavedAt,

    zoom,
    setZoom,
    handleZoomChange,

    fontSize,

    inlineError,
    setInlineError,

    contentLimitError,
    setContentLimitError,

    editorTextLength,
    setEditorTextLength,

    isHydrating,
    setIsHydrating,

    getEditorHtmlContent,
    getEditorPlainTextContent,
    syncEditorDerivedState,

    hasAnyContent,
    hasValidContent,
    isContentLimitReached,

    resetEditorCoreState,
  };
}
