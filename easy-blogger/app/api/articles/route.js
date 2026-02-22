// easy-blogger/app/api/articles/route.js
import { NextResponse } from "next/server";
import { getArticles, setArticles, makeId } from "../../../lib/articles/store";

export async function GET() {
  return NextResponse.json({ articles: getArticles() }, { status: 200 });
}

export async function POST(req) {
  try {
    const body = await req.json();

    const newArticle = {
      id: makeId(),
      writerName: body.writerName || "Unknown Writer",
      date: new Date().toISOString(),
      title: body.title || "",
      coverImage: body.coverImage || null,
      content: body.content || "",
      status: body.status || "draft",
      updatedAt: new Date().toISOString(),
    };

    const current = getArticles();
    setArticles([newArticle, ...current]);

    return NextResponse.json({ article: newArticle }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ message: "id is required" }, { status: 400 });
    }

    const current = getArticles();
    const index = current.findIndex((a) => a.id === id);

    if (index === -1) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const existing = current[index];
    const updated = {
      ...existing,
      title: body.title ?? existing.title,
      content: body.content ?? existing.content,
      coverImage: body.coverImage ?? existing.coverImage,
      status: body.status ?? existing.status,
      updatedAt: new Date().toISOString(),
    };

    const next = [...current];
    next[index] = updated;
    setArticles(next);

    return NextResponse.json({ article: updated }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }
}