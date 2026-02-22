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