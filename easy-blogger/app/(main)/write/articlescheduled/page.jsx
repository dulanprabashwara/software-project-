"use client";

/*
 SUCCESS PAGE: Article Scheduled
 This page confirms that an article has been successfully queued for future publication.
 It displays the precise timing and the platforms targeted for the scheduled release.
 */

import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, CalendarDays, Clock, Share2, Tag } from "lucide-react";
import { usePublishStatus } from "../../../../hooks/articles/usePublishStatus";
import { formatFullDate, formatFullTime } from "../../../../lib/articles/utils";
import InfoCard from "../../../../components/article/InfoCard";
import PlatformItem from "../../../../components/article/PlatformItem";
import PublishStatusLayout from "../../../../components/article/PublishStatusLayout";

function ArticleScheduledContent() {
  const {
    article,
    loading,
    wpConnected,
    router,
  } = usePublishStatus();

  /*
   List of platforms where the article is scheduled to appear.
   WHY: We check the article status for 'Easy Blogger' and look at
   the publish jobs arrays to accurately determine if LinkedIn or WordPress
   are scheduled.
   */
  const platforms = useMemo(() => {
    const list = [];
    if (article?.status === "SCHEDULED" || article?.status === "PUBLISHED") {
      list.push("Easy Blogger");
    }
    
    const validStatuses = ["PENDING", "IN_PROGRESS", "PUBLISHED", "SCHEDULED"];
    
    if (article?.wpPublishJobs?.some(job => validStatuses.includes(job.status))) {
      list.push("WordPress");
    }
    
    if (article?.liPublishJobs?.some(job => validStatuses.includes(job.status))) {
      list.push("LinkedIn");
    }
    
    return list;
  }, [article]);

  // Format the date and time from the article's scheduledAt field for the UI
  const scheduledDate = formatFullDate(article?.scheduledAt);
  const scheduledTime = formatFullTime(article?.scheduledAt);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-r from-[#eef8f5] to-[#edf2fb] flex items-center justify-center p-6">
        <p className="text-sm text-gray-500">Loading scheduled article...</p>
      </div>
    );
  }

  if (!article) return null;

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

export default function ArticleScheduledPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-linear-to-r from-[#eef8f5] to-[#edf2fb] flex items-center justify-center p-6"><p className="text-sm text-gray-500">Loading...</p></div>}>
      <ArticleScheduledContent />
    </Suspense>
  );
}