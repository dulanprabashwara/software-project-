import { PREVIEW_CONTEXT_STORAGE_KEY } from "./editorConstants";

export function readPreviewContext() {
  if (typeof window === "undefined")
    return null;

  const raw = sessionStorage.getItem(PREVIEW_CONTEXT_STORAGE_KEY);
  if (!raw)
    return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function writePreviewContext(value) {
  if (typeof window === "undefined")
    return;
  sessionStorage.setItem(PREVIEW_CONTEXT_STORAGE_KEY, JSON.stringify(value));
}

export function clearPreviewContext() {
  if (typeof window === "undefined")
    return;
  sessionStorage.removeItem(PREVIEW_CONTEXT_STORAGE_KEY);
}