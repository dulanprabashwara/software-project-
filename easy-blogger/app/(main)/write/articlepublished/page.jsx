"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, BookOpen, Share2, Tag, Check } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { API_BASE_URL } from "../../../../lib/api";
import { getDraftById } from "../../../../lib/articles/api";
import InfoCard from "../../../../components/article/InfoCard";
import PlatformItem from "../../../../components/article/PlatformItem";
import PublishStatusLayout from "../../../../components/article/PublishStatusLayout";

export default function ArticlePublishedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: firebaseUser } = useAuth();

  const articleId = searchParams.get("id") || "";

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wpConnected, setWpConnected] = useState(false);
  const [wpPostUrl, setWpPostUrl] = useState("");
  const [wpError, setWpError] = useState("");
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!articleId) {
        router.replace("/write/create");
        return;
      }

      try {
        const response = await getDraftById(articleId);
        const data = response?.data ?? response?.article ?? response ?? null;

        if (!data) {
          router.replace("/write/create");
          return;
        }

        setArticle(data);
      } catch (error) {
        console.error("Failed to load article:", error);
        router.replace("/write/create");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [articleId, router]);

  useEffect(() => {
    const checkWordPress = async () => {
      if (!firebaseUser) return;

      try {
        const token = await firebaseUser.getIdToken();
        const res = await fetch(`${API_BASE_URL}/api/wordpress/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setWpConnected(Boolean(data?.data?.connected));
      } catch {
        setWpConnected(false);
      }
    };

    void checkWordPress();
  }, [firebaseUser]);

  const handleWpRetry = useCallback(async () => {
    if (!firebaseUser || !articleId) return;

    setIsRetrying(true);
    setWpError("");

    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`${API_BASE_URL}/api/wordpress/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ articleId, scheduledAt: null }),
      });

      const data = await res.json();

      if (data?.success && data?.data?.wpPostUrl) {
        setWpPostUrl(data.data.wpPostUrl);
      } else {
        setWpError(data?.data?.message || "WordPress publish failed. Please try again.");
      }
    } catch {
      setWpError("Could not reach server. Please try again.");
    } finally {
      setIsRetrying(false);
    }
  }, [firebaseUser, articleId]);

  const platforms = useMemo(() => {
    const list = ["Easy Blogger"];
    if (wpConnected) list.push("WordPress");
    return list;
  }, [wpConnected]);

  const formattedDate = useMemo(() => {
    const rawDate = article?.publishedAt || article?.createdAt;
    if (!rawDate) return "";

    return new Date(rawDate).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, [article]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-[#eef8f5] to-[#edf2fb] flex items-center justify-center p-6">
        <p className="text-sm text-gray-500">Loading published article...</p>
      </div>
    );
  }

  if (!article) return null;

  return (
    <PublishStatusLayout
      router={router}
      headerIcon={Check}
      title="Article Published"
      subtitle="Your article is now live and reaching readers"
      dateLabel={
        <>
          <CalendarDays size={16} />
          {formattedDate}
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

      <InfoCard icon={Share2} title="Published to">
        <div className="mt-3 flex flex-wrap items-center gap-5 text-lg text-gray-600">
          {platforms.map((platform) => (
            <PlatformItem
              key={platform}
              name={platform}
              wpPostUrl={wpPostUrl}
              wpError={wpError}
              isRetrying={isRetrying}
              onRetry={handleWpRetry}
            />
          ))}
        </div>
      </InfoCard>
    </PublishStatusLayout>
  );
}