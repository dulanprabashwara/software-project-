"use client";

/*
 SUCCESS PAGE: Article Published
 This page provides immediate feedback after an article is successfully published.
 It handles secondary syncs for WordPress metadata and allows users to retry if social sharing fails.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
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

export default function ArticlePublishedPage() {
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

  /*
   Loads specific publish details for WordPress if connected.
   WHY: While the main article is fetched by the shared hook, WordPress-specific 
   metadata (like the remote post ID and live URL) requires a specialized endpoint.
   */
  const loadWordPressPublishStatus = useCallback(async () => {
    // Exit if user is not authenticated or article ID is missing to prevent invalid API calls
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

      // Prioritize the live URL; if found, we clear any previous errors
      if (url) {
        setWpPostUrl(url);
        setWpError("");
        return;
      }

      // If no URL but an error message is returned, capture it for the UI retry button
      if (error) {
        setWpError(error);
      }
    } catch (error) {
      console.error("Failed to load WordPress publish status:", error);
    }
  }, [firebaseUser, articleId]);

  /*
   Syncs WordPress publish status when connection is confirmed.
   WHY: We wait for the global WordPress connection status (from usePublishStatus) 
   before attempting to fetch the specific post metadata to avoid unnecessary 401/404 errors.
   */
  useEffect(() => {
    if (wpConnected) {
      void loadWordPressPublishStatus();
    }
  }, [wpConnected, loadWordPressPublishStatus]);

  /*
   Handles retrying the WordPress publication if it failed initially.
   WHY: WordPress connections can be flaky. This allows the user to manually 
   trigger a re-publish attempt without leaving the success page.
   */
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
        // We pass scheduledAt: null to force immediate publication during a retry
        body: JSON.stringify({ articleId, scheduledAt: null }),
      });

      const data = await res.json();
      const url = getWordPressUrl(data);

      // Successful retry: update the URL and clear errors
      if (data?.success && url) {
        setWpPostUrl(url);
        setWpError("");
        return;
      }

      // Capture failure message or provide a generic fallback
      setWpError(getWordPressError(data) || "WordPress publish failed. Please try again.");
    } catch {
      setWpError("Could not reach server. Please try again.");
    } finally {
      setIsRetrying(false);
    }
  }, [firebaseUser, articleId]);

  /*
   List of platforms where the article is live.
   */
  const platforms = useMemo(() => {
    const list = ["Easy Blogger"];
    if (wpConnected) list.push("WordPress");
    return list;
  }, [wpConnected]);

  /*
   Human-readable publication date.
   WHY: If publishedAt is not yet synced in the DB, we fallback to createdAt 
   to ensure the user sees a valid timestamp for their action.
   */
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
      onButtonClick={() => router.push("/home")}
    >
      <InfoCard icon={BookOpen} title="Article title">
        <p className="mt-1 text-xl font-bold text-gray-800 leading-tight tracking-tight">{article.title}</p>
      </InfoCard>

      <InfoCard icon={Tag} title="Tags">
        <div className="mt-3 flex flex-wrap gap-2">
          {(article.tags || []).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-gray-100 bg-white px-5 py-1.5 text-sm font-semibold text-gray-600 shadow-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      </InfoCard>

      <InfoCard icon={Share2} title="Published to">
        <div className="mt-4 space-y-4 w-full">
          {platforms.map((platform) => (
            <PlatformItem
              key={platform}
              name={platform}
              wpPostUrl={platform === "WordPress" ? wpPostUrl : ""}
              wpError={platform === "WordPress" ? wpError : ""}
              isRetrying={platform === "WordPress" ? isRetrying : false}
              onRetry={platform === "WordPress" ? handleWpRetry : undefined}
            />
          ))}
        </div>
      </InfoCard>
    </PublishStatusLayout>
  );
}