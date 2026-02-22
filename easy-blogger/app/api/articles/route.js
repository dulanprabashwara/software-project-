// easy-blogger\app\api\articles\route.js


import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

const filePath = path.join(process.cwd(), "data", "articles.json");

// Read articles from file
function readArticles() {
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data || "[]");
}

// Write articles to file
function writeArticles(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function makeId() {
  return `d_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const status = searchParams.get("status");

const articles = readArticles();
  if (id) {
    const article = articles.find((a) => a.id === id);
    if (!article) return Response.json({ message: "Not found" }, { status: 404 });
    return Response.json({ article }, { status: 200 });
  }

  const filtered = status ? articles.filter((a) => a.status === status) : articles;
  return Response.json({ articles: filtered }, { status: 200 });
}

export async function POST(req) {
  const body = await req.json();
  const articles = readArticles();

  const newArticle = {
    id: makeId(),
    writerName: body.writerName || "Unknown",
    date: new Date().toISOString(),
    title: body.title || "",
    content: body.content || "",
    coverImage: body.coverImage || null,
    status: body.status || "draft",
    updatedAt: new Date().toISOString(),
  };

  articles.unshift(newArticle);
  writeArticles(articles);

  return NextResponse.json({ article: newArticle }, { status: 201 });
}

export async function PUT(req) {
  const body = await req.json();
  const { id } = body;

  const articles = readArticles();
  const index = articles.findIndex((a) => a.id === id);

  if (index === -1) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  articles[index] = {
    ...articles[index],
    ...body,
    updatedAt: new Date().toISOString(),
  };

  writeArticles(articles);

  return NextResponse.json({ article: articles[index] });
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  let articles = readArticles();
  articles = articles.filter((a) => a.id !== id);

  writeArticles(articles);

  return NextResponse.json({ message: "Deleted" });
}