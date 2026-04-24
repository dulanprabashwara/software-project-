"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, CalendarDays, Clock, Share2, Tag } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { API_BASE_URL } from "../../../../lib/api";
import { getDraftById } from "../../../../lib/articles/api";
import InfoCard from "../../../../components/article/InfoCard";
import PlatformItem from "../../../../components/article/PlatformItem";
import PublishStatusLayout from "../../../../components/article/PublishStatusLayout";

function buildPlatforms({ wpConnected }) {
  const platforms = ["Easy Blogger"];
  if (wpConnected) platforms.push("WordPress");
  return platforms;
}

function formatScheduledDate(dateValue) {
  if (!dateValue) return "";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatScheduledTime(dateValue) {
  if (!dateValue) return "";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ArticleScheduledPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: firebaseUser } = useAuth();

  const articleId = searchParams.get("id") || "";

  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [wpConnected, setWpConnected] = useState(false);

  useEffect(() => {
    const loadScheduledArticle = async () => {
      if (!articleId) {
        router.replace("/write/create");
        return;
      }

      try {
        setIsLoading(true);

        const response = await getDraftById(articleId);
        const fetchedArticle =
          response?.data ?? response?.article ?? response ?? null;

        if (!fetchedArticle) {
          router.replace("/write/create");
          return;
        }

        setArticle(fetchedArticle);
      } catch (error) {
        console.error("Failed to load scheduled article:", error);
        router.replace("/write/create");
      } finally {
        setIsLoading(false);
      }
    };

    void loadScheduledArticle();
  }, [articleId, router]);

  useEffect(() => {
    const checkWordPressStatus = async () => {
      if (!firebaseUser) return;

      try {
        const token = await firebaseUser.getIdToken();
        const res = await fetch(`${API_BASE_URL}/api/wordpress/status`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setWpConnected(Boolean(data?.data?.connected));
      } catch {
        setWpConnected(false);
      }
    };

    void checkWordPressStatus();
  }, [firebaseUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-r from-[#eef8f5] to-[#edf2fb] flex items-center justify-center p-6">
        <p className="text-sm text-gray-500">Loading scheduled article...</p>
      </div>
    );
  }

  if (!article) return null;

  const platforms = buildPlatforms({ wpConnected });
  const scheduledDate = formatScheduledDate(article.scheduledAt);
  const scheduledTime = formatScheduledTime(article.scheduledAt);

  return (
    <PublishStatusLayout
      router={router}
      headerIcon={CalendarDays}
      title="Article Scheduled"
      subtitle="Your article is scheduled and will be published soon"
      dateLabel={
        <>
          <CalendarDays size={16} />
          {scheduledDate}
          <Clock size={16} />
          {scheduledTime}
        </>
      }
      onButtonClick={() => router.push("/home")}
    >
      <InfoCard icon={BookOpen} title="Article title">
        <p className="mt-1 text-2xl text-gray-700">{article.title}</p>
      </InfoCard>

      <InfoCard icon={Tag} title="Tags">
        <div className="mt-3 flex flex-wrap gap-2">
          {(article.tags || []).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-gray-300 bg-gray-50 px-4 py-1 text-sm text-gray-600"
            >
              {tag}
            </span>
          ))}
        </div>
      </InfoCard>

      <InfoCard icon={CalendarDays} title="Scheduled for">
        <p className="mt-1 text-gray-700">
          {scheduledDate} at {scheduledTime}
        </p>
      </InfoCard>

      <InfoCard icon={Share2} title="Will also share to">
        <div className="mt-3 flex flex-wrap items-center gap-5 text-lg text-gray-600">
          {platforms.map((platform) => (
            <PlatformItem key={platform} platform={platform} />
          ))}
        </div>
      </InfoCard>
    </PublishStatusLayout>
  );
}