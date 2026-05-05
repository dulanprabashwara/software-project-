import { CONTENT_MAX_LENGTH, TITLE_MAX_LENGTH } from "./editorConstants";

export const ARTICLE_EDITOR_LIMITS = {
  CONTENT_MAX_LENGTH,
  TITLE_MAX_LENGTH,
};

export function getTitleLimitMessage() {
  return `Title cannot exceed ${TITLE_MAX_LENGTH.toLocaleString()} characters.`;
}

export function getContentLimitMessage() {
  return `Content cannot exceed ${CONTENT_MAX_LENGTH.toLocaleString()} characters.`;
}

export function isTitleAtLimit(length) {
  return length > TITLE_MAX_LENGTH;
}

export function isContentAtLimit(length) {
  return length > CONTENT_MAX_LENGTH;
}

export function getEditorValidationError({
  title,
  plainTextContent,
  contentLimitError,
  isContentLimitReached,
  isTitleLimitReached,
}) {
  if (isTitleLimitReached) {
    return getTitleLimitMessage();
  }

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
