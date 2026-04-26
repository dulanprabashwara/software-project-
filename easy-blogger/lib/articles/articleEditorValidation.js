import { CONTENT_MAX_LENGTH } from "./editorConstants";

export const ARTICLE_EDITOR_LIMITS = {
  CONTENT_MAX_LENGTH,
};

export function getContentLimitMessage() {
  return `Content cannot exceed ${CONTENT_MAX_LENGTH.toLocaleString()} characters.`;
}

export function isContentAtLimit(length) {
  return length >= CONTENT_MAX_LENGTH;
}

export function getEditorValidationError({
  title,
  plainTextContent,
  contentLimitError,
  isContentLimitReached,
}) {
  if (isContentLimitReached) {
    return getContentLimitMessage();
  }

  if (contentLimitError) {
    return contentLimitError;
  }

  if (!title.trim()) {
    return "Title is required.";
  }

  if (!plainTextContent) {
    return "Content is required.";
  }

  return "";
}
