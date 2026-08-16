"use client";

/*
 SUCCESS PAGE: Article Published
 This page provides immediate feedback after an article is successfully published.
 It handles secondary syncs for WordPress metadata and allows users to retry if social sharing fails.
 */

import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, CalendarDays, Check, Share2, Tag } from "lucide-react";
import { API_BASE_URL } from "../../../../lib/api";
import { usePublishStatus } from "../../../../hooks/articles/usePublishStatus";
import { formatFullDate } from "../../../../lib/articles/utils";
import InfoCard from "../../../../components/article/InfoCard";
import PlatformItem from "../../../../components/article/PlatformItem";
import PublishStatusLayout from "../../../../components/article/PublishStatusLayout";

/*
 Extractors for WordPress job data.
 WHY: The API returns the live URL or error messages within a nested job object or a top-level property 
 depending on whether the publish is immediate or completed via a background worker.
 */
function getWordPressUrl(data) {
  return data?.data?.job?.wpPostUrl || data?.data?.wpPostUrl || "";
}

function getWordPressError(data) {
  return data?.data?.job?.errorMsg || data?.data?.message || data?.message || "";
}

function ArticlePublishedContent() {
  const {
    articleId,
    article,
    loading,
    wpConnected,
    firebaseUser,
    router,
  } = usePublishStatus();

  const [wpPostUrl, setWpPostUrl] = useState("");
  const [wpError, setWpError] = useState("");
  const [isRetrying, setIsRetrying] = useState(false);

  const [liPostUrl, setLiPostUrl] = useState("");
  const [liError, setLiError] = useState("");
  const [isLiRetrying, setIsLiRetrying] = useState(false);

  /*
   Loads specific publish details for WordPress if connected.
   */
  const loadWordPressPublishStatus = useCallback(async () => {
    if (!firebaseUser || !articleId) return;

    try {
      const token = await firebaseUser.getIdToken();

      const res = await fetch(
        `${API_BASE_URL}/api/wordpress/publish-status/${articleId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();
      if (!res.ok || !data?.success) return;

      const url = getWordPressUrl(data);
      const error = getWordPressError(data);

      if (url) {
        setWpPostUrl(url);
        setWpError("");
        return;
      }

      if (error) {
        setWpError(error);
      }
    } catch (error) {
      console.error("Failed to load WordPress publish status:", error);
    }
  }, [firebaseUser, articleId]);

  /*
   Loads specific publish details for LinkedIn.
   */
  const loadLinkedInPublishStatus = useCallback(async () => {
    if (!firebaseUser || !articleId) return;

    try {
      const token = await firebaseUser.getIdToken();

      const res = await fetch(
        `${API_BASE_URL}/api/linkedin/publish-status/${articleId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();
      if (!res.ok || !data?.success) return;

      const job = data?.data;
      if (job?.liPostUrl) {
        setLiPostUrl(job.liPostUrl);
        setLiError("");
      } else if (job?.status === "FAILED" && job?.errorMsg) {
        setLiError(job.errorMsg);
      }
    } catch (error) {
      console.error("Failed to load LinkedIn publish status:", error);
    }
  }, [firebaseUser, articleId]);

  useEffect(() => {
    if (wpConnected) {
      void loadWordPressPublishStatus();
    }
    void loadLinkedInPublishStatus();
  }, [wpConnected, loadWordPressPublishStatus, loadLinkedInPublishStatus]);

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
      const url = getWordPressUrl(data);

      if (data?.success && url) {
        setWpPostUrl(url);
        setWpError("");
        return;
      }

      setWpError(getWordPressError(data) || "WordPress publish failed. Please try again.");
    } catch {
      setWpError("Could not reach server. Please try again.");
    } finally {
      setIsRetrying(false);
    }
  }, [firebaseUser, articleId]);

  const handleLiRetry = useCallback(async () => {
    if (!firebaseUser || !articleId) return;

    setIsLiRetrying(true);
    setLiError("");

    try {
      const token = await firebaseUser.getIdToken();

      const res = await fetch(`${API_BASE_URL}/api/linkedin/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ articleId, scheduledAt: null }),
      });

      const data = await res.json();
      const result = data?.data;

      if (data?.success && result?.liPostUrl) {
        setLiPostUrl(result.liPostUrl);
        setLiError("");
        return;
      }

      setLiError(result?.message || "LinkedIn publish failed. Please try again.");
    } catch {
      setLiError("Could not reach server. Please try again.");
    } finally {
      setIsLiRetrying(false);
    }
  }, [firebaseUser, articleId]);

  const platforms = useMemo(() => {
    const list = [];
    if (article?.status === "PUBLISHED" || article?.status === "SCHEDULED") {
      list.push("Easy Blogger");
    }
    
    const validStatuses = ["PENDING", "IN_PROGRESS", "PUBLISHED", "SCHEDULED", "FAILED"];
    
    if (article?.wpPublishJobs?.some(job => validStatuses.includes(job.status))) {
      list.push("WordPress");
    }
    
    if (article?.liPublishJobs?.some(job => validStatuses.includes(job.status)) || liPostUrl || liError) {
      list.push("LinkedIn");
    }
    
    return list;
  }, [article, liPostUrl, liError]);

  const formattedDate = useMemo(() => {
    return formatFullDate(article?.publishedAt || article?.createdAt);
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
      buttonText="View your article"
      onButtonClick={() => router.push("/stories/published")}
    >
      <InfoCard icon={BookOpen} title="Article title">
        <p className="mt-0.5 text-base font-bold text-gray-800 leading-snug line-clamp-2">{article.title}</p>
      </InfoCard>

      <InfoCard icon={Tag} title="Tags">
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {(article.tags || []).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-gray-100 bg-white px-3 py-1 text-xs font-semibold text-gray-600 shadow-2xs"
            >
              {tag}
            </span>
          ))}
        </div>
      </InfoCard>

      <InfoCard icon={Share2} title="Published to">
        <div className="mt-2 space-y-2 w-full">
          {platforms.map((platform) => (
            <PlatformItem
              key={platform}
              name={platform}
              wpPostUrl={platform === "WordPress" ? wpPostUrl : ""}
              wpError={platform === "WordPress" ? wpError : ""}
              isRetrying={platform === "WordPress" ? isRetrying : false}
              onRetry={platform === "WordPress" ? handleWpRetry : undefined}
              liPostUrl={platform === "LinkedIn" ? liPostUrl : ""}
              liError={platform === "LinkedIn" ? liError : ""}
              isLiRetrying={platform === "LinkedIn" ? isLiRetrying : false}
              onLiRetry={platform === "LinkedIn" ? handleLiRetry : undefined}
            />
          ))}
        </div>
      </InfoCard>
    </PublishStatusLayout>
  );
}

export default function ArticlePublishedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-r from-[#eef8f5] to-[#edf2fb] flex items-center justify-center p-6"><p className="text-sm text-gray-500">Loading...</p></div>}>
      <ArticlePublishedContent />
    </Suspense>
  );
}