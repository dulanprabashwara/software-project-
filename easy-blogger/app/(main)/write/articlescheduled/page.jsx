"use client";

/*
 SUCCESS PAGE: Article Scheduled
 This page confirms that an article has been successfully queued for future publication.
 It displays the precise timing and the platforms targeted for the scheduled release.
 */

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, CalendarDays, Clock, Share2, Tag } from "lucide-react";
import { usePublishStatus } from "../../../../hooks/articles/usePublishStatus";
import { formatFullDate, formatFullTime } from "../../../../lib/articles/utils";
import InfoCard from "../../../../components/article/InfoCard";
import PlatformItem from "../../../../components/article/PlatformItem";
import PublishStatusLayout from "../../../../components/article/PublishStatusLayout";

export default function ArticleScheduledPage() {
  const {
    article,
    loading,
    wpConnected,
    router,
  } = usePublishStatus();

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-r from-[#eef8f5] to-[#edf2fb] flex items-center justify-center p-6">
        <p className="text-sm text-gray-500">Loading scheduled article...</p>
      </div>
    );
  }

  if (!article) return null;

  /*
   List of platforms where the article is scheduled to appear.
   WHY: We always show 'Easy Blogger' as the primary platform, 
   and dynamically add 'WordPress' only if the user has an active connection.
   */
  const platforms = ["Easy Blogger"];
  if (wpConnected) platforms.push("WordPress");

  // Format the date and time from the article's scheduledAt field for the UI
  const scheduledDate = formatFullDate(article.scheduledAt);
  const scheduledTime = formatFullTime(article.scheduledAt);

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

      <InfoCard icon={CalendarDays} title="Scheduled for">
        <p className="mt-1 text-lg font-semibold text-gray-800">
          {scheduledDate} at {scheduledTime}
        </p>
      </InfoCard>

      <InfoCard icon={Share2} title="Will also share to">
        <div className="mt-4 space-y-4 w-full">
          {platforms.map((platform) => (
            <PlatformItem key={platform} name={platform} />
          ))}
        </div>
      </InfoCard>
    </PublishStatusLayout>
  );
}