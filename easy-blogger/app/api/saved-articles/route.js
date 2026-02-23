export const runtime = "nodejs";

import fs from "fs/promises";
import path from "path";

const filePath = path.join(process.cwd(), "data", "savedArticles.json");

async function readSaved() {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeSaved(list) {
  await fs.writeFile(filePath, JSON.stringify(list, null, 2), "utf-8");
}

export async function POST(req) {
  const { article } = await req.json();
  if (!article?.id) return Response.json({ error: "Missing article.id" }, { status: 400 });

  const existing = await readSaved();
  const already = existing.some((a) => String(a.id) === String(article.id));

  if (!already) {
    existing.unshift(article);
    await writeSaved(existing);
  }

  return Response.json({ ok: true });
}

export async function DELETE(req) {
  const { id } = await req.json();
  if (id === undefined || id === null) return Response.json({ error: "Missing id" }, { status: 400 });

  const existing = await readSaved();
  const updated = existing.filter((a) => String(a.id) !== String(id));

  await writeSaved(updated);
  return Response.json({ ok: true });
}