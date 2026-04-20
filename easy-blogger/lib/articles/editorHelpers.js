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

export function getPlainTextFromHtml(html = "") {
  return String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}