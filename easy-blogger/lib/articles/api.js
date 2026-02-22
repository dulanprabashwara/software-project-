// easy-blogger/lib/articles/api.js

export async function createDraft(payload) {
  const res = await fetch("/api/articles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create draft");
  return res.json();
}

export async function updateDraft(id, payload) {
  const res = await fetch("/api/articles", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...payload }),
  });
  if (!res.ok) throw new Error("Failed to update draft");
  return res.json();
}

export async function deleteDraft(id) {
  const res = await fetch(`/api/articles?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete draft");
  return res.json();
}