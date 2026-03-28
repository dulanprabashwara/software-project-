"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, Tag, Share2, CalendarDays, X, Check } from "lucide-react";

export default function ArticlePublishedPage() {
  const router = useRouter();
  const [publishedData, setPublishedData] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("published_article_data");

    if (!raw) {
      router.replace("/write/publish");
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      setPublishedData(parsed);
    } catch {
      router.replace("/write/publish");
    }
  }, [router]);

  if (!publishedData) return null;

  const { title, tags, platforms, timing, scheduledDate, scheduledTime } = publishedData;

  const formatPublishDate = () => {
    if (timing === "now") {
      return new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }

    if (scheduledDate && scheduledTime) {
      const date = new Date(`${scheduledDate}T${scheduledTime}`);
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }

    return "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#eef8f5] to-[#edf2fb] flex items-center justify-center p-6">
      <div className="w-full max-w-[570px] overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-xl">
        <div className="relative bg-gradient-to-br from-[#21c4a7] to-[#18af98] px-8 py-10 text-center">
          <button
            onClick={() => router.push("/write/publish")}
            className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-gray-700"
          >
            <X size={18} />
          </button>

          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/60 text-white">
            <Check size={40} />
          </div>

          <h1 className="font-serif text-5xl text-white">Article Published</h1>

          <p className="mt-4 text-lg text-[#17352f]">
            Your article is now live and reaching readers
          </p>

          <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2 text-sm font-semibold text-white">
            <CalendarDays size={16} />
            {formatPublishDate()}
          </div>
        </div>

        <div className="space-y-5 bg-[#f7f8f8] p-8">
          <div className="rounded-3xl border border-gray-200 bg-white px-5 py-5 shadow-md">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                <BookOpen size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Article title</p>
                <p className="mt-1 text-2xl text-gray-700">{title}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white px-5 py-5 shadow-md">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                <Tag size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Tags</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags?.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-gray-300 bg-gray-50 px-4 py-1 text-sm text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white px-5 py-5 shadow-md">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                <Share2 size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Published to</p>
                <div className="mt-3 flex flex-wrap items-center gap-5 text-lg text-gray-600">
                  {platforms?.map((platform) => (
                    <span key={platform}>{platform}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push("/home")}
            className="w-full rounded-3xl bg-[#21c4a7] py-4 text-xl font-semibold text-white shadow-md hover:bg-[#1ab89d]"
          >
            View Your Article →
          </button>
        </div>
      </div>
    </div>
  );
}