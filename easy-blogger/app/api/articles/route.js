// easy-blogger/app/api/articles/route.js
import { NextResponse } from "next/server";
import { getArticles } from "../../../lib/articles/store";

export async function GET() {
  return NextResponse.json({ articles: getArticles() }, { status: 200 });
}