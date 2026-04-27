export function getArticleIdFromResponse(response) {
  return response?.data?.id ?? response?.article?.id ?? null;
}

export function getArticleFromResponse(response) {
  return response?.data ?? response?.article ?? response ?? null;
}

export function buildArticlePayload({ title, content, coverImage, status }) {
  return {
    title: title.trim(),
    content,
    coverImage,
    ...(status ? { status } : {}),
  };
}

export function normalizeEditorPlainText(value = "") {
  return String(value)
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getPlainTextFromHtml(html = "") {
  return normalizeEditorPlainText(String(html).replace(/<[^>]*>/g, " "));
}
